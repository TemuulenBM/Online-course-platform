import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { GradeAttemptUseCase } from '../../application/use-cases/grade-attempt.use-case';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizAnswersRepository } from '../../infrastructure/repositories/quiz-answers.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { CompleteLessonUseCase } from '../../../progress/application/use-cases/complete-lesson.use-case';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { QuizAttemptEntity } from '../../domain/entities/quiz-attempt.entity';
import { GradeAttemptDto } from '../../dto/grade-attempt.dto';

describe('GradeAttemptUseCase', () => {
  let useCase: GradeAttemptUseCase;
  let mockQuizRepository: jest.Mocked<Partial<QuizRepository>>;
  let mockQuizAnswersRepository: jest.Mocked<Partial<QuizAnswersRepository>>;
  let mockQuizCacheService: jest.Mocked<Partial<QuizCacheService>>;
  let mockCompleteLessonUseCase: jest.Mocked<Partial<CompleteLessonUseCase>>;

  const now = new Date();

  /** Тестэд ашиглах mock quiz */
  const mockQuiz = new QuizEntity({
    id: 'quiz-1',
    lessonId: 'lesson-1',
    title: 'React Hooks шалгалт',
    description: null,
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

  /** Тестэд ашиглах mock attempt — илгээгдсэн, тэнцээгүй */
  const mockSubmittedAttempt = new QuizAttemptEntity({
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'student-1',
    score: 40,
    maxScore: 100,
    passed: false,
    startedAt: now,
    submittedAt: now,
    createdAt: now,
  });

  /** Тестэд ашиглах mock attempt — илгээгдсэн, тэнцсэн (өмнө нь) */
  const mockAlreadyPassedAttempt = new QuizAttemptEntity({
    id: 'attempt-2',
    quizId: 'quiz-1',
    userId: 'student-1',
    score: 80,
    maxScore: 100,
    passed: true,
    startedAt: now,
    submittedAt: now,
    createdAt: now,
  });

  /** Тестэд ашиглах mock attempt — илгээгдээгүй */
  const mockNotSubmittedAttempt = new QuizAttemptEntity({
    id: 'attempt-3',
    quizId: 'quiz-1',
    userId: 'student-1',
    score: 0,
    maxScore: 0,
    passed: false,
    startedAt: now,
    submittedAt: null,
    createdAt: now,
  });

  /** Тестэд ашиглах mock шинэчлэгдсэн attempt — дүгнэсний дараа тэнцсэн */
  const mockUpdatedPassedAttempt = new QuizAttemptEntity({
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'student-1',
    score: 75,
    maxScore: 100,
    passed: true,
    startedAt: now,
    submittedAt: now,
    createdAt: now,
  });

  /** Тестэд ашиглах mock шинэчлэгдсэн attempt — дүгнэсний дараа тэнцээгүй */
  const mockUpdatedFailedAttempt = new QuizAttemptEntity({
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'student-1',
    score: 50,
    maxScore: 100,
    passed: false,
    startedAt: now,
    submittedAt: now,
    createdAt: now,
  });

  /** Тестэд ашиглах DTO */
  const mockDto: GradeAttemptDto = {
    questionId: 'q1',
    pointsEarned: 15,
    isCorrect: true,
    feedback: 'Маш сайн тайлбарлажээ',
    rubricScores: [
      { criterion: 'Ойлголт', points: 8 },
      { criterion: 'Жишээ', points: 7 },
    ],
  };

  /** MongoDB-ээс буцах mock хариултууд (дүгнэсний дараа) */
  const mockAnswersDocAfterGrade = {
    attemptId: 'attempt-1',
    userId: 'student-1',
    quizId: 'quiz-1',
    answers: [
      {
        questionId: 'q1',
        answerData: {
          pointsEarned: 15,
          isCorrect: true,
          feedback: 'Маш сайн тайлбарлажээ',
        },
      },
      {
        questionId: 'q2',
        answerData: { pointsEarned: 60, isCorrect: true },
      },
    ],
  };

  /** Тэнцэхэд хүрэлцэхгүй нийт оноотой хариултууд */
  const mockAnswersDocFailedGrade = {
    attemptId: 'attempt-1',
    userId: 'student-1',
    quizId: 'quiz-1',
    answers: [
      {
        questionId: 'q1',
        answerData: { pointsEarned: 10, isCorrect: false },
      },
      {
        questionId: 'q2',
        answerData: { pointsEarned: 40, isCorrect: true },
      },
    ],
  };

  beforeEach(() => {
    mockQuizRepository = {
      findById: jest.fn(),
      findAttemptById: jest.fn(),
      updateAttempt: jest.fn(),
    };
    mockQuizAnswersRepository = {
      gradeAnswer: jest.fn(),
      findByAttemptId: jest.fn(),
    };
    mockQuizCacheService = {
      invalidateAttemptCache: jest.fn(),
    };
    mockCompleteLessonUseCase = {
      execute: jest.fn(),
    };

    useCase = new GradeAttemptUseCase(
      mockQuizRepository as any,
      mockQuizAnswersRepository as any,
      mockQuizCacheService as any,
      mockCompleteLessonUseCase as any,
    );
  });

  it('гараар дүгнэлт амжилттай — тэнцсэн', async () => {
    /** Attempt олдоно, илгээгдсэн, өмнө тэнцээгүй */
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockSubmittedAttempt);
    /** Quiz олдоно */
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    /** MongoDB-д хариулт дүгнэгдсэн */
    mockQuizAnswersRepository.gradeAnswer!.mockResolvedValue(undefined as any);
    /** Бүх хариултуудаас нийт оноо тооцоолсон — тэнцэх хэмжээнд */
    mockQuizAnswersRepository
      .findByAttemptId!.mockResolvedValueOnce(mockAnswersDocAfterGrade as any)
      .mockResolvedValueOnce(mockAnswersDocAfterGrade as any);
    /** Attempt шинэчлэгдсэн */
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedPassedAttempt);
    /** Хичээл дуусгах амжилттай */
    mockCompleteLessonUseCase.execute!.mockResolvedValue({
      courseCompleted: false,
      progress: {} as any,
    });

    const result = await useCase.execute('attempt-1', 'instructor-1', 'TEACHER', mockDto);

    expect(result.attempt).toBeDefined();
    expect(result.answers).toBeDefined();
    /** MongoDB gradeAnswer дуудагдсан */
    expect(mockQuizAnswersRepository.gradeAnswer).toHaveBeenCalledWith(
      'attempt-1',
      'q1',
      expect.objectContaining({
        pointsEarned: 15,
        isCorrect: true,
        feedback: 'Маш сайн тайлбарлажээ',
        gradedBy: 'instructor-1',
        gradedAt: expect.any(Date),
        rubricScores: mockDto.rubricScores,
      }),
    );
    /** Attempt шинэчлэгдсэн */
    expect(mockQuizRepository.updateAttempt).toHaveBeenCalledWith(
      'attempt-1',
      expect.objectContaining({
        passed: true,
      }),
    );
    /** Шинээр тэнцсэн учир CompleteLessonUseCase дуудагдсан */
    expect(mockCompleteLessonUseCase.execute).toHaveBeenCalledWith('student-1', 'lesson-1');
    /** Кэш устгагдсан */
    expect(mockQuizCacheService.invalidateAttemptCache).toHaveBeenCalledWith('quiz-1', 'student-1');
  });

  it('оролдлого олдоогүй бол NotFoundException шидэх', async () => {
    mockQuizRepository.findAttemptById!.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'instructor-1', 'TEACHER', mockDto),
    ).rejects.toThrow(NotFoundException);

    /** Цаашдын шалгалт хийгдээгүй */
    expect(mockQuizRepository.findById).not.toHaveBeenCalled();
    expect(mockQuizAnswersRepository.gradeAnswer).not.toHaveBeenCalled();
  });

  it('илгээгдээгүй оролдлогыг дүгнэх бол BadRequestException шидэх', async () => {
    /** Attempt илгээгдээгүй (submittedAt = null) */
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockNotSubmittedAttempt);

    await expect(useCase.execute('attempt-3', 'instructor-1', 'TEACHER', mockDto)).rejects.toThrow(
      BadRequestException,
    );

    /** Quiz хайлт хийгдээгүй */
    expect(mockQuizRepository.findById).not.toHaveBeenCalled();
    expect(mockQuizAnswersRepository.gradeAnswer).not.toHaveBeenCalled();
  });

  it('эрхгүй хэрэглэгч бол ForbiddenException шидэх', async () => {
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockSubmittedAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);

    /** Эзэмшигч биш, ADMIN биш — TEACHER эрхтэй гэхдээ өөр хүний quiz */
    await expect(useCase.execute('attempt-1', 'other-teacher', 'TEACHER', mockDto)).rejects.toThrow(
      ForbiddenException,
    );

    /** Дүгнэлт хийгдээгүй */
    expect(mockQuizAnswersRepository.gradeAnswer).not.toHaveBeenCalled();
  });

  it('ADMIN бол эзэмшигч биш байсан ч дүгнэх боломжтой', async () => {
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockSubmittedAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockQuizAnswersRepository.gradeAnswer!.mockResolvedValue(undefined as any);
    mockQuizAnswersRepository
      .findByAttemptId!.mockResolvedValueOnce(mockAnswersDocAfterGrade as any)
      .mockResolvedValueOnce(mockAnswersDocAfterGrade as any);
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedPassedAttempt);
    mockCompleteLessonUseCase.execute!.mockResolvedValue({
      courseCompleted: false,
      progress: {} as any,
    });

    /** ADMIN хэрэглэгч — ForbiddenException шидэхгүй */
    const result = await useCase.execute('attempt-1', 'admin-user-1', 'ADMIN', mockDto);

    expect(result.attempt).toBeDefined();
    expect(mockQuizAnswersRepository.gradeAnswer).toHaveBeenCalled();
  });

  it('дүгнэсний дараа тэнцсэн бол CompleteLessonUseCase дуудагдах', async () => {
    /** Attempt өмнө тэнцээгүй (passed: false) */
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockSubmittedAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockQuizAnswersRepository.gradeAnswer!.mockResolvedValue(undefined as any);
    /** Тэнцэх хэмжээний оноо авсан */
    mockQuizAnswersRepository
      .findByAttemptId!.mockResolvedValueOnce(mockAnswersDocAfterGrade as any)
      .mockResolvedValueOnce(mockAnswersDocAfterGrade as any);
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedPassedAttempt);
    mockCompleteLessonUseCase.execute!.mockResolvedValue({
      courseCompleted: true,
      progress: {} as any,
    });

    await useCase.execute('attempt-1', 'instructor-1', 'TEACHER', mockDto);

    /** Шинээр тэнцсэн (өмнө passed=false, одоо passed=true) → completeLesson дуудагдсан */
    expect(mockCompleteLessonUseCase.execute).toHaveBeenCalledWith('student-1', 'lesson-1');
  });

  it('өмнө нь тэнцсэн бол CompleteLessonUseCase дуудагдахгүй', async () => {
    /** Attempt өмнө нь тэнцсэн (passed: true) */
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockAlreadyPassedAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockQuizAnswersRepository.gradeAnswer!.mockResolvedValue(undefined as any);
    mockQuizAnswersRepository
      .findByAttemptId!.mockResolvedValueOnce(mockAnswersDocAfterGrade as any)
      .mockResolvedValueOnce(mockAnswersDocAfterGrade as any);
    /** Дахин тэнцсэн ч гэсэн */
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedPassedAttempt);

    await useCase.execute('attempt-2', 'instructor-1', 'TEACHER', mockDto);

    /** Өмнө нь тэнцсэн (attempt.passed === true) → completeLesson дуудагдахгүй */
    expect(mockCompleteLessonUseCase.execute).not.toHaveBeenCalled();
  });

  it('CompleteLessonUseCase ConflictException шидвэл алгасна', async () => {
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockSubmittedAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockQuizAnswersRepository.gradeAnswer!.mockResolvedValue(undefined as any);
    mockQuizAnswersRepository
      .findByAttemptId!.mockResolvedValueOnce(mockAnswersDocAfterGrade as any)
      .mockResolvedValueOnce(mockAnswersDocAfterGrade as any);
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedPassedAttempt);
    /** CompleteLessonUseCase нь ConflictException шидэх */
    mockCompleteLessonUseCase.execute!.mockRejectedValue(
      new ConflictException('Аль хэдийн дуусгасан'),
    );

    /** Алдаа шидэхгүй — зүгээр алгасна */
    const result = await useCase.execute('attempt-1', 'instructor-1', 'TEACHER', mockDto);

    expect(result.attempt).toBeDefined();
    /** Кэш устгалт хийгдсэн */
    expect(mockQuizCacheService.invalidateAttemptCache).toHaveBeenCalled();
  });
});
