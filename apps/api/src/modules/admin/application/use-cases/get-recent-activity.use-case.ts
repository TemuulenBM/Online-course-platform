import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';

/** Сүүлийн admin үйлдлүүд авах use case */
@Injectable()
export class GetRecentActivityUseCase {
  private readonly logger = new Logger(GetRecentActivityUseCase.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(limit: number = 10) {
    const logs = await this.auditLogRepository.findRecent(limit);
    return logs.map((log) => log.toResponse());
  }
}
