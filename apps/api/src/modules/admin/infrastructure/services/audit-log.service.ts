import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

/** Audit log бүртгэхэд шаардлагатай өгөгдөл */
export interface AuditLogData {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Audit log сервис.
 * Bull Queue-ээр async audit log бүртгэнэ.
 * Бусад модулиудаас энэ сервисийг inject хийж ашиглах боломжтой.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(@InjectQueue('admin') private readonly adminQueue: Queue) {}

  /**
   * Audit log бүртгэх (async — Bull Queue).
   * Endpoint хариу буцаахаас өмнө DB бичилт хийхгүй, queue-д job нэмнэ.
   */
  async log(data: AuditLogData): Promise<void> {
    await this.adminQueue.add('create-audit-log', data, {
      removeOnComplete: true,
      removeOnFail: false,
    });
    this.logger.debug(
      `Audit log queue-д нэмэгдлээ: ${data.action} ${data.entityType}:${data.entityId}`,
    );
  }
}
