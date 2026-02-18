import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { NotificationEntity } from '../../domain/entities/notification.entity';

/**
 * Мэдэгдлийн repository.
 * Мэдээллийн сантай харьцах мэдэгдлийн CRUD үйлдлүүд.
 */
@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ мэдэгдэл үүсгэнэ */
  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown> | null;
  }): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        data: (data.data as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });

    return this.toEntity(notification);
  }

  /** Олон мэдэгдэл нэг дор үүсгэнэ */
  async createMany(
    items: {
      userId: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, unknown> | null;
    }[],
  ): Promise<number> {
    const result = await this.prisma.notification.createMany({
      data: items.map((item) => ({
        userId: item.userId,
        type: item.type as any,
        title: item.title,
        message: item.message,
        data: (item.data as Prisma.InputJsonValue) ?? Prisma.DbNull,
      })),
    });

    return result.count;
  }

  /** ID-аар мэдэгдэл хайна */
  async findById(id: string): Promise<NotificationEntity | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    return notification ? this.toEntity(notification) : null;
  }

  /** Хэрэглэгчийн мэдэгдлүүдийн жагсаалт (pagination + filter) */
  async findByUserId(
    userId: string,
    options: {
      page: number;
      limit: number;
      type?: string;
      read?: boolean;
    },
  ): Promise<{
    data: NotificationEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (options.page - 1) * options.limit;
    const where: Prisma.NotificationWhereInput = { userId };

    if (options.type) {
      where.type = options.type as any;
    }
    if (options.read !== undefined) {
      where.read = options.read;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications.map((n) => this.toEntity(n)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Уншаагүй мэдэгдлийн тоо */
  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /** Мэдэгдлийг уншсан болгоно */
  async markAsRead(id: string): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return this.toEntity(notification);
  }

  /** Хэрэглэгчийн бүх уншаагүй мэдэгдлийг уншсан болгоно */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /** Мэдэгдэл устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({ where: { id } });
  }

  /** Prisma объектийг NotificationEntity болгож хөрвүүлнэ */
  private toEntity(data: any): NotificationEntity {
    return new NotificationEntity({
      id: data.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data as Record<string, unknown> | null,
      read: data.read,
      sentAt: data.sentAt,
      readAt: data.readAt,
      createdAt: data.createdAt,
    });
  }
}
