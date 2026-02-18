import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';

/**
 * Асуулт устгах use case.
 * Quiz дотор байгаа тодорхой асуултыг устгах бизнес логик.
 * Зөвхөн quiz-ийн эзэмшигч (instructor) эсвэл ADMIN устгах эрхтэй.
 */
@Injectable()
export class DeleteQuestionUseCase {
  private readonly logger = new Logger(DeleteQuestionUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizCacheService: QuizCacheService,
  ) {}

  /**
   * Асуулт устгах үйлдлийг гүйцэтгэх.
   * @param quizId - Quiz ID
   * @param questionId - Асуултын ID
   * @param userId - Хэрэглэгчийн ID
   * @param userRole - Хэрэглэгчийн эрх
   */
  async execute(
    quizId: string,
    questionId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    /** 1. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — эзэмшигч эсвэл ADMIN */
    if (quiz.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ quiz-д асуулт нэмэх эрхгүй байна');
    }

    /** 3. Асуулт устгах */
    await this.quizQuestionsRepository.deleteQuestion(quizId, questionId);

    /** 4. Кэш invalidate */
    await this.quizCacheService.invalidateAll(quizId, quiz.lessonId);

    this.logger.log(`Асуулт устгагдлаа: quizId=${quizId}, questionId=${questionId}`);
  }
}
