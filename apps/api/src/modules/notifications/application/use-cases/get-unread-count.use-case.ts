import { Injectable, Logger } from '@nestjs/common';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';

/**
 * Уншаагүй мэдэгдлийн тоо авах use case.
 * Кэшээс эхлээд, байхгүй бол DB-ээс тоолно.
 */
@Injectable()
export class GetUnreadCountUseCase {
  private readonly logger = new Logger(GetUnreadCountUseCase.name);

  constructor(private readonly notificationCacheService: NotificationCacheService) {}

  async execute(userId: string): Promise<{ count: number }> {
    const count = await this.notificationCacheService.getUnreadCount(userId);
    return { count };
  }
}
