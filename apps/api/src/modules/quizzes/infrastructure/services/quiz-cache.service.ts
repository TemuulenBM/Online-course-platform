import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { QuizRepository } from '../repositories/quiz.repository';
import { QuizEntity } from '../../domain/entities/quiz.entity';

/** Кэшийн TTL — 15 минут (секундаар) */
const QUIZ_CACHE_TTL = 900;

/**
 * Quiz кэш сервис.
 * Redis-ээр quiz metadata болон асуултуудыг кэшлэнэ.
 */
@Injectable()
export class QuizCacheService {
  private readonly logger = new Logger(QuizCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly quizRepository: QuizRepository,
  ) {}

  /** Quiz ID-аар кэшнээс авах (read-through) */
  async getQuizById(id: string): Promise<QuizEntity | null> {
    const cacheKey = `quiz:${id}`;

    const cached = await this.redisService.get<ReturnType<QuizEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс quiz олдлоо: ${id}`);
      return new QuizEntity({
        ...cached,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const quiz = await this.quizRepository.findById(id);
    if (quiz) {
      await this.redisService.set(cacheKey, quiz.toResponse(), QUIZ_CACHE_TTL);
    }
    return quiz;
  }

  /** Lesson ID-аар кэшнээс quiz авах (read-through) */
  async getQuizByLessonId(lessonId: string): Promise<QuizEntity | null> {
    const cacheKey = `quiz:lesson:${lessonId}`;

    const cached = await this.redisService.get<ReturnType<QuizEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс quiz олдлоо: lessonId=${lessonId}`);
      return new QuizEntity({
        ...cached,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    const quiz = await this.quizRepository.findByLessonId(lessonId);
    if (quiz) {
      await this.redisService.set(cacheKey, quiz.toResponse(), QUIZ_CACHE_TTL);
    }
    return quiz;
  }

  /** Quiz-тэй холбоотой бүх кэшийг устгах */
  async invalidateAll(quizId: string, lessonId: string): Promise<void> {
    await Promise.all([
      this.redisService.del(`quiz:${quizId}`),
      this.redisService.del(`quiz:lesson:${lessonId}`),
      this.redisService.del(`quiz:questions:${quizId}`),
    ]);
    this.logger.debug(`Quiz кэш устгагдлаа: quizId=${quizId}, lessonId=${lessonId}`);
  }

  /** Attempt-тай холбоотой кэш устгах */
  async invalidateAttemptCache(quizId: string, userId: string): Promise<void> {
    await this.redisService.del(`quiz:attempts:${quizId}:${userId}`);
  }
}
