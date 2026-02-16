import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { CourseEntity } from '../../domain/entities/course.entity';
import { CourseRepository } from '../repositories/course.repository';

/** Сургалтын кэшийн TTL — 15 минут (секундээр) */
const COURSE_CACHE_TTL = 900;

/** Кэш түлхүүрийн загварууд */
const COURSE_CACHE_PREFIX = 'course:';
const CATEGORY_TREE_CACHE_KEY = 'category:tree';

/**
 * Сургалтын кэш сервис.
 * Redis-д сургалтын мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class CourseCacheService {
  private readonly logger = new Logger(CourseCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly courseRepository: CourseRepository,
  ) {}

  /** Сургалт авах — Redis кэшээс эхлээд, байхгүй бол DB-ээс */
  async getCourse(courseId: string): Promise<CourseEntity | null> {
    const cacheKey = `${COURSE_CACHE_PREFIX}${courseId}`;

    const cached = await this.redisService.get<ReturnType<CourseEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс сургалт олдлоо: ${courseId}`);
      return new CourseEntity({
        ...cached,
        publishedAt: cached.publishedAt ? new Date(cached.publishedAt) : null,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const course = await this.courseRepository.findById(courseId);
    if (course) {
      await this.redisService.set(cacheKey, course.toResponse(), COURSE_CACHE_TTL);
      this.logger.debug(`Сургалт кэшлэгдлээ: ${courseId}`);
    }

    return course;
  }

  /** Сургалтын кэш устгах (update/delete үед дуудна) */
  async invalidateCourse(courseId: string): Promise<void> {
    const cacheKey = `${COURSE_CACHE_PREFIX}${courseId}`;
    await this.redisService.del(cacheKey);
    this.logger.debug(`Сургалтын кэш устгагдлаа: ${courseId}`);
  }

  /** Ангиллын мод кэш устгах (ангилал өөрчлөгдөх бүрт) */
  async invalidateCategoryTree(): Promise<void> {
    await this.redisService.del(CATEGORY_TREE_CACHE_KEY);
    this.logger.debug('Ангиллын мод кэш устгагдлаа');
  }
}
