import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SessionEntity } from '../../domain/entities/session.entity';

/**
 * Сессийн repository.
 * Мэдээллийн сантай харьцах сессийн CRUD үйлдлүүд.
 */
@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ сесси үүсгэнэ */
  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<SessionEntity> {
    const session = await this.prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
    return new SessionEntity(session);
  }

  /** Токеноор сесси хайна */
  async findByToken(token: string): Promise<SessionEntity | null> {
    const session = await this.prisma.session.findFirst({ where: { token } });
    return session ? new SessionEntity(session) : null;
  }

  /** Токеноор сесси устгана */
  async deleteByToken(token: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { token } });
  }

  /** Хэрэглэгчийн бүх сессийг устгана */
  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}
