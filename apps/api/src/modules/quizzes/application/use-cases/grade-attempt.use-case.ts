import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizAnswersRepository } from '../../infrastructure/repositories/quiz-answers.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { CompleteLessonUseCase } from '../../../progress/application/use-cases/complete-lesson.use-case';
import { GradeAttemptDto } from '../../dto/grade-attempt.dto';

/**
 * Quiz оролдлого гараар дүгнэх use case.
 * Багш/ADMIN essay, code_challenge төрлийн хариултыг гараар дүгнэнэ.
 * Дүгнэсний дараа нийт оноог дахин тооцоолж, тэнцсэн бол хичээлийг дуусгана.
 */
@Injectable()
export class GradeAttemptUseCase {
  private readonly logger = new Logger(GradeAttemptUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizAnswersRepository: QuizAnswersRepository,
    private readonly quizCacheService: QuizCacheService,
    private readonly completeLessonUseCase: CompleteLessonUseCase,
  ) {}

  /**
   * Тодорхой асуултыг гараар дүгнэх.
   * @param attemptId - Attempt-ийн ID
   * @param userId - Одоогийн хэрэглэгчийн ID (дүгнэгч)
   * @param userRole - Одоогийн хэрэглэгчийн эрх
   * @param dto - Дүгнэлтийн мэдээлэл (questionId, pointsEarned, isCorrect, feedback, rubricScores)
   * @returns Шинэчлэгдсэн attempt болон хариултууд
   */
  async execute(
    attemptId: string,
    userId: string,
    userRole: string,
    dto: GradeAttemptDto,
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

    /** 2. Илгээгдсэн эсэх шалгах — илгээгдээгүйг дүгнэх боломжгүй */
    if (attempt.submittedAt === null) {
      throw new BadRequestException('Илгээгдээгүй оролдлогыг дүгнэх боломжгүй');
    }

    /** 3. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(attempt.quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 4. Эзэмшигч/ADMIN эрхийн шалгалт */
    if (quiz.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ оролдлогыг дүгнэх эрхгүй байна');
    }

    /** 5. MongoDB-д тухайн асуултын хариултыг дүгнэх */
    await this.quizAnswersRepository.gradeAnswer(attemptId, dto.questionId, {
      pointsEarned: dto.pointsEarned,
      isCorrect: dto.isCorrect,
      feedback: dto.feedback,
      gradedBy: userId,
      gradedAt: new Date(),
      rubricScores: dto.rubricScores,
    });

    /** 6. Бүх хариултуудаас нийт оноог дахин тооцоолох */
    const answersDoc = await this.quizAnswersRepository.findByAttemptId(attemptId);
    let newScore = 0;
    let maxScore = 0;

    if (answersDoc?.answers) {
      for (const answer of answersDoc.answers) {
        const pointsEarned = answer.answerData?.pointsEarned ?? 0;
        newScore += pointsEarned;

        /** maxScore-г question points-оос тооцоолох — answers дотор хадгалагдаагүй бол attempt-ийн maxScore ашиглана */
      }
    }

    /** Attempt-ийн maxScore ашиглана (questions-ийн нийт оноо) */
    maxScore = attempt.maxScore > 0 ? attempt.maxScore : maxScore;

    /** 7. Тэнцсэн эсэх шалгах */
    const scorePercentage = maxScore > 0 ? Math.round((newScore / maxScore) * 100) : 0;
    const newPassed = scorePercentage >= quiz.passingScorePercentage;

    /** 8. PostgreSQL-д attempt шинэчлэх */
    const updatedAttempt = await this.quizRepository.updateAttempt(attemptId, {
      score: newScore,
      maxScore,
      passed: newPassed,
      submittedAt: attempt.submittedAt,
    });

    /** 9. Шинээр тэнцсэн бол (өмнө тэнцээгүй байсан) хичээлийг дуусгах */
    if (newPassed && !attempt.passed) {
      try {
        await this.completeLessonUseCase.execute(attempt.userId, quiz.lessonId);
        this.logger.log(
          `Гараар дүгнэсний дараа хичээл дууслаа: хэрэглэгч=${attempt.userId}, хичээл=${quiz.lessonId}`,
        );
      } catch (error) {
        /** Аль хэдийн дуусгасан бол зүгээр алгасна */
        if (error instanceof ConflictException) {
          this.logger.debug(
            `Хичээл аль хэдийн дуусгасан байна: хэрэглэгч=${attempt.userId}, хичээл=${quiz.lessonId}`,
          );
        } else {
          throw error;
        }
      }
    }

    /** 10. Кэш устгах */
    await this.quizCacheService.invalidateAttemptCache(attempt.quizId, attempt.userId);

    /** Шинэчилсэн хариултуудыг дахин авах */
    const updatedAnswers = await this.quizAnswersRepository.findByAttemptId(attemptId);

    this.logger.log(
      `Оролдлого дүгнэгдлээ: attempt=${attemptId}, шинэ оноо=${newScore}/${maxScore}, тэнцсэн=${newPassed}`,
    );

    return {
      attempt: updatedAttempt.toResponse(),
      answers: updatedAnswers,
    };
  }
}
