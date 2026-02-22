import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { LiveSessionStatus, Prisma } from '@prisma/client';

/** Prisma include — session query бүрт ашиглагдана */
const SESSION_INCLUDE = {
  lesson: {
    select: {
      title: true,
      courseId: true,
      course: { select: { title: true } },
    },
  },
  instructor: {
    select: {
      profile: { select: { firstName: true, lastName: true } },
    },
  },
  _count: { select: { attendees: true } },
};

/**
 * Live session-ийн repository.
 * PostgreSQL-тэй Prisma ORM-аар харьцана.
 */
@Injectable()
export class LiveSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ session үүсгэнэ */
  async create(data: {
    lessonId: string;
    instructorId: string;
    title: string;
    description?: string;
    scheduledStart: Date;
    scheduledEnd: Date;
  }): Promise<LiveSessionEntity> {
    const session = await this.prisma.liveSession.create({
      data: {
        lessonId: data.lessonId,
        instructorId: data.instructorId,
        title: data.title,
        description: data.description,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
      },
      include: SESSION_INCLUDE,
    });

    return this.toEntity(session);
  }

  /** ID-аар хайна */
  async findById(id: string): Promise<LiveSessionEntity | null> {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
      include: SESSION_INCLUDE,
    });

    return session ? this.toEntity(session) : null;
  }

  /** lessonId-аар хайна (unique) */
  async findByLessonId(lessonId: string): Promise<LiveSessionEntity | null> {
    const session = await this.prisma.liveSession.findUnique({
      where: { lessonId },
      include: SESSION_INCLUDE,
    });

    return session ? this.toEntity(session) : null;
  }

  /** meetingId-аар хайна (webhook-д ашиглагдана) */
  async findByMeetingId(meetingId: string): Promise<LiveSessionEntity | null> {
    const session = await this.prisma.liveSession.findFirst({
      where: { meetingId },
      include: SESSION_INCLUDE,
    });

    return session ? this.toEntity(session) : null;
  }

  /** Сургалтын session-ууд (courseId-аар, pagination + filter) */
  async findByCourseId(
    courseId: string,
    options: {
      page: number;
      limit: number;
      status?: string;
      timeFilter?: string;
    },
  ): Promise<{
    data: LiveSessionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, status, timeFilter } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.LiveSessionWhereInput = {
      lesson: { courseId },
    };

    if (status) {
      where.status = status.toUpperCase() as LiveSessionStatus;
    }

    if (timeFilter === 'upcoming') {
      where.scheduledStart = { gte: new Date() };
    } else if (timeFilter === 'past') {
      where.scheduledEnd = { lt: new Date() };
    }

    const [sessions, total] = await Promise.all([
      this.prisma.liveSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledStart: 'asc' },
        include: SESSION_INCLUDE,
      }),
      this.prisma.liveSession.count({ where }),
    ]);

    return {
      data: sessions.map((s) => this.toEntity(s)),
      total,
      page,
      limit,
    };
  }

  /** Удахгүй эхлэх session-ууд (SCHEDULED + LIVE, scheduledStart >= now) */
  async findUpcoming(options: { page: number; limit: number }): Promise<{
    data: LiveSessionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.LiveSessionWhereInput = {
      status: { in: ['SCHEDULED', 'LIVE'] },
      scheduledStart: { gte: new Date() },
    };

    const [sessions, total] = await Promise.all([
      this.prisma.liveSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledStart: 'asc' },
        include: SESSION_INCLUDE,
      }),
      this.prisma.liveSession.count({ where }),
    ]);

    return {
      data: sessions.map((s) => this.toEntity(s)),
      total,
      page,
      limit,
    };
  }

  /** Шинэчлэх */
  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      scheduledStart: Date;
      scheduledEnd: Date;
      actualStart: Date;
      actualEnd: Date;
      meetingUrl: string;
      meetingId: string;
      recordingUrl: string;
      status: string;
    }>,
  ): Promise<LiveSessionEntity> {
    const updateData: Prisma.LiveSessionUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.scheduledStart !== undefined) updateData.scheduledStart = data.scheduledStart;
    if (data.scheduledEnd !== undefined) updateData.scheduledEnd = data.scheduledEnd;
    if (data.actualStart !== undefined) updateData.actualStart = data.actualStart;
    if (data.actualEnd !== undefined) updateData.actualEnd = data.actualEnd;
    if (data.meetingUrl !== undefined) updateData.meetingUrl = data.meetingUrl;
    if (data.meetingId !== undefined) updateData.meetingId = data.meetingId;
    if (data.recordingUrl !== undefined) updateData.recordingUrl = data.recordingUrl;
    if (data.status !== undefined)
      updateData.status = data.status.toUpperCase() as LiveSessionStatus;

    const session = await this.prisma.liveSession.update({
      where: { id },
      data: updateData,
      include: SESSION_INCLUDE,
    });

    return this.toEntity(session);
  }

  /** Устгах */
  async delete(id: string): Promise<void> {
    await this.prisma.liveSession.delete({ where: { id } });
  }

  /** Prisma объектийг LiveSessionEntity болгож хөрвүүлнэ */
  private toEntity(session: any): LiveSessionEntity {
    const profile = session.instructor?.profile;
    const instructorName =
      profile?.firstName || profile?.lastName
        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
        : undefined;

    return new LiveSessionEntity({
      id: session.id,
      lessonId: session.lessonId,
      instructorId: session.instructorId,
      title: session.title,
      description: session.description,
      scheduledStart: session.scheduledStart,
      scheduledEnd: session.scheduledEnd,
      actualStart: session.actualStart,
      actualEnd: session.actualEnd,
      meetingUrl: session.meetingUrl,
      meetingId: session.meetingId,
      recordingUrl: session.recordingUrl,
      status: session.status.toLowerCase(),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      lessonTitle: session.lesson?.title,
      courseId: session.lesson?.courseId,
      courseTitle: session.lesson?.course?.title,
      instructorName,
      attendeeCount: session._count?.attendees,
    });
  }
}
