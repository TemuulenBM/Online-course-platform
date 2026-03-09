import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Failed job үүсгэхэд шаардлагатай өгөгдөл */
export interface CreateFailedJobData {
  queueName: string;
  jobName: string;
  jobId: string;
  jobData: Record<string, unknown>;
  errorMessage: string;
  errorStack?: string | null;
  attemptsMade: number;
  severity: string;
}

/** Failed job жагсаалтын query */
export interface ListFailedJobsQuery {
  page: number;
  limit: number;
  queueName?: string;
  severity?: string;
  status?: string;
}

/**
 * DLQ Repository — Failed job-уудын CRUD.
 * PostgreSQL дээр Prisma-аар ажиллана.
 */
@Injectable()
export class DlqRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ failed job үүсгэх */
  async create(data: CreateFailedJobData) {
    return this.prisma.failedJob.create({
      data: {
        queueName: data.queueName,
        jobName: data.jobName,
        jobId: data.jobId,
        jobData: data.jobData as Prisma.InputJsonValue,
        errorMessage: data.errorMessage,
        errorStack: data.errorStack,
        attemptsMade: data.attemptsMade,
        severity: data.severity,
      },
    });
  }

  /** ID-аар олох */
  async findById(id: string) {
    return this.prisma.failedJob.findUnique({ where: { id } });
  }

  /** Жагсаалт (pagination, filter) */
  async findMany(query: ListFailedJobsQuery) {
    const where: Record<string, unknown> = {};
    if (query.queueName) where.queueName = query.queueName;
    if (query.severity) where.severity = query.severity;
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.failedJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.failedJob.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  /** PENDING статустай failed job-уудын тоо */
  async countPending() {
    return this.prisma.failedJob.count({
      where: { status: 'PENDING' },
    });
  }

  /** Status шинэчлэх (retry, resolve, ignore) */
  async updateStatus(id: string, status: string, resolvedBy?: string) {
    return this.prisma.failedJob.update({
      where: { id },
      data: {
        status,
        resolvedBy,
        resolvedAt: resolvedBy ? new Date() : undefined,
      },
    });
  }
}
