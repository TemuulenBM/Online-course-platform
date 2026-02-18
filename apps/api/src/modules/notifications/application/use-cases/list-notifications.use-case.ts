import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';

/**
 * Хэрэглэгчийн мэдэгдлүүдийн жагсаалт авах use case.
 * Pagination + type/read filter дэмждэг.
 */
@Injectable()
export class ListNotificationsUseCase {
  private readonly logger = new Logger(ListNotificationsUseCase.name);

  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(
    userId: string,
    options: {
      page: number;
      limit: number;
      type?: string;
      read?: boolean;
    },
  ): Promise<{
    data: NotificationEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.notificationRepository.findByUserId(userId, options);
  }
}
