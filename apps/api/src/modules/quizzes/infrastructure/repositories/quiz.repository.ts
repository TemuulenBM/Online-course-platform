import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { QuizAttemptEntity } from '../../domain/entities/quiz-attempt.entity';

/**
 * Quiz repository.
 * PostgreSQL-ийн quizzes болон quiz_attempts хүснэгтүүдтэй харьцах CRUD үйлдлүүд.
 */
@Injectable()
export class QuizRepository {
  private readonly logger = new Logger(QuizRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Quiz үүсгэх */
  async create(data: {
    lessonId: string;
    title: string;
    description?: string;
    timeLimitMinutes?: number;
    passingScorePercentage?: number;
    randomizeQuestions?: boolean;
    randomizeOptions?: boolean;
    maxAttempts?: number;
  }): Promise<QuizEntity> {
    const quiz = await this.prisma.quiz.create({
      data,
      include: {
        lesson: {
          select: {
            title: true,
            lessonType: true,
            courseId: true,
            course: { select: { instructorId: true } },
          },
        },
      },
    });
    this.logger.debug(`Quiz үүсгэгдлээ: ${quiz.id}`);
    return this.toQuizEntity(quiz);
  }

  /** Quiz ID-аар хайх */
  async findById(id: string): Promise<QuizEntity | null> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            title: true,
            lessonType: true,
            courseId: true,
            course: { select: { instructorId: true } },
          },
        },
      },
    });
    return quiz ? this.toQuizEntity(quiz) : null;
  }

  /** Lesson ID-аар quiz хайх */
  async findByLessonId(lessonId: string): Promise<QuizEntity | null> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        lesson: {
          select: {
            title: true,
            lessonType: true,
            courseId: true,
            course: { select: { instructorId: true } },
          },
        },
      },
    });
    return quiz ? this.toQuizEntity(quiz) : null;
  }

  /** Quiz шинэчлэх */
  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      timeLimitMinutes: number | null;
      passingScorePercentage: number;
      randomizeQuestions: boolean;
      randomizeOptions: boolean;
      maxAttempts: number | null;
    }>,
  ): Promise<QuizEntity> {
    const quiz = await this.prisma.quiz.update({
      where: { id },
      data,
      include: {
        lesson: {
          select: {
            title: true,
            lessonType: true,
            courseId: true,
            course: { select: { instructorId: true } },
          },
        },
      },
    });
    this.logger.debug(`Quiz шинэчлэгдлээ: ${id}`);
    return this.toQuizEntity(quiz);
  }

  /** Quiz устгах */
  async delete(id: string): Promise<void> {
    await this.prisma.quiz.delete({ where: { id } });
    this.logger.debug(`Quiz устгагдлаа: ${id}`);
  }

  // =====================
  // QuizAttempt үйлдлүүд
  // =====================

  /** Attempt үүсгэх */
  async createAttempt(data: { quizId: string; userId: string }): Promise<QuizAttemptEntity> {
    const attempt = await this.prisma.quizAttempt.create({
      data,
      include: {
        quiz: { select: { title: true, lessonId: true } },
      },
    });
    return this.toAttemptEntity(attempt);
  }

  /** Attempt ID-аар хайх */
  async findAttemptById(id: string): Promise<QuizAttemptEntity | null> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: { select: { title: true, lessonId: true } },
      },
    });
    return attempt ? this.toAttemptEntity(attempt) : null;
  }

  /** Хэрэглэгчийн тухайн quiz дээрх дуусаагүй attempt хайх */
  async findInProgressAttempt(quizId: string, userId: string): Promise<QuizAttemptEntity | null> {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { quizId, userId, submittedAt: null },
      include: {
        quiz: { select: { title: true, lessonId: true } },
      },
    });
    return attempt ? this.toAttemptEntity(attempt) : null;
  }

  /** Хэрэглэгчийн тухайн quiz дээрх илгээсэн оролдлогуудын тоо */
  async countSubmittedAttempts(quizId: string, userId: string): Promise<number> {
    return this.prisma.quizAttempt.count({
      where: { quizId, userId, submittedAt: { not: null } },
    });
  }

  /** Attempt шинэчлэх (submit үед) */
  async updateAttempt(
    id: string,
    data: {
      score: number;
      maxScore: number;
      passed: boolean;
      submittedAt: Date;
    },
  ): Promise<QuizAttemptEntity> {
    const attempt = await this.prisma.quizAttempt.update({
      where: { id },
      data,
      include: {
        quiz: { select: { title: true, lessonId: true } },
      },
    });
    return this.toAttemptEntity(attempt);
  }

  /** Хэрэглэгчийн тухайн quiz дээрх бүх оролдлого (миний оролдлогууд) */
  async findAttemptsByQuizAndUser(quizId: string, userId: string): Promise<QuizAttemptEntity[]> {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId, userId },
      orderBy: { createdAt: 'desc' },
      include: {
        quiz: { select: { title: true, lessonId: true } },
      },
    });
    return attempts.map((a) => this.toAttemptEntity(a));
  }

  /** Тухайн quiz дээрх бүх оюутнуудын оролдлого (багш/admin) */
  async findAttemptsByQuiz(
    quizId: string,
    options: { page: number; limit: number },
  ): Promise<{ data: QuizAttemptEntity[]; total: number; page: number; limit: number }> {
    const skip = (options.page - 1) * options.limit;
    const [attempts, total] = await Promise.all([
      this.prisma.quizAttempt.findMany({
        where: { quizId, submittedAt: { not: null } },
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          quiz: { select: { title: true, lessonId: true } },
        },
      }),
      this.prisma.quizAttempt.count({
        where: { quizId, submittedAt: { not: null } },
      }),
    ]);
    return {
      data: attempts.map((a) => this.toAttemptEntity(a)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Attempt устгах (admin) */
  async deleteAttempt(id: string): Promise<void> {
    await this.prisma.quizAttempt.delete({ where: { id } });
    this.logger.debug(`QuizAttempt устгагдлаа: ${id}`);
  }

  /** Хэрэглэгчийн тухайн quiz дээр тэнцсэн attempt байгаа эсэх */
  async hasPassedAttempt(quizId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.quizAttempt.count({
      where: { quizId, userId, passed: true },
    });
    return count > 0;
  }

  // =====================
  // Private helper-ууд
  // =====================

  /** Prisma Quiz → QuizEntity */
  private toQuizEntity(quiz: any): QuizEntity {
    return new QuizEntity({
      id: quiz.id,
      lessonId: quiz.lessonId,
      title: quiz.title,
      description: quiz.description,
      timeLimitMinutes: quiz.timeLimitMinutes,
      passingScorePercentage: quiz.passingScorePercentage,
      randomizeQuestions: quiz.randomizeQuestions,
      randomizeOptions: quiz.randomizeOptions,
      maxAttempts: quiz.maxAttempts,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      lessonTitle: quiz.lesson?.title,
      lessonType: quiz.lesson?.lessonType,
      courseId: quiz.lesson?.courseId,
      instructorId: quiz.lesson?.course?.instructorId,
    });
  }

  /** Prisma QuizAttempt → QuizAttemptEntity */
  private toAttemptEntity(attempt: any): QuizAttemptEntity {
    return new QuizAttemptEntity({
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      score: attempt.score,
      maxScore: attempt.maxScore,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      createdAt: attempt.createdAt,
      quizTitle: attempt.quiz?.title,
      lessonId: attempt.quiz?.lessonId,
    });
  }
}
