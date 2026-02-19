import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { NotificationEntity } from '../../domain/entities/notification.entity';

/**
 * Мэдэгдлийг уншсан болгох use case.
 * Зөвхөн мэдэгдлийн эзэмшигч хийх боломжтой.
 */
@Injectable()
export class MarkAsReadUseCase {
  private readonly logger = new Logger(MarkAsReadUseCase.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationCacheService: NotificationCacheService,
  ) {}

  async execute(notificationId: string, userId: string): Promise<NotificationEntity> {
    /** 1. Мэдэгдэл хайх */
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Мэдэгдэл олдсонгүй');
    }

    /** 2. Эзэмшигч эсэх шалгах */
    if (notification.userId !== userId) {
      throw new ForbiddenException('Энэ мэдэгдлийг уншсан болгох эрхгүй байна');
    }

    /** 3. Аль хэдийн уншсан бол шууд буцаах */
    if (notification.read) {
      return notification;
    }

    /** 4. Уншсан болгох */
    const updated = await this.notificationRepository.markAsRead(notificationId);

    /** 5. Кэш invalidate */
    await Promise.all([
      this.notificationCacheService.invalidateNotification(notificationId),
      this.notificationCacheService.invalidateUnreadCount(userId),
    ]);

    this.logger.log(`Мэдэгдэл уншсан болголоо: ${notificationId}`);
    return updated;
  }
}
