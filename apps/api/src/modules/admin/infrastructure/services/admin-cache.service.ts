import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';

/** Dashboard кэшийн TTL — 5 минут (секундээр) */
const DASHBOARD_CACHE_TTL = 300;

/** Тохиргоо, moderation кэшийн TTL — 15 минут (секундээр) */
const ADMIN_CACHE_TTL = 900;

/**
 * Admin кэш сервис.
 * Redis-д admin dashboard, тохиргоо, moderation мэдээлэл кэшлэнэ.
 */
@Injectable()
export class AdminCacheService {
  private readonly logger = new Logger(AdminCacheService.name);

  constructor(private readonly redisService: RedisService) {}

  // ========== System Settings ==========

  /** Бүх тохиргоо кэшээс авах */
  async getSettings<T>(category?: string): Promise<T | null> {
    const key = category ? `admin:settings:${category}` : 'admin:settings:all';
    const cached = await this.redisService.get<T>(key);
    if (cached) this.logger.debug(`Кэшнээс settings олдлоо: ${key}`);
    return cached;
  }

  /** Бүх тохиргоо кэшлэх */
  async setSettings<T>(data: T, category?: string): Promise<void> {
    const key = category ? `admin:settings:${category}` : 'admin:settings:all';
    await this.redisService.set(key, data, ADMIN_CACHE_TTL);
    this.logger.debug(`Settings кэшлэгдлээ: ${key}`);
  }

  /** Public тохиргоо кэшээс авах */
  async getPublicSettings<T>(): Promise<T | null> {
    const cached = await this.redisService.get<T>('admin:settings:public');
    if (cached) this.logger.debug('Кэшнээс public settings олдлоо');
    return cached;
  }

  /** Public тохиргоо кэшлэх */
  async setPublicSettings<T>(data: T): Promise<void> {
    await this.redisService.set('admin:settings:public', data, ADMIN_CACHE_TTL);
    this.logger.debug('Public settings кэшлэгдлээ');
  }

  /** Нэг тохиргоо кэшээс авах */
  async getSetting<T>(key: string): Promise<T | null> {
    const cacheKey = `admin:settings:key:${key}`;
    const cached = await this.redisService.get<T>(cacheKey);
    if (cached) this.logger.debug(`Кэшнээс setting олдлоо: ${key}`);
    return cached;
  }

  /** Нэг тохиргоо кэшлэх */
  async setSetting<T>(key: string, data: T): Promise<void> {
    const cacheKey = `admin:settings:key:${key}`;
    await this.redisService.set(cacheKey, data, ADMIN_CACHE_TTL);
    this.logger.debug(`Setting кэшлэгдлээ: ${key}`);
  }

  /** Тохиргоо кэш invalidate — тодорхой key-үүдийг устгана */
  async invalidateSettings(settingKey?: string): Promise<void> {
    await this.redisService.del('admin:settings:all');
    await this.redisService.del('admin:settings:public');
    if (settingKey) {
      await this.redisService.del(`admin:settings:key:${settingKey}`);
    }
    this.logger.debug('Settings кэш цэвэрлэгдлээ');
  }

  // ========== Dashboard ==========

  /** Dashboard stats кэшээс авах */
  async getDashboardStats<T>(): Promise<T | null> {
    const cached = await this.redisService.get<T>('admin:dashboard:stats');
    if (cached) this.logger.debug('Кэшнээс dashboard stats олдлоо');
    return cached;
  }

  /** Dashboard stats кэшлэх */
  async setDashboardStats<T>(data: T): Promise<void> {
    await this.redisService.set('admin:dashboard:stats', data, DASHBOARD_CACHE_TTL);
    this.logger.debug('Dashboard stats кэшлэгдлээ');
  }

  /** Pending items кэшээс авах */
  async getPendingItems<T>(): Promise<T | null> {
    const cached = await this.redisService.get<T>('admin:dashboard:pending');
    if (cached) this.logger.debug('Кэшнээс pending items олдлоо');
    return cached;
  }

  /** Pending items кэшлэх */
  async setPendingItems<T>(data: T): Promise<void> {
    await this.redisService.set('admin:dashboard:pending', data, DASHBOARD_CACHE_TTL);
    this.logger.debug('Pending items кэшлэгдлээ');
  }

  /** Dashboard кэш invalidate */
  async invalidateDashboard(): Promise<void> {
    await this.redisService.del('admin:dashboard:stats');
    await this.redisService.del('admin:dashboard:pending');
    this.logger.debug('Dashboard кэш цэвэрлэгдлээ');
  }

  // ========== Moderation ==========

  /** Moderation stats кэшээс авах */
  async getModerationStats<T>(): Promise<T | null> {
    const cached = await this.redisService.get<T>('admin:moderation:stats');
    if (cached) this.logger.debug('Кэшнээс moderation stats олдлоо');
    return cached;
  }

  /** Moderation stats кэшлэх */
  async setModerationStats<T>(data: T): Promise<void> {
    await this.redisService.set('admin:moderation:stats', data, DASHBOARD_CACHE_TTL);
    this.logger.debug('Moderation stats кэшлэгдлээ');
  }

  /** Moderation кэш invalidate */
  async invalidateModeration(): Promise<void> {
    await this.redisService.del('admin:moderation:stats');
    this.logger.debug('Moderation кэш цэвэрлэгдлээ');
  }
}
