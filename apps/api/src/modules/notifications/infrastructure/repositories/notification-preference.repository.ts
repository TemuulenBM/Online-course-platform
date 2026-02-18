import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';

/**
 * Мэдэгдлийн тохиргооны repository.
 * Мэдээллийн сантай харьцах preference CRUD үйлдлүүд.
 */
@Injectable()
export class NotificationPreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Хэрэглэгчийн тохиргоог хайна */
  async findByUserId(userId: string): Promise<NotificationPreferenceEntity | null> {
    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    return preference ? this.toEntity(preference) : null;
  }

  /** Тохиргоо upsert хийнэ — байвал update, байхгүй бол create */
  async upsert(
    userId: string,
    data: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      smsEnabled?: boolean;
      channelPreferences?: Record<string, unknown>;
    },
  ): Promise<NotificationPreferenceEntity> {
    const preference = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        emailEnabled: data.emailEnabled ?? true,
        pushEnabled: data.pushEnabled ?? true,
        smsEnabled: data.smsEnabled ?? false,
        channelPreferences: (data.channelPreferences as Prisma.InputJsonValue) ?? {},
      },
      update: {
        ...(data.emailEnabled !== undefined && {
          emailEnabled: data.emailEnabled,
        }),
        ...(data.pushEnabled !== undefined && {
          pushEnabled: data.pushEnabled,
        }),
        ...(data.smsEnabled !== undefined && { smsEnabled: data.smsEnabled }),
        ...(data.channelPreferences !== undefined && {
          channelPreferences: data.channelPreferences as Prisma.InputJsonValue,
        }),
      },
    });

    return this.toEntity(preference);
  }

  /** Prisma объектийг NotificationPreferenceEntity болгож хөрвүүлнэ */
  private toEntity(data: any): NotificationPreferenceEntity {
    return new NotificationPreferenceEntity({
      id: data.id,
      userId: data.userId,
      emailEnabled: data.emailEnabled,
      pushEnabled: data.pushEnabled,
      smsEnabled: data.smsEnabled,
      channelPreferences: data.channelPreferences as Record<string, unknown> | null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
