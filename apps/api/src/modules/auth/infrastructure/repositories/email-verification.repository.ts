import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EmailVerificationEntity } from '../../domain/entities/email-verification.entity';

/**
 * Имэйл баталгаажуулалтын repository.
 * Токен үүсгэх, хайх, ашигласан гэж тэмдэглэх үйлдлүүд.
 */
@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ баталгаажуулалтын токен бичлэг үүсгэнэ */
  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<EmailVerificationEntity> {
    const record = await this.prisma.emailVerification.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
    return new EmailVerificationEntity(record);
  }

  /** Хэшлэгдсэн токеноор хүчинтэй бичлэг хайна */
  async findValidByToken(hashedToken: string): Promise<EmailVerificationEntity | null> {
    const record = await this.prisma.emailVerification.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });
    return record ? new EmailVerificationEntity(record) : null;
  }

  /** Токеныг ашигласан гэж тэмдэглэнэ */
  async markAsUsed(id: string): Promise<void> {
    await this.prisma.emailVerification.update({
      where: { id },
      data: { used: true },
    });
  }
}
