import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AnalyticsEventEntity } from '../../domain/entities/analytics-event.entity';

/**
 * Analytics event repository.
 * ANALYTICS_EVENTS таблицын CRUD үйлдлүүд.
 */
@Injectable()
export class AnalyticsEventRepository {
  private readonly logger = new Logger(AnalyticsEventRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ event бүртгэх */
  async create(data: {
    userId?: string | null;
    eventName: string;
    eventCategory: string;
    properties?: Record<string, unknown> | null;
    sessionId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<AnalyticsEventEntity> {
    const event = await this.prisma.analyticsEvent.create({
      data: {
        userId: data.userId ?? null,
        eventName: data.eventName,
        eventCategory: data.eventCategory,
        properties: data.properties ? (data.properties as Prisma.InputJsonValue) : Prisma.JsonNull,
        sessionId: data.sessionId ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });

    return this.toEntity(event);
  }

  /** ID-аар event олох */
  async findById(id: string): Promise<AnalyticsEventEntity | null> {
    const event = await this.prisma.analyticsEvent.findUnique({
      where: { id },
    });

    return event ? this.toEntity(event) : null;
  }

  /** Event жагсаалт pagination + filter-тэй */
  async findMany(options: {
    page: number;
    limit: number;
    eventName?: string;
    eventCategory?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{
    data: AnalyticsEventEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Record<string, unknown> = {};

    if (options.eventName) {
      where.eventName = options.eventName;
    }
    if (options.eventCategory) {
      where.eventCategory = options.eventCategory;
    }
    if (options.userId) {
      where.userId = options.userId;
    }
    if (options.dateFrom || options.dateTo) {
      where.createdAt = {
        ...(options.dateFrom && { gte: options.dateFrom }),
        ...(options.dateTo && { lte: options.dateTo }),
      };
    }

    const [events, total] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.analyticsEvent.count({ where }),
    ]);

    return {
      data: events.map((event) => this.toEntity(event)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Prisma object-ийг entity руу хөрвүүлэх */
  private toEntity(event: {
    id: string;
    userId: string | null;
    eventName: string;
    eventCategory: string;
    properties: unknown;
    sessionId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  }): AnalyticsEventEntity {
    return new AnalyticsEventEntity({
      id: event.id,
      userId: event.userId,
      eventName: event.eventName,
      eventCategory: event.eventCategory,
      properties: event.properties as Record<string, unknown> | null,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      createdAt: event.createdAt,
    });
  }
}
