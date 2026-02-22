import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';

/** Audit log жагсаалт авах use case */
@Injectable()
export class ListAuditLogsUseCase {
  private readonly logger = new Logger(ListAuditLogsUseCase.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(params: {
    page: number;
    limit: number;
    userId?: string;
    entityType?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const result = await this.auditLogRepository.findMany({
      page: params.page,
      limit: params.limit,
      userId: params.userId,
      entityType: params.entityType,
      action: params.action,
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
    });

    return {
      data: result.data.map((log) => log.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
