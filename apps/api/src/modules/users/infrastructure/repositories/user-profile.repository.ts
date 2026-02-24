import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { Role, Prisma } from '@prisma/client';

/**
 * Хэрэглэгчийн профайлын repository.
 * Мэдээллийн сантай харьцах профайлын CRUD үйлдлүүд.
 */
@Injectable()
export class UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ профайл үүсгэнэ */
  async create(data: {
    userId: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserProfileEntity> {
    const profile = await this.prisma.userProfile.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
    return new UserProfileEntity(profile);
  }

  /** userId-аар профайл хайна */
  async findByUserId(userId: string): Promise<UserProfileEntity | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });
    return profile ? new UserProfileEntity(profile) : null;
  }

  /** Профайл шинэчлэнэ */
  async update(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      bio?: string;
      country?: string;
      timezone?: string;
      preferences?: Record<string, unknown>;
    },
  ): Promise<UserProfileEntity> {
    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        ...data,
        preferences: data.preferences as Prisma.InputJsonValue | undefined,
      },
    });
    return new UserProfileEntity(profile);
  }

  /** Профайл устгана */
  async delete(userId: string): Promise<void> {
    await this.prisma.userProfile.delete({
      where: { userId },
    });
  }

  /** Хэрэглэгчдийн жагсаалт (User + Profile) pagination-тэй */
  async findManyWithUser(options: {
    page: number;
    limit: number;
    role?: Role;
    emailVerified?: boolean;
  }): Promise<{
    data: Array<{
      id: string;
      email: string;
      role: Role;
      emailVerified: boolean;
      createdAt: Date;
      profile: UserProfileEntity | null;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Record<string, unknown> = {};
    if (options.role) where.role = options.role;
    if (options.emailVerified !== undefined) where.emailVerified = options.emailVerified;
    const skip = (options.page - 1) * options.limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: { profile: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profile: user.profile ? new UserProfileEntity(user.profile) : null,
      })),
      total,
      page: options.page,
      limit: options.limit,
    };
  }
}
