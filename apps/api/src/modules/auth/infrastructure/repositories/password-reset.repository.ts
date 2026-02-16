import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { PasswordResetEntity } from '../../domain/entities/password-reset.entity';

/**
 * Нууц үг сэргээх repository.
 * Мэдээллийн сантай харьцах нууц үг сэргээлтийн CRUD үйлдлүүд.
 */
@Injectable()
export class PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ нууц үг сэргээх бичлэг үүсгэнэ */
  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<PasswordResetEntity> {
    const reset = await this.prisma.passwordReset.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
    return new PasswordResetEntity(reset);
  }

  /** Хэшлэгдсэн токеноор хүчинтэй нууц үг сэргээх бичлэг хайна */
  async findValidByToken(hashedToken: string): Promise<PasswordResetEntity | null> {
    const reset = await this.prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });
    return reset ? new PasswordResetEntity(reset) : null;
  }

  /** Нууц үг сэргээх бичлэгийг ашигласан гэж тэмдэглэнэ */
  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { id },
      data: { used: true },
    });
  }
}
