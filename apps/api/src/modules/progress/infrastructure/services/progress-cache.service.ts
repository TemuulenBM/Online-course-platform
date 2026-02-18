import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';
import { ProgressRepository } from '../repositories/progress.repository';

/** Ахицын кэшийн TTL — 15 минут (секундээр) */
const PROGRESS_CACHE_TTL = 900;

/** Кэш түлхүүрийн загварууд */
const LESSON_PROGRESS_PREFIX = 'progress:lesson:';
const COURSE_PROGRESS_PREFIX = 'progress:course:';

/**
 * Ахицын кэш сервис.
 * Redis-д ахицын мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class ProgressCacheService {
  private readonly logger = new Logger(ProgressCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly progressRepository: ProgressRepository,
  ) {}

  /** Хичээлийн ахиц авах — Redis кэшээс эхлээд, байхгүй бол DB-ээс */
  async getLessonProgress(userId: string, lessonId: string): Promise<UserProgressEntity | null> {
    const cacheKey = `${LESSON_PROGRESS_PREFIX}${userId}:${lessonId}`;

    const cached =
      await this.redisService.get<ReturnType<UserProgressEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс ахиц олдлоо: ${userId}:${lessonId}`);
      return new UserProgressEntity({
        ...cached,
        completedAt: cached.completedAt ? new Date(cached.completedAt) : null,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const progress = await this.progressRepository.findByUserAndLesson(userId, lessonId);
    if (progress) {
      await this.redisService.set(cacheKey, progress.toResponse(), PROGRESS_CACHE_TTL);
      this.logger.debug(`Ахиц кэшлэгдлээ: ${userId}:${lessonId}`);
    }

    return progress;
  }

  /** Сургалтын ахицын жагсаалт авах — Redis кэшээс эхлээд, байхгүй бол DB-ээс */
  async getCourseProgress(userId: string, courseId: string): Promise<UserProgressEntity[]> {
    const cacheKey = `${COURSE_PROGRESS_PREFIX}${userId}:${courseId}`;

    const cached =
      await this.redisService.get<ReturnType<UserProgressEntity['toResponse']>[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс сургалтын ахиц олдлоо: ${userId}:${courseId}`);
      return cached.map(
        (item) =>
          new UserProgressEntity({
            ...item,
            completedAt: item.completedAt ? new Date(item.completedAt) : null,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }),
      );
    }

    const progressList = await this.progressRepository.findByUserAndCourse(userId, courseId);
    if (progressList.length > 0) {
      await this.redisService.set(
        cacheKey,
        progressList.map((p) => p.toResponse()),
        PROGRESS_CACHE_TTL,
      );
      this.logger.debug(`Сургалтын ахиц кэшлэгдлээ: ${userId}:${courseId}`);
    }

    return progressList;
  }

  /** Бүх холбогдох кэш устгах (create/update/delete үед дуудна) */
  async invalidateAll(userId: string, lessonId: string, courseId: string): Promise<void> {
    await Promise.all([
      this.redisService.del(`${LESSON_PROGRESS_PREFIX}${userId}:${lessonId}`),
      this.redisService.del(`${COURSE_PROGRESS_PREFIX}${userId}:${courseId}`),
    ]);
    this.logger.debug(`Ахицын кэш устгагдлаа: ${userId}:${lessonId}:${courseId}`);
  }
}
