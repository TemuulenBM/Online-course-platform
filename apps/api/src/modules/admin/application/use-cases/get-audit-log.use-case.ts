import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';

/** Нэг audit log дэлгэрэнгүй авах use case */
@Injectable()
export class GetAuditLogUseCase {
  private readonly logger = new Logger(GetAuditLogUseCase.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(id: string) {
    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new NotFoundException('Audit log олдсонгүй');
    }
    return log.toResponse();
  }
}
