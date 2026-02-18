import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';

/**
 * Мэдэгдэл устгах use case.
 * Мэдэгдлийн эзэмшигч эсвэл ADMIN устгах боломжтой.
 */
@Injectable()
export class DeleteNotificationUseCase {
  private readonly logger = new Logger(DeleteNotificationUseCase.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationCacheService: NotificationCacheService,
  ) {}

  async execute(notificationId: string, userId: string, userRole: string): Promise<void> {
    /** 1. Мэдэгдэл хайх */
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Мэдэгдэл олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — эзэмшигч эсвэл ADMIN */
    if (notification.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ мэдэгдлийг устгах эрхгүй байна');
    }

    /** 3. DB-ээс устгах */
    await this.notificationRepository.delete(notificationId);

    /** 4. Кэш invalidate */
    await Promise.all([
      this.notificationCacheService.invalidateNotification(notificationId),
      this.notificationCacheService.invalidateUnreadCount(notification.userId),
    ]);

    this.logger.log(`Мэдэгдэл устгагдлаа: ${notificationId}`);
  }
}
