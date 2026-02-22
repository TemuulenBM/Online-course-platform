import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';

/** Audit log бүртгэх use case (Bull processor-оос дуудагдана) */
@Injectable()
export class CreateAuditLogUseCase {
  private readonly logger = new Logger(CreateAuditLogUseCase.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    const log = await this.auditLogRepository.create(data);
    this.logger.debug(`Audit log бүртгэгдлээ: ${log.id}`);
    return log.toResponse();
  }
}
