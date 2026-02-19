import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';

/** Dashboard overview кэшийн TTL — 5 минут (секундээр) */
const OVERVIEW_CACHE_TTL = 300;

/** Тайлан, статистик кэшийн TTL — 15 минут (секундээр) */
const ANALYTICS_CACHE_TTL = 900;

/**
 * Analytics кэш сервис.
 * Redis-д dashboard болон тайлангийн мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class AnalyticsCacheService {
  private readonly logger = new Logger(AnalyticsCacheService.name);

  constructor(private readonly redisService: RedisService) {}

  /** Dashboard overview кэшээс авах */
  async getOverview<T>(): Promise<T | null> {
    const cached = await this.redisService.get<T>('analytics:overview');
    if (cached) {
      this.logger.debug('Кэшнээс overview олдлоо');
    }
    return cached;
  }

  /** Dashboard overview кэшлэх */
  async setOverview<T>(data: T): Promise<void> {
    await this.redisService.set('analytics:overview', data, OVERVIEW_CACHE_TTL);
    this.logger.debug('Overview кэшлэгдлээ');
  }

  /** Орлогын тайлан кэшээс авах */
  async getRevenue<T>(period: string, dateFrom: string, dateTo: string): Promise<T | null> {
    const key = `analytics:revenue:${period}:${dateFrom}:${dateTo}`;
    const cached = await this.redisService.get<T>(key);
    if (cached) {
      this.logger.debug(`Кэшнээс revenue олдлоо: ${key}`);
    }
    return cached;
  }

  /** Орлогын тайлан кэшлэх */
  async setRevenue<T>(period: string, dateFrom: string, dateTo: string, data: T): Promise<void> {
    const key = `analytics:revenue:${period}:${dateFrom}:${dateTo}`;
    await this.redisService.set(key, data, ANALYTICS_CACHE_TTL);
    this.logger.debug(`Revenue кэшлэгдлээ: ${key}`);
  }

  /** Элсэлтийн трэнд кэшээс авах */
  async getEnrollmentTrend<T>(period: string, dateFrom: string, dateTo: string): Promise<T | null> {
    const key = `analytics:enrollments:${period}:${dateFrom}:${dateTo}`;
    const cached = await this.redisService.get<T>(key);
    if (cached) {
      this.logger.debug(`Кэшнээс enrollment trend олдлоо: ${key}`);
    }
    return cached;
  }

  /** Элсэлтийн трэнд кэшлэх */
  async setEnrollmentTrend<T>(
    period: string,
    dateFrom: string,
    dateTo: string,
    data: T,
  ): Promise<void> {
    const key = `analytics:enrollments:${period}:${dateFrom}:${dateTo}`;
    await this.redisService.set(key, data, ANALYTICS_CACHE_TTL);
    this.logger.debug(`Enrollment trend кэшлэгдлээ: ${key}`);
  }

  /** Топ сургалтууд кэшээс авах */
  async getPopularCourses<T>(limit: number): Promise<T | null> {
    const key = `analytics:popular:${limit}`;
    const cached = await this.redisService.get<T>(key);
    if (cached) {
      this.logger.debug(`Кэшнээс popular courses олдлоо: ${key}`);
    }
    return cached;
  }

  /** Топ сургалтууд кэшлэх */
  async setPopularCourses<T>(limit: number, data: T): Promise<void> {
    const key = `analytics:popular:${limit}`;
    await this.redisService.set(key, data, ANALYTICS_CACHE_TTL);
    this.logger.debug(`Popular courses кэшлэгдлээ: ${key}`);
  }

  /** Сургалтын статистик кэшээс авах */
  async getCourseStats<T>(courseId: string): Promise<T | null> {
    const key = `analytics:course:${courseId}`;
    const cached = await this.redisService.get<T>(key);
    if (cached) {
      this.logger.debug(`Кэшнээс course stats олдлоо: ${courseId}`);
    }
    return cached;
  }

  /** Сургалтын статистик кэшлэх */
  async setCourseStats<T>(courseId: string, data: T): Promise<void> {
    const key = `analytics:course:${courseId}`;
    await this.redisService.set(key, data, ANALYTICS_CACHE_TTL);
    this.logger.debug(`Course stats кэшлэгдлээ: ${courseId}`);
  }
}
