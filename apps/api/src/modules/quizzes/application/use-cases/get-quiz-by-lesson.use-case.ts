import { Injectable, Logger } from '@nestjs/common';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { QuizEntity } from '../../domain/entities/quiz.entity';

/**
 * Хичээлийн ID-аар quiz авах use case.
 * Кэшнээс quiz хайж, олдвол буцаана, олдохгүй бол null буцаана.
 * NotFoundException шидэхгүй — quiz байхгүй бол null буцаах нь зүйтэй.
 */
@Injectable()
export class GetQuizByLessonUseCase {
  private readonly logger = new Logger(GetQuizByLessonUseCase.name);

  constructor(private readonly quizCacheService: QuizCacheService) {}

  /**
   * Хичээлийн ID-аар quiz авах.
   * @param lessonId - Хичээлийн ID
   * @returns QuizEntity эсвэл null (quiz байхгүй бол)
   */
  async execute(lessonId: string): Promise<QuizEntity | null> {
    /** Кэшнээс quiz хайх (read-through: кэшэд байхгүй бол DB-ээс авна) */
    const quiz = await this.quizCacheService.getQuizByLessonId(lessonId);

    if (quiz) {
      this.logger.debug(`Хичээлийн quiz олдлоо: lessonId=${lessonId}, quizId=${quiz.id}`);
    } else {
      this.logger.debug(`Хичээлд quiz байхгүй: lessonId=${lessonId}`);
    }

    return quiz;
  }
}
