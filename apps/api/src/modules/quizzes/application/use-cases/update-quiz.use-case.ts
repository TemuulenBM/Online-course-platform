import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { UpdateQuizDto } from '../../dto/update-quiz.dto';

/**
 * Quiz шинэчлэх use case.
 * Quiz-ийн metadata-г шинэчилнэ (title, description, тохиргоо гэх мэт).
 * Зөвхөн quiz-ийн эзэмшигч эсвэл ADMIN шинэчлэх эрхтэй.
 */
@Injectable()
export class UpdateQuizUseCase {
  private readonly logger = new Logger(UpdateQuizUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizCacheService: QuizCacheService,
  ) {}

  /**
   * Quiz шинэчлэх.
   * @param quizId - Quiz-ийн ID
   * @param userId - Одоогийн хэрэглэгчийн ID
   * @param userRole - Одоогийн хэрэглэгчийн эрх
   * @param dto - Шинэчлэх мэдээлэл
   * @returns Шинэчилсэн QuizEntity
   */
  async execute(
    quizId: string,
    userId: string,
    userRole: string,
    dto: UpdateQuizDto,
  ): Promise<QuizEntity> {
    /** 1. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. Эзэмшигчийн эрх шалгах */
    if (quiz.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ quiz-г шинэчлэх эрхгүй');
    }

    /** 3. Зөвхөн тодорхойлогдсон талбаруудыг шинэчлэх объект бүрдүүлэх */
    const updateData: Partial<{
      title: string;
      description: string;
      timeLimitMinutes: number | null;
      passingScorePercentage: number;
      randomizeQuestions: boolean;
      randomizeOptions: boolean;
      maxAttempts: number | null;
    }> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.timeLimitMinutes !== undefined) updateData.timeLimitMinutes = dto.timeLimitMinutes;
    if (dto.passingScorePercentage !== undefined)
      updateData.passingScorePercentage = dto.passingScorePercentage;
    if (dto.randomizeQuestions !== undefined)
      updateData.randomizeQuestions = dto.randomizeQuestions;
    if (dto.randomizeOptions !== undefined) updateData.randomizeOptions = dto.randomizeOptions;
    if (dto.maxAttempts !== undefined) updateData.maxAttempts = dto.maxAttempts;

    /** 4. Quiz шинэчлэх */
    const updatedQuiz = await this.quizRepository.update(quizId, updateData);

    /** 5. Кэш invalidation */
    await this.quizCacheService.invalidateAll(quizId, quiz.lessonId);

    this.logger.log(`Quiz шинэчлэгдлээ: ${quizId}, хэрэглэгч: ${userId}`);
    return updatedQuiz;
  }
}
