import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizAnswersRepository } from '../../infrastructure/repositories/quiz-answers.repository';

/**
 * Quiz оролдлогын дэлгэрэнгүй авах use case.
 * Оролдлогын мэдээлэл болон MongoDB-д хадгалсан хариултуудыг буцаана.
 * Хандалтын эрхийг шалгана: өөрийн оролдлого, ADMIN, эсвэл TEACHER (сургалтын эзэмшигч).
 */
@Injectable()
export class GetAttemptUseCase {
  private readonly logger = new Logger(GetAttemptUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizAnswersRepository: QuizAnswersRepository,
  ) {}

  /**
   * Оролдлогын дэлгэрэнгүй мэдээлэл авах.
   * @param quizId - Quiz-ийн ID
   * @param attemptId - Attempt-ийн ID
   * @param userId - Одоогийн хэрэглэгчийн ID
   * @param userRole - Одоогийн хэрэглэгчийн эрх
   * @returns Attempt мэдээлэл болон хариултууд
   */
  async execute(
    quizId: string,
    attemptId: string,
    userId: string,
    userRole: string,
  ): Promise<{
    attempt: ReturnType<
      import('../../domain/entities/quiz-attempt.entity').QuizAttemptEntity['toResponse']
    >;
    answers: any;
  }> {
    /** 1. Attempt олдох эсэх шалгах */
    const attempt = await this.quizRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundException('Оролдлого олдсонгүй');
    }

    /** 2. Хандалтын эрх шалгах */
    if (attempt.userId !== userId) {
      if (userRole === 'ADMIN') {
        /** ADMIN бол бүх оролдлогыг харах эрхтэй */
      } else if (userRole === 'TEACHER') {
        /** TEACHER бол зөвхөн өөрийн сургалтын оролдлогуудыг харна */
        const quiz = await this.quizRepository.findById(attempt.quizId);
        if (!quiz || quiz.instructorId !== userId) {
          throw new ForbiddenException('Энэ оролдлогыг харах эрхгүй байна');
        }
      } else {
        throw new ForbiddenException('Энэ оролдлогыг харах эрхгүй байна');
      }
    }

    /** 3. MongoDB-ээс хариултууд авах */
    const answers = await this.quizAnswersRepository.findByAttemptId(attemptId);

    this.logger.debug(`Оролдлогын дэлгэрэнгүй авлаа: attempt=${attemptId}, хэрэглэгч=${userId}`);

    return {
      attempt: attempt.toResponse(),
      answers,
    };
  }
}
