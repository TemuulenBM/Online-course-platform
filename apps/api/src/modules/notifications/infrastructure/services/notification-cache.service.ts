import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationPreferenceRepository } from '../repositories/notification-preference.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';

/** Мэдэгдлийн кэшийн TTL — 15 минут (секундээр) */
const CACHE_TTL = 900;

/**
 * Мэдэгдлийн кэш сервис.
 * Redis-д мэдэгдлийн мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class NotificationCacheService {
  private readonly logger = new Logger(NotificationCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly notificationRepository: NotificationRepository,
    private readonly preferenceRepository: NotificationPreferenceRepository,
  ) {}

  /** ID-аар мэдэгдэл авах — кэшээс эхлээд, байхгүй бол DB-ээс */
  async getNotification(id: string): Promise<NotificationEntity | null> {
    const cacheKey = `notification:${id}`;

    const cached =
      await this.redisService.get<ReturnType<NotificationEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс мэдэгдэл олдлоо: ${id}`);
      return new NotificationEntity({
        ...cached,
        sentAt: new Date(cached.sentAt),
        readAt: cached.readAt ? new Date(cached.readAt) : null,
        createdAt: new Date(cached.createdAt),
      });
    }

    const notification = await this.notificationRepository.findById(id);
    if (notification) {
      await this.redisService.set(cacheKey, notification.toResponse(), CACHE_TTL);
      this.logger.debug(`Мэдэгдэл кэшлэгдлээ: ${id}`);
    }

    return notification;
  }

  /** Уншаагүй мэдэгдлийн тоо — кэшээс эхлээд */
  async getUnreadCount(userId: string): Promise<number> {
    const cacheKey = `notification:unread:${userId}`;

    const cached = await this.redisService.get<number>(cacheKey);
    if (cached !== null) {
      this.logger.debug(`Кэшнээс уншаагүй тоо олдлоо: ${userId}`);
      return cached;
    }

    const count = await this.notificationRepository.countUnread(userId);
    await this.redisService.set(cacheKey, count, CACHE_TTL);
    this.logger.debug(`Уншаагүй тоо кэшлэгдлээ: ${userId} (${count})`);

    return count;
  }

  /** Хэрэглэгчийн тохиргоо — кэшээс эхлээд */
  async getPreferences(userId: string): Promise<NotificationPreferenceEntity | null> {
    const cacheKey = `notification:prefs:${userId}`;

    const cached =
      await this.redisService.get<ReturnType<NotificationPreferenceEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс тохиргоо олдлоо: ${userId}`);
      return new NotificationPreferenceEntity({
        ...cached,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const preference = await this.preferenceRepository.findByUserId(userId);
    if (preference) {
      await this.redisService.set(cacheKey, preference.toResponse(), CACHE_TTL);
      this.logger.debug(`Тохиргоо кэшлэгдлээ: ${userId}`);
    }

    return preference;
  }

  /** Мэдэгдлийн кэш устгах */
  async invalidateNotification(id: string): Promise<void> {
    await this.redisService.del(`notification:${id}`);
    this.logger.debug(`Мэдэгдлийн кэш устгагдлаа: ${id}`);
  }

  /** Уншаагүй тооны кэш устгах */
  async invalidateUnreadCount(userId: string): Promise<void> {
    await this.redisService.del(`notification:unread:${userId}`);
    this.logger.debug(`Уншаагүй тооны кэш устгагдлаа: ${userId}`);
  }

  /** Тохиргооны кэш устгах */
  async invalidatePreferences(userId: string): Promise<void> {
    await this.redisService.del(`notification:prefs:${userId}`);
    this.logger.debug(`Тохиргооны кэш устгагдлаа: ${userId}`);
  }
}
