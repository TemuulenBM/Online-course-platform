import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizAnswersRepository } from '../../infrastructure/repositories/quiz-answers.repository';
import { QuizGradingService } from '../../infrastructure/services/quiz-grading.service';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { CompleteLessonUseCase } from '../../../progress/application/use-cases/complete-lesson.use-case';
import { SubmitAttemptDto } from '../../dto/submit-attempt.dto';

/**
 * Quiz оролдлого илгээх use case.
 * Хэрэглэгчийн хариултуудыг хүлээн авч, автомат дүгнэж,
 * MongoDB-д хариултуудыг хадгалж, PostgreSQL-д attempt шинэчилнэ.
 * Тэнцсэн тохиолдолд хичээлийг автоматаар дуусгана.
 */
@Injectable()
export class SubmitAttemptUseCase {
  private readonly logger = new Logger(SubmitAttemptUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizAnswersRepository: QuizAnswersRepository,
    private readonly quizGradingService: QuizGradingService,
    private readonly quizCacheService: QuizCacheService,
    private readonly completeLessonUseCase: CompleteLessonUseCase,
  ) {}

  /**
   * Quiz оролдлого илгээх.
   * @param quizId - Quiz-ийн ID
   * @param attemptId - Attempt-ийн ID
   * @param userId - Хэрэглэгчийн ID
   * @param dto - Хариултуудын мэдээлэл
   * @returns Шинэчилсэн attempt, хариултууд, сургалт дуусгасан эсэх
   */
  async execute(
    quizId: string,
    attemptId: string,
    userId: string,
    dto: SubmitAttemptDto,
  ): Promise<{
    attempt: ReturnType<
      import('../../domain/entities/quiz-attempt.entity').QuizAttemptEntity['toResponse']
    >;
    answers: any;
    courseCompleted: boolean;
  }> {
    /** 1. Attempt олдох эсэх шалгах */
    const attempt = await this.quizRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundException('Оролдлого олдсонгүй');
    }

    /** 2. Энэ хэрэглэгчийн attempt эсэх шалгах */
    if (attempt.userId !== userId) {
      throw new ForbiddenException('Энэ оролдлого таных биш байна');
    }

    /** 3. Аль хэдийн илгээгдсэн эсэх шалгах */
    if (attempt.submittedAt !== null) {
      throw new ConflictException('Энэ оролдлого аль хэдийн илгээгдсэн байна');
    }

    /** 4. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 5. Хугацааны хязгаар шалгах */
    if (quiz.timeLimitMinutes !== null) {
      const deadline = attempt.startedAt.getTime() + quiz.timeLimitMinutes * 60 * 1000;
      if (Date.now() > deadline) {
        throw new BadRequestException('Хугацаа дуусгавар болсон байна');
      }
    }

    /** 6. MongoDB-ээс асуултууд авах */
    const questionsDoc = await this.quizQuestionsRepository.findByQuizId(quizId);
    const questions: Record<string, any>[] = questionsDoc?.questions ?? [];

    /** 7. Хариултуудыг автомат дүгнэх */
    const { gradedAnswers, score, maxScore } = this.quizGradingService.gradeAnswers(
      dto.answers,
      questions,
    );

    /** 8. Тэнцсэн эсэх шалгах */
    const scorePercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = scorePercentage >= quiz.passingScorePercentage;

    /** 9. MongoDB-д хариултуудыг хадгалах */
    const savedAnswers = await this.quizAnswersRepository.create({
      attemptId,
      userId,
      quizId,
      answers: gradedAnswers,
      submittedAt: new Date(),
    });

    /** 10. PostgreSQL-д attempt шинэчлэх */
    const updatedAttempt = await this.quizRepository.updateAttempt(attemptId, {
      score,
      maxScore,
      passed,
      submittedAt: new Date(),
    });

    /** 11. Тэнцсэн бол хичээлийг дуусгах */
    let courseCompleted = false;
    if (passed) {
      try {
        const result = await this.completeLessonUseCase.execute(userId, quiz.lessonId);
        courseCompleted = result.courseCompleted;
        this.logger.log(`Хичээл автоматаар дууслаа: хэрэглэгч=${userId}, хичээл=${quiz.lessonId}`);
      } catch (error) {
        /** Аль хэдийн дуусгасан бол зүгээр алгасна */
        if (error instanceof ConflictException) {
          this.logger.debug(
            `Хичээл аль хэдийн дуусгасан байна: хэрэглэгч=${userId}, хичээл=${quiz.lessonId}`,
          );
        } else {
          throw error;
        }
      }
    }

    /** 12. Кэш устгах */
    await this.quizCacheService.invalidateAttemptCache(quizId, userId);

    this.logger.log(
      `Quiz оролдлого илгээгдлээ: attempt=${attemptId}, оноо=${score}/${maxScore}, тэнцсэн=${passed}`,
    );

    return {
      attempt: updatedAttempt.toResponse(),
      answers: savedAnswers,
      courseCompleted,
    };
  }
}
