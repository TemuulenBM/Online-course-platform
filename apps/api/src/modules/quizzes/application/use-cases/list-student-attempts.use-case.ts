import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';

/**
 * Оюутнуудын quiz оролдлогуудыг жагсаах use case.
 * Багш эсвэл ADMIN тухайн quiz дээрх бүх оюутнуудын оролдлогуудыг
 * pagination-тэй харах боломжтой.
 */
@Injectable()
export class ListStudentAttemptsUseCase {
  private readonly logger = new Logger(ListStudentAttemptsUseCase.name);

  constructor(private readonly quizRepository: QuizRepository) {}

  /**
   * Тухайн quiz дээрх оюутнуудын оролдлогуудыг жагсаах.
   * @param quizId - Quiz-ийн ID
   * @param userId - Одоогийн хэрэглэгчийн ID (эзэмшигч/ADMIN)
   * @param userRole - Одоогийн хэрэглэгчийн эрх
   * @param options - Pagination тохиргоо (page, limit)
   * @returns Pagination-тэй оролдлогуудын жагсаалт
   */
  async execute(
    quizId: string,
    userId: string,
    userRole: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: ReturnType<
      import('../../domain/entities/quiz-attempt.entity').QuizAttemptEntity['toResponse']
    >[];
    total: number;
    page: number;
    limit: number;
  }> {
    /** 1. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. Эзэмшигчийн эрх шалгах */
    if (quiz.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Оюутнуудын оролдлогыг харах эрхгүй байна');
    }

    /** 3. Оролдлогуудыг pagination-тэй авах */
    const result = await this.quizRepository.findAttemptsByQuiz(quizId, options);

    this.logger.debug(
      `Оюутнуудын оролдлогууд жагсаагдлаа: quiz=${quizId}, нийт=${result.total}, хуудас=${options.page}`,
    );

    return {
      data: result.data.map((a) => a.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
