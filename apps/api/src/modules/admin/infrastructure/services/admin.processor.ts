import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuditLogData } from './audit-log.service';

/**
 * Admin Bull Queue processor.
 * Async audit log бүртгэлийг background-д боловсруулна.
 */
@Processor('admin')
export class AdminProcessor {
  private readonly logger = new Logger(AdminProcessor.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /** Audit log бүртгэх process */
  @Process('create-audit-log')
  async handleCreateAuditLog(job: Job<AuditLogData>): Promise<void> {
    try {
      const data = job.data;
      await this.auditLogRepository.create({
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata,
      });

      this.logger.debug(
        `Audit log бүртгэгдлээ: ${data.action} ${data.entityType}:${data.entityId}`,
      );
    } catch (error) {
      /** Алдаа гарсан ч exception шидэхгүй — graceful handling */
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Audit log бүртгэхэд алдаа гарлаа: ${err.message}`, err.stack);
    }
  }
}
