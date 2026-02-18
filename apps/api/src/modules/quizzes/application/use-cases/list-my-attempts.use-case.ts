import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';

/**
 * Миний quiz оролдлогуудыг жагсаах use case.
 * Тухайн хэрэглэгчийн тодорхой quiz дээрх бүх оролдлогуудыг буцаана.
 */
@Injectable()
export class ListMyAttemptsUseCase {
  private readonly logger = new Logger(ListMyAttemptsUseCase.name);

  constructor(private readonly quizRepository: QuizRepository) {}

  /**
   * Хэрэглэгчийн тухайн quiz дээрх оролдлогуудыг жагсаах.
   * @param quizId - Quiz-ийн ID
   * @param userId - Хэрэглэгчийн ID
   * @returns Оролдлогуудын жагсаалт (toResponse формат)
   */
  async execute(
    quizId: string,
    userId: string,
  ): Promise<
    ReturnType<
      import('../../domain/entities/quiz-attempt.entity').QuizAttemptEntity['toResponse']
    >[]
  > {
    /** 1. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. Хэрэглэгчийн оролдлогуудыг авах */
    const attempts = await this.quizRepository.findAttemptsByQuizAndUser(quizId, userId);

    this.logger.debug(
      `Миний оролдлогууд жагсаагдлаа: quiz=${quizId}, хэрэглэгч=${userId}, тоо=${attempts.length}`,
    );

    return attempts.map((a) => a.toResponse());
  }
}
