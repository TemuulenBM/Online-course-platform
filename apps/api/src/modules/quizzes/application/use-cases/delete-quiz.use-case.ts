import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizAnswersRepository } from '../../infrastructure/repositories/quiz-answers.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';

/**
 * Quiz устгах use case.
 * PostgreSQL-аас quiz болон cascade-аар attempts устгана.
 * MongoDB-аас quiz_questions болон quiz_answers устгана.
 * Redis кэшийг invalidate хийнэ.
 */
@Injectable()
export class DeleteQuizUseCase {
  private readonly logger = new Logger(DeleteQuizUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizAnswersRepository: QuizAnswersRepository,
    private readonly quizCacheService: QuizCacheService,
  ) {}

  /**
   * Quiz устгах.
   * @param quizId - Quiz-ийн ID
   * @param userId - Одоогийн хэрэглэгчийн ID
   * @param userRole - Одоогийн хэрэглэгчийн эрх
   */
  async execute(quizId: string, userId: string, userRole: string): Promise<void> {
    /** 1. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. Эзэмшигчийн эрх шалгах */
    if (quiz.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ quiz-г устгах эрхгүй');
    }

    /** 3. PostgreSQL-аас quiz устгах (cascade-аар quiz_attempts устгагдана) */
    await this.quizRepository.delete(quizId);

    /** 4. MongoDB-аас асуултууд устгах */
    await this.quizQuestionsRepository.deleteByQuizId(quizId);

    /** 5. MongoDB-аас хариултууд устгах */
    await this.quizAnswersRepository.deleteByQuizId(quizId);

    /** 6. Кэш invalidation */
    await this.quizCacheService.invalidateAll(quizId, quiz.lessonId);

    this.logger.log(`Quiz устгагдлаа: ${quizId}, хэрэглэгч: ${userId}`);
  }
}
