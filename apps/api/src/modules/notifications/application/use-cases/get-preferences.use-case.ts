import { Injectable, Logger } from '@nestjs/common';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';

/**
 * Хэрэглэгчийн мэдэгдлийн тохиргоо авах use case.
 * Тохиргоо байхгүй бол default утга буцаана.
 */
@Injectable()
export class GetPreferencesUseCase {
  private readonly logger = new Logger(GetPreferencesUseCase.name);

  constructor(private readonly notificationCacheService: NotificationCacheService) {}

  async execute(userId: string): Promise<NotificationPreferenceEntity> {
    const preference = await this.notificationCacheService.getPreferences(userId);

    /** Тохиргоо байхгүй бол default утга буцаана */
    if (!preference) {
      return new NotificationPreferenceEntity({
        id: '',
        userId,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        channelPreferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return preference;
  }
}
