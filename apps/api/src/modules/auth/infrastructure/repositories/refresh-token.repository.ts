import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';

/**
 * Refresh token repository.
 * Мэдээллийн сантай харьцах refresh token-ий CRUD үйлдлүүд.
 */
@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ refresh token үүсгэнэ */
  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<RefreshTokenEntity> {
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
    return new RefreshTokenEntity(refreshToken);
  }

  /** Хэшлэгдсэн токеноор refresh token хайна (цуцлагдаагүй, хугацаа дуусаагүй) */
  async findByToken(hashedToken: string): Promise<RefreshTokenEntity | null> {
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        token: hashedToken,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
    return token ? new RefreshTokenEntity(token) : null;
  }

  /** Refresh token-ийг цуцална */
  async revoke(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }

  /** Хэрэглэгчийн бүх refresh token-ийг цуцална */
  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}
