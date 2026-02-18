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
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { QuizAttemptEntity } from '../../domain/entities/quiz-attempt.entity';

/**
 * Quiz оролдлого эхлүүлэх use case.
 * Quiz-ийн хүчинтэй байдал, элсэлтийн төлөв, оролдлогын хязгаарыг шалгаж
 * шинэ attempt үүсгэн, зөв хариултыг нуусан асуултуудыг буцаана.
 */
@Injectable()
export class StartAttemptUseCase {
  private readonly logger = new Logger(StartAttemptUseCase.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly quizCacheService: QuizCacheService,
    private readonly lessonRepository: LessonRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  /**
   * Quiz оролдлого эхлүүлэх.
   * @param quizId - Quiz-ийн ID
   * @param userId - Хэрэглэгчийн ID
   * @returns Шинэ attempt болон зөв хариултыг нуусан асуултууд
   */
  async execute(
    quizId: string,
    userId: string,
  ): Promise<{ attempt: QuizAttemptEntity; questions: Record<string, any>[] }> {
    /** 1. Quiz олдох эсэх шалгах */
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz олдсонгүй');
    }

    /** 2. Хичээл нийтлэгдсэн эсэх шалгах */
    const lesson = await this.lessonRepository.findById(quiz.lessonId);
    if (!lesson || !lesson.isPublished) {
      throw new BadRequestException('Нийтлэгдээгүй хичээлийн quiz-д оролдоо хийх боломжгүй');
    }

    /** 3. Элсэлтийн төлөв шалгах */
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, quiz.courseId!);
    if (!enrollment || enrollment.status !== 'active') {
      throw new ForbiddenException('Энэ сургалтад элсээгүй эсвэл элсэлт идэвхгүй байна');
    }

    /** 4. Дуусаагүй оролдлого байгаа эсэх шалгах */
    const inProgress = await this.quizRepository.findInProgressAttempt(quizId, userId);
    if (inProgress) {
      throw new ConflictException('Дуусаагүй оролдлого байна. Эхлээд хариултаа илгээнэ үү');
    }

    /** 5. Дахин оролдлогын хязгаар шалгах */
    if (quiz.maxAttempts !== null) {
      const count = await this.quizRepository.countSubmittedAttempts(quizId, userId);
      if (count >= quiz.maxAttempts) {
        throw new BadRequestException('Дахин оролдлогын хязгаарт хүрсэн байна');
      }
    }

    /** 6. Шинэ attempt үүсгэх */
    const attempt = await this.quizRepository.createAttempt({
      quizId,
      userId,
    });

    /** 7. MongoDB-ээс асуултууд авах */
    const questionsDoc = await this.quizQuestionsRepository.findByQuizId(quizId);
    let questions: Record<string, any>[] = questionsDoc?.questions ?? [];

    /** 8. Зөв хариултын мэдээллийг нуух (strip) */
    questions = questions.map((q) => this.stripCorrectAnswers(q));

    /** 9. Асуултуудыг санамсаргүй дараалалд оруулах */
    if (quiz.randomizeQuestions) {
      questions = this.shuffle([...questions]);
    }

    /** 10. Сонголтуудыг санамсаргүй дараалалд оруулах */
    if (quiz.randomizeOptions) {
      questions = questions.map((q) => {
        if (q.options && Array.isArray(q.options)) {
          return { ...q, options: this.shuffle([...q.options]) };
        }
        return q;
      });
    }

    this.logger.log(
      `Quiz оролдлого эхэллээ: attempt=${attempt.id}, quiz=${quizId}, хэрэглэгч=${userId}`,
    );

    return { attempt, questions };
  }

  /**
   * Зөв хариултын мэдээллийг асуултаас хасах.
   * isCorrect, correctAnswer, correctAnswers, solution талбаруудыг устгана.
   */
  private stripCorrectAnswers(question: Record<string, any>): Record<string, any> {
    const sanitized = { ...question };

    /** Шууд талбаруудыг устгах */
    delete sanitized.isCorrect;
    delete sanitized.correctAnswer;
    delete sanitized.correctAnswers;
    delete sanitized.solution;
    delete sanitized.caseSensitive;

    /** Сонголтуудаас isCorrect талбарыг устгах */
    if (sanitized.options && Array.isArray(sanitized.options)) {
      sanitized.options = sanitized.options.map((option: Record<string, any>) => {
        const sanitizedOption = { ...option };
        delete sanitizedOption.isCorrect;
        return sanitizedOption;
      });
    }

    return sanitized;
  }

  /**
   * Fisher-Yates (Knuth) shuffle алгоритм.
   * Массивыг санамсаргүй дараалалд оруулна.
   */
  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
