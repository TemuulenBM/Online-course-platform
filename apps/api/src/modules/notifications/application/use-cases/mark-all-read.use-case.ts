import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';

/**
 * Бүх мэдэгдлийг уншсан болгох use case.
 * Хэрэглэгчийн бүх уншаагүй мэдэгдлийг нэг дор уншсан болгоно.
 */
@Injectable()
export class MarkAllReadUseCase {
  private readonly logger = new Logger(MarkAllReadUseCase.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationCacheService: NotificationCacheService,
  ) {}

  async execute(userId: string): Promise<{ count: number }> {
    /** 1. Бүх уншаагүй мэдэгдлийг уншсан болгох */
    const count = await this.notificationRepository.markAllAsRead(userId);

    /** 2. Уншаагүй тооны кэш invalidate */
    await this.notificationCacheService.invalidateUnreadCount(userId);

    this.logger.log(`${count} мэдэгдэл уншсан болголоо: userId=${userId}`);
    return { count };
  }
}
