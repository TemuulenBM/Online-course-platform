import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { Role } from '@prisma/client';

/**
 * Хэрэглэгчийн repository.
 * Мэдээллийн сантай харьцах хэрэглэгчийн CRUD үйлдлүүд.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Имэйл хаягаар хэрэглэгч хайна */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? new UserEntity(user) : null;
  }

  /** ID-аар хэрэглэгч хайна */
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? new UserEntity(user) : null;
  }

  /** Шинэ хэрэглэгч үүсгэнэ */
  async create(data: {
    email: string;
    passwordHash: string;
    role?: Role;
  }): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'STUDENT',
      },
    });
    return new UserEntity(user);
  }

  /** Хэрэглэгчийн нууц үг шинэчлэнэ */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  /** Хэрэглэгчийн сүүлийн нэвтрэлтийн цагийг шинэчлэнэ */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
