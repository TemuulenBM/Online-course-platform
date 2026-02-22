import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SessionAttendeeEntity } from '../../domain/entities/session-attendee.entity';

/** Prisma include — attendee query бүрт */
const ATTENDEE_INCLUDE = {
  user: {
    select: {
      email: true,
      profile: { select: { firstName: true, lastName: true } },
    },
  },
};

/**
 * Session оролцогчийн repository.
 * Ирц бүртгэх, гарах, жагсаалт авах үйлдлүүд.
 */
@Injectable()
export class SessionAttendeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Оролцогч бүртгэх (upsert — дахин нэгдэхэд joinedAt шинэчлэгдэнэ) */
  async upsert(data: { liveSessionId: string; userId: string }): Promise<SessionAttendeeEntity> {
    const attendee = await this.prisma.sessionAttendee.upsert({
      where: {
        liveSessionId_userId: {
          liveSessionId: data.liveSessionId,
          userId: data.userId,
        },
      },
      create: {
        liveSessionId: data.liveSessionId,
        userId: data.userId,
        joinedAt: new Date(),
      },
      update: {
        joinedAt: new Date(),
        leftAt: null,
        durationMinutes: 0,
      },
      include: ATTENDEE_INCLUDE,
    });

    return this.toEntity(attendee);
  }

  /** Гарах үед шинэчлэх — leftAt + durationMinutes тооцоолол */
  async markLeft(liveSessionId: string, userId: string): Promise<SessionAttendeeEntity | null> {
    const attendee = await this.prisma.sessionAttendee.findUnique({
      where: {
        liveSessionId_userId: { liveSessionId, userId },
      },
    });

    if (!attendee || attendee.leftAt) return null;

    const durationMinutes = Math.round((Date.now() - attendee.joinedAt.getTime()) / (1000 * 60));

    const updated = await this.prisma.sessionAttendee.update({
      where: { id: attendee.id },
      data: {
        leftAt: new Date(),
        durationMinutes: Math.max(durationMinutes, 1),
      },
      include: ATTENDEE_INCLUDE,
    });

    return this.toEntity(updated);
  }

  /** Session-ийн бүх оролцогчийг гарсан гэж тэмдэглэх (session дуусахад) */
  async markAllLeft(liveSessionId: string): Promise<void> {
    const now = new Date();
    const activeAttendees = await this.prisma.sessionAttendee.findMany({
      where: { liveSessionId, leftAt: null },
    });

    if (activeAttendees.length === 0) return;

    await this.prisma.$transaction(
      activeAttendees.map((a) => {
        const durationMinutes = Math.max(
          Math.round((now.getTime() - a.joinedAt.getTime()) / (1000 * 60)),
          1,
        );
        return this.prisma.sessionAttendee.update({
          where: { id: a.id },
          data: { leftAt: now, durationMinutes },
        });
      }),
    );
  }

  /** Session-ийн оролцогчид (pagination) */
  async findBySessionId(
    liveSessionId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: SessionAttendeeEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [attendees, total] = await Promise.all([
      this.prisma.sessionAttendee.findMany({
        where: { liveSessionId },
        skip,
        take: limit,
        orderBy: { joinedAt: 'asc' },
        include: ATTENDEE_INCLUDE,
      }),
      this.prisma.sessionAttendee.count({ where: { liveSessionId } }),
    ]);

    return {
      data: attendees.map((a) => this.toEntity(a)),
      total,
      page,
      limit,
    };
  }

  /** Хэрэглэгч session-д оролцож байгаа эсэх */
  async findBySessionAndUser(
    liveSessionId: string,
    userId: string,
  ): Promise<SessionAttendeeEntity | null> {
    const attendee = await this.prisma.sessionAttendee.findUnique({
      where: {
        liveSessionId_userId: { liveSessionId, userId },
      },
      include: ATTENDEE_INCLUDE,
    });

    return attendee ? this.toEntity(attendee) : null;
  }

  /** Session-ийн бүх оролцогчийн userId жагсаалт */
  async findUserIdsBySessionId(liveSessionId: string): Promise<string[]> {
    const attendees = await this.prisma.sessionAttendee.findMany({
      where: { liveSessionId },
      select: { userId: true },
    });
    return attendees.map((a) => a.userId);
  }

  /** Prisma объектийг SessionAttendeeEntity болгож хөрвүүлнэ */
  private toEntity(attendee: any): SessionAttendeeEntity {
    const profile = attendee.user?.profile;
    const userName =
      profile?.firstName || profile?.lastName
        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
        : undefined;

    return new SessionAttendeeEntity({
      id: attendee.id,
      liveSessionId: attendee.liveSessionId,
      userId: attendee.userId,
      joinedAt: attendee.joinedAt,
      leftAt: attendee.leftAt,
      durationMinutes: attendee.durationMinutes,
      createdAt: attendee.createdAt,
      userName,
      userEmail: attendee.user?.email,
    });
  }
}
