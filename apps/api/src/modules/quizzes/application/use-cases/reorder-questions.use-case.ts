import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { ReorderQuestionsDto } from '../../dto/reorder-questions.dto';
import { QuizQuestionsDocument } from '../../infrastructure/schemas/quiz-questions.schema';

/**
 * Асуултуудын дараалал солих use case.
 * Quiz дотор байгаа асуултуудын orderIndex-г шинэчлэх бизнес логик.
 * Зөвхөн quiz-ийн эзэмшигч (instructor) эсвэл ADMIN дараалал солих эрхтэй.
 */
@Injectable()
export class ReorderQuestionsUseCase {
  private readonly logger = new Logger(ReorderQuestionsUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizCacheService: QuizCacheService,
  ) {}

  /**
   * Асуултуудын дараалал солих үйлдлийг гүйцэтгэх.
   * @param quizId - Quiz ID
   * @param userId - Хэрэглэгчийн ID
   * @param userRole - Хэрэглэгчийн эрх
   * @param dto - Шинэ дараалал
   * @returns Дарааллаар нь эрэмбэлэгдсэн quiz questions document
   */
  async execute(
    quizId: string,
    userId: string,
    userRole: string,
    dto: ReorderQuestionsDto,
  ): Promise<QuizQuestionsDocument> {
    /** 1. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — эзэмшигч эсвэл ADMIN */
    if (quiz.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ quiz-д асуулт нэмэх эрхгүй байна');
    }

    /** 3. Дараалал өөрчлөх */
    const updatedDoc = await this.quizQuestionsRepository.reorderQuestions(
      quizId,
      dto.questionOrder,
    );
    if (!updatedDoc) {
      throw new NotFoundException('Quiz questions document олдсонгүй');
    }

    /** 4. Кэш invalidate */
    await this.quizCacheService.invalidateAll(quizId, quiz.lessonId);

    this.logger.log(
      `Асуултуудын дараалал өөрчлөгдлөө: quizId=${quizId}, count=${dto.questionOrder.length}`,
    );

    return updatedDoc;
  }
}
