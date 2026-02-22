import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';

/** Entity-ийн audit trail авах use case */
@Injectable()
export class GetEntityAuditTrailUseCase {
  private readonly logger = new Logger(GetEntityAuditTrailUseCase.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(entityType: string, entityId: string, params: { page: number; limit: number }) {
    const result = await this.auditLogRepository.findByEntity(entityType, entityId, {
      page: params.page,
      limit: params.limit,
    });

    return {
      data: result.data.map((log) => log.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
