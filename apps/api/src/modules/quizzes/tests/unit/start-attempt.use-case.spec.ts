import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { StartAttemptUseCase } from '../../application/use-cases/start-attempt.use-case';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { QuizAttemptEntity } from '../../domain/entities/quiz-attempt.entity';

describe('StartAttemptUseCase', () => {
  let useCase: StartAttemptUseCase;
  let mockQuizRepository: jest.Mocked<Partial<QuizRepository>>;
  let mockQuizQuestionsRepository: jest.Mocked<Partial<QuizQuestionsRepository>>;
  let mockQuizCacheService: jest.Mocked<Partial<QuizCacheService>>;
  let mockLessonRepository: jest.Mocked<Partial<LessonRepository>>;
  let mockEnrollmentRepository: jest.Mocked<Partial<EnrollmentRepository>>;

  const now = new Date();

  /** Тестэд ашиглах mock quiz */
  const mockQuiz = new QuizEntity({
    id: 'quiz-1',
    lessonId: 'lesson-1',
    title: 'React Hooks шалгалт',
    description: 'React Hooks-ийн мэдлэг шалгах quiz',
    timeLimitMinutes: 30,
    passingScorePercentage: 70,
    randomizeQuestions: false,
    randomizeOptions: false,
    maxAttempts: 3,
    createdAt: now,
    updatedAt: now,
    courseId: 'course-1',
    instructorId: 'instructor-1',
  });

  /** Тестэд ашиглах хязгааргүй quiz (maxAttempts = null) */
  const mockUnlimitedQuiz = new QuizEntity({
    id: 'quiz-2',
    lessonId: 'lesson-2',
    title: 'Хязгааргүй quiz',
    description: null,
    timeLimitMinutes: null,
    passingScorePercentage: 60,
    randomizeQuestions: false,
    randomizeOptions: false,
    maxAttempts: null,
    createdAt: now,
    updatedAt: now,
    courseId: 'course-1',
    instructorId: 'instructor-1',
  });

  /** Тестэд ашиглах mock хичээл */
  const mockLesson = {
    id: 'lesson-1',
    courseId: 'course-1',
    title: 'Quiz хичээл',
    orderIndex: 0,
    lessonType: 'quiz',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
    courseTitle: 'Сургалт 1',
    courseInstructorId: 'instructor-1',
  };

  /** Тестэд ашиглах mock элсэлт */
  const mockEnrollment = {
    id: 'enrollment-1',
    userId: 'user-1',
    courseId: 'course-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  /** Тестэд ашиглах mock attempt */
  const mockAttempt = new QuizAttemptEntity({
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    score: 0,
    maxScore: 0,
    passed: false,
    startedAt: now,
    submittedAt: null,
    createdAt: now,
  });

  /** Тестэд ашиглах mock асуултууд (MongoDB-ээс) */
  const mockQuestionsDoc = {
    quizId: 'quiz-1',
    questions: [
      {
        questionId: 'q1',
        type: 'multiple_choice',
        text: 'React hook гэж юу вэ?',
        points: 10,
        options: [
          { id: 'a', text: 'Function', isCorrect: true },
          { id: 'b', text: 'Class', isCorrect: false },
        ],
        correctAnswer: 'a',
        solution: 'Hooks нь function юм.',
      },
      {
        questionId: 'q2',
        type: 'true_false',
        text: 'useState нь hook мөн үү?',
        points: 5,
        isCorrect: true,
        correctAnswer: true,
        solution: 'useState бол React-ийн hook юм.',
      },
    ],
  };

  beforeEach(() => {
    mockQuizRepository = {
      findById: jest.fn(),
      findInProgressAttempt: jest.fn(),
      countSubmittedAttempts: jest.fn(),
      createAttempt: jest.fn(),
    };
    mockQuizQuestionsRepository = {
      findByQuizId: jest.fn(),
    };
    mockQuizCacheService = {
      invalidateAttemptCache: jest.fn(),
    };
    mockLessonRepository = {
      findById: jest.fn(),
    };
    mockEnrollmentRepository = {
      findByUserAndCourse: jest.fn(),
    };

    useCase = new StartAttemptUseCase(
      mockQuizRepository as any,
      mockQuizQuestionsRepository as any,
      mockQuizCacheService as any,
      mockLessonRepository as any,
      mockEnrollmentRepository as any,
    );
  });

  it('оролдлого амжилттай эхлүүлэх — бүх шалгалт давсан', async () => {
    /** Quiz олдоно */
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    /** Хичээл нийтлэгдсэн */
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    /** Элсэлт идэвхтэй */
    mockEnrollmentRepository.findByUserAndCourse!.mockResolvedValue(mockEnrollment as any);
    /** Дуусаагүй оролдлого байхгүй */
    mockQuizRepository.findInProgressAttempt!.mockResolvedValue(null);
    /** Өмнөх оролдлого 1 — хязгаар 3 */
    mockQuizRepository.countSubmittedAttempts!.mockResolvedValue(1);
    /** Шинэ attempt үүссэн */
    mockQuizRepository.createAttempt!.mockResolvedValue(mockAttempt);
    /** MongoDB-ээс асуултууд авсан */
    mockQuizQuestionsRepository.findByQuizId!.mockResolvedValue(mockQuestionsDoc as any);

    const result = await useCase.execute('quiz-1', 'user-1');

    expect(result.attempt).toEqual(mockAttempt);
    expect(result.questions).toBeDefined();
    expect(result.questions.length).toBe(2);
    expect(mockQuizRepository.findById).toHaveBeenCalledWith('quiz-1');
    expect(mockLessonRepository.findById).toHaveBeenCalledWith('lesson-1');
    expect(mockEnrollmentRepository.findByUserAndCourse).toHaveBeenCalledWith('user-1', 'course-1');
    expect(mockQuizRepository.findInProgressAttempt).toHaveBeenCalledWith('quiz-1', 'user-1');
    expect(mockQuizRepository.countSubmittedAttempts).toHaveBeenCalledWith('quiz-1', 'user-1');
    expect(mockQuizRepository.createAttempt).toHaveBeenCalledWith({
      quizId: 'quiz-1',
      userId: 'user-1',
    });
  });

  it('quiz олдоогүй бол NotFoundException шидэх', async () => {
    mockQuizRepository.findById!.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);

    /** Цаашдын шалгалт хийгдээгүй */
    expect(mockLessonRepository.findById).not.toHaveBeenCalled();
  });

  it('нийтлэгдээгүй хичээл бол BadRequestException шидэх', async () => {
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    /** Хичээл нийтлэгдээгүй */
    const unpublishedLesson = { ...mockLesson, isPublished: false };
    mockLessonRepository.findById!.mockResolvedValue(unpublishedLesson as any);

    await expect(useCase.execute('quiz-1', 'user-1')).rejects.toThrow(BadRequestException);

    /** Элсэлтийн шалгалт хийгдээгүй */
    expect(mockEnrollmentRepository.findByUserAndCourse).not.toHaveBeenCalled();
  });

  it('элсээгүй бол ForbiddenException шидэх', async () => {
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    /** Элсэлт олдоогүй */
    mockEnrollmentRepository.findByUserAndCourse!.mockResolvedValue(null);

    await expect(useCase.execute('quiz-1', 'user-1')).rejects.toThrow(ForbiddenException);

    /** Оролдлогын шалгалт хийгдээгүй */
    expect(mockQuizRepository.findInProgressAttempt).not.toHaveBeenCalled();
  });

  it('элсэлт идэвхгүй бол ForbiddenException шидэх', async () => {
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    /** Элсэлт cancelled төлөвтэй */
    const cancelledEnrollment = { ...mockEnrollment, status: 'cancelled' };
    mockEnrollmentRepository.findByUserAndCourse!.mockResolvedValue(cancelledEnrollment as any);

    await expect(useCase.execute('quiz-1', 'user-1')).rejects.toThrow(ForbiddenException);
  });

  it('дуусаагүй оролдлого байвал ConflictException шидэх', async () => {
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    mockEnrollmentRepository.findByUserAndCourse!.mockResolvedValue(mockEnrollment as any);
    /** Дуусаагүй оролдлого олдсон */
    mockQuizRepository.findInProgressAttempt!.mockResolvedValue(mockAttempt);

    await expect(useCase.execute('quiz-1', 'user-1')).rejects.toThrow(ConflictException);

    /** Шинэ attempt үүсгэх гэж оролдоогүй */
    expect(mockQuizRepository.createAttempt).not.toHaveBeenCalled();
  });

  it('дахин оролдлогын хязгаарт хүрсэн бол BadRequestException шидэх', async () => {
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    mockEnrollmentRepository.findByUserAndCourse!.mockResolvedValue(mockEnrollment as any);
    mockQuizRepository.findInProgressAttempt!.mockResolvedValue(null);
    /** maxAttempts = 3, аль хэдийн 3 удаа оролдсон */
    mockQuizRepository.countSubmittedAttempts!.mockResolvedValue(3);

    await expect(useCase.execute('quiz-1', 'user-1')).rejects.toThrow(BadRequestException);

    /** Шинэ attempt үүсгэх гэж оролдоогүй */
    expect(mockQuizRepository.createAttempt).not.toHaveBeenCalled();
  });

  it('maxAttempts null бол хязгаарын шалгалт алгасах', async () => {
    /** Хязгааргүй quiz ашиглана */
    mockQuizRepository.findById!.mockResolvedValue(mockUnlimitedQuiz);
    mockLessonRepository.findById!.mockResolvedValue({
      ...mockLesson,
      id: 'lesson-2',
    } as any);
    mockEnrollmentRepository.findByUserAndCourse!.mockResolvedValue(mockEnrollment as any);
    mockQuizRepository.findInProgressAttempt!.mockResolvedValue(null);
    /** Attempt үүссэн */
    const unlimitedAttempt = new QuizAttemptEntity({
      ...mockAttempt,
      quizId: 'quiz-2',
    });
    mockQuizRepository.createAttempt!.mockResolvedValue(unlimitedAttempt);
    mockQuizQuestionsRepository.findByQuizId!.mockResolvedValue({
      quizId: 'quiz-2',
      questions: [],
    } as any);

    const result = await useCase.execute('quiz-2', 'user-1');

    /** countSubmittedAttempts дуудагдаагүй — maxAttempts null учир */
    expect(mockQuizRepository.countSubmittedAttempts).not.toHaveBeenCalled();
    expect(result.attempt).toEqual(unlimitedAttempt);
  });

  it('асуултуудаас зөв хариулт нуугдсан эсэх шалгах', async () => {
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    mockEnrollmentRepository.findByUserAndCourse!.mockResolvedValue(mockEnrollment as any);
    mockQuizRepository.findInProgressAttempt!.mockResolvedValue(null);
    mockQuizRepository.countSubmittedAttempts!.mockResolvedValue(0);
    mockQuizRepository.createAttempt!.mockResolvedValue(mockAttempt);
    mockQuizQuestionsRepository.findByQuizId!.mockResolvedValue(mockQuestionsDoc as any);

    const result = await useCase.execute('quiz-1', 'user-1');

    /** Зөв хариултын мэдээлэл устгагдсан байх ёстой */
    for (const question of result.questions) {
      expect(question.isCorrect).toBeUndefined();
      expect(question.correctAnswer).toBeUndefined();
      expect(question.correctAnswers).toBeUndefined();
      expect(question.solution).toBeUndefined();
    }

    /** Сонголтуудаас isCorrect устгагдсан */
    const multipleChoiceQ = result.questions.find((q) => q.type === 'multiple_choice');
    if (multipleChoiceQ?.options) {
      for (const option of multipleChoiceQ.options) {
        expect(option.isCorrect).toBeUndefined();
      }
    }
  });
});
