import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';
import { LessonRepository } from '../repositories/lesson.repository';

/** Хичээлийн кэшийн TTL — 15 минут (секундээр) */
const LESSON_CACHE_TTL = 900;

/** Кэш түлхүүрийн загварууд */
const LESSON_CACHE_PREFIX = 'lesson:';
const LESSONS_COURSE_CACHE_PREFIX = 'lessons:course:';

/**
 * Хичээлийн кэш сервис.
 * Redis-д хичээлийн мэдээлэл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class LessonCacheService {
  private readonly logger = new Logger(LessonCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly lessonRepository: LessonRepository,
  ) {}

  /** Хичээл авах — Redis кэшээс эхлээд, байхгүй бол DB-ээс */
  async getLesson(lessonId: string): Promise<LessonEntity | null> {
    const cacheKey = `${LESSON_CACHE_PREFIX}${lessonId}`;

    const cached = await this.redisService.get<
      ReturnType<LessonEntity['toResponse']> & { courseInstructorId?: string }
    >(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс хичээл олдлоо: ${lessonId}`);
      return new LessonEntity({
        ...cached,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const lesson = await this.lessonRepository.findById(lessonId);
    if (lesson) {
      await this.redisService.set(
        cacheKey,
        { ...lesson.toResponse(), courseInstructorId: lesson.courseInstructorId },
        LESSON_CACHE_TTL,
      );
      this.logger.debug(`Хичээл кэшлэгдлээ: ${lessonId}`);
    }

    return lesson;
  }

  /** Сургалтын нийтлэгдсэн хичээлүүд авах — кэш эхлээд, байхгүй бол DB */
  async getPublishedLessonsByCourse(courseId: string): Promise<LessonEntity[]> {
    const cacheKey = `${LESSONS_COURSE_CACHE_PREFIX}${courseId}`;

    const cached = await this.redisService.get<ReturnType<LessonEntity['toResponse']>[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс сургалтын хичээлүүд олдлоо: ${courseId}`);
      return cached.map(
        (item) =>
          new LessonEntity({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }),
      );
    }

    const lessons = await this.lessonRepository.findByCourseId(courseId, true);
    if (lessons.length > 0) {
      await this.redisService.set(
        cacheKey,
        lessons.map((l) => l.toResponse()),
        LESSON_CACHE_TTL,
      );
      this.logger.debug(`Сургалтын хичээлүүд кэшлэгдлээ: ${courseId}`);
    }

    return lessons;
  }

  /** Дан хичээлийн кэш устгах */
  async invalidateLesson(lessonId: string): Promise<void> {
    const cacheKey = `${LESSON_CACHE_PREFIX}${lessonId}`;
    await this.redisService.del(cacheKey);
    this.logger.debug(`Хичээлийн кэш устгагдлаа: ${lessonId}`);
  }

  /** Сургалтын хичээлүүдийн жагсаалт кэш устгах */
  async invalidateCourseLessons(courseId: string): Promise<void> {
    const cacheKey = `${LESSONS_COURSE_CACHE_PREFIX}${courseId}`;
    await this.redisService.del(cacheKey);
    this.logger.debug(`Сургалтын хичээлүүдийн кэш устгагдлаа: ${courseId}`);
  }

  /** Хичээл болон сургалтын кэшийг хамт устгах (update/delete үед) */
  async invalidateAll(lessonId: string, courseId: string): Promise<void> {
    await Promise.all([this.invalidateLesson(lessonId), this.invalidateCourseLessons(courseId)]);
  }
}
