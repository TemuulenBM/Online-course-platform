import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

/**
 * Audit log repository.
 * AUDIT_LOGS таблицын CRUD үйлдлүүд.
 */
@Injectable()
export class AuditLogRepository {
  private readonly logger = new Logger(AuditLogRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ audit log бүртгэх */
  async create(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<AuditLogEntity> {
    const log = await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes ? (data.changes as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return this.toEntity(log);
  }

  /** ID-аар audit log олох */
  async findById(id: string): Promise<AuditLogEntity | null> {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return log ? this.toEntity(log) : null;
  }

  /** Audit log жагсаалт pagination + filter-тэй */
  async findMany(options: {
    page: number;
    limit: number;
    userId?: string;
    entityType?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{
    data: AuditLogEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Record<string, unknown> = {};

    if (options.userId) {
      where.userId = options.userId;
    }
    if (options.entityType) {
      where.entityType = options.entityType;
    }
    if (options.action) {
      where.action = options.action;
    }
    if (options.dateFrom || options.dateTo) {
      where.createdAt = {
        ...(options.dateFrom && { gte: options.dateFrom }),
        ...(options.dateTo && { lte: options.dateTo }),
      };
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => this.toEntity(log)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Entity-ийн audit trail */
  async findByEntity(
    entityType: string,
    entityId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: AuditLogEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where = { entityType, entityId };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => this.toEntity(log)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Сүүлийн N audit log (dashboard activity) */
  async findRecent(limit: number): Promise<AuditLogEntity[]> {
    const logs = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return logs.map((log) => this.toEntity(log));
  }

  /** Prisma object-ийг entity руу хөрвүүлэх */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toEntity(log: any): AuditLogEntity {
    const userName =
      log.user?.profile?.firstName || log.user?.profile?.lastName
        ? `${log.user.profile.firstName ?? ''} ${log.user.profile.lastName ?? ''}`.trim()
        : null;

    return new AuditLogEntity({
      id: log.id,
      userId: log.userId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: log.changes as Record<string, unknown> | null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt,
      userName,
      userEmail: log.user?.email ?? null,
    });
  }
}
