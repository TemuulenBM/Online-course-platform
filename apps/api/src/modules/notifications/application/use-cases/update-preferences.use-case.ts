import { Injectable, Logger } from '@nestjs/common';
import { NotificationPreferenceRepository } from '../../infrastructure/repositories/notification-preference.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';
import { UpdatePreferencesDto } from '../../dto/update-preferences.dto';

/**
 * Хэрэглэгчийн мэдэгдлийн тохиргоо шинэчлэх use case.
 * Upsert семантик — байвал update, байхгүй бол create.
 */
@Injectable()
export class UpdatePreferencesUseCase {
  private readonly logger = new Logger(UpdatePreferencesUseCase.name);

  constructor(
    private readonly preferenceRepository: NotificationPreferenceRepository,
    private readonly notificationCacheService: NotificationCacheService,
  ) {}

  async execute(userId: string, dto: UpdatePreferencesDto): Promise<NotificationPreferenceEntity> {
    /** 1. Upsert тохиргоо */
    const preference = await this.preferenceRepository.upsert(userId, {
      emailEnabled: dto.emailEnabled,
      pushEnabled: dto.pushEnabled,
      smsEnabled: dto.smsEnabled,
      channelPreferences: dto.channelPreferences as Record<string, unknown>,
    });

    /** 2. Кэш invalidate */
    await this.notificationCacheService.invalidatePreferences(userId);

    this.logger.log(`Мэдэгдлийн тохиргоо шинэчлэгдлээ: userId=${userId}`);
    return preference;
  }
}
