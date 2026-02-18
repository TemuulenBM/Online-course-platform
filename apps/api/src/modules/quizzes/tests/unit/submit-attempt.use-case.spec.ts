import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { SubmitAttemptUseCase } from '../../application/use-cases/submit-attempt.use-case';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizAnswersRepository } from '../../infrastructure/repositories/quiz-answers.repository';
import { QuizGradingService } from '../../infrastructure/services/quiz-grading.service';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { CompleteLessonUseCase } from '../../../progress/application/use-cases/complete-lesson.use-case';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { QuizAttemptEntity } from '../../domain/entities/quiz-attempt.entity';
import { SubmitAttemptDto } from '../../dto/submit-attempt.dto';

describe('SubmitAttemptUseCase', () => {
  let useCase: SubmitAttemptUseCase;
  let mockQuizRepository: jest.Mocked<Partial<QuizRepository>>;
  let mockQuizQuestionsRepository: jest.Mocked<Partial<QuizQuestionsRepository>>;
  let mockQuizAnswersRepository: jest.Mocked<Partial<QuizAnswersRepository>>;
  let mockQuizGradingService: jest.Mocked<Partial<QuizGradingService>>;
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

  /** Тестэд ашиглах хугацааны хязгааргүй quiz */
  const mockNoTimeLimitQuiz = new QuizEntity({
    id: 'quiz-2',
    lessonId: 'lesson-2',
    title: 'Хугацааны хязгааргүй quiz',
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

  /** Тестэд ашиглах mock attempt — дуусаагүй (submittedAt = null) */
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

  /** Тестэд ашиглах mock attempt — аль хэдийн илгээгдсэн */
  const mockSubmittedAttempt = new QuizAttemptEntity({
    id: 'attempt-2',
    quizId: 'quiz-1',
    userId: 'user-1',
    score: 80,
    maxScore: 100,
    passed: true,
    startedAt: now,
    submittedAt: now,
    createdAt: now,
  });

  /** Тестэд ашиглах mock шинэчлэгдсэн attempt — тэнцсэн */
  const mockUpdatedPassedAttempt = new QuizAttemptEntity({
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    score: 80,
    maxScore: 100,
    passed: true,
    startedAt: now,
    submittedAt: now,
    createdAt: now,
  });

  /** Тестэд ашиглах mock шинэчлэгдсэн attempt — тэнцээгүй */
  const mockUpdatedFailedAttempt = new QuizAttemptEntity({
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    score: 40,
    maxScore: 100,
    passed: false,
    startedAt: now,
    submittedAt: now,
    createdAt: now,
  });

  /** Тестэд ашиглах DTO */
  const mockDto: SubmitAttemptDto = {
    answers: [
      {
        questionId: 'q1',
        answerData: { type: 'multiple_choice', selectedOption: 'a' },
      },
      {
        questionId: 'q2',
        answerData: { type: 'true_false', selectedAnswer: true },
      },
    ],
  };

  /** Тестэд ашиглах mock асуултууд */
  const mockQuestionsDoc = {
    quizId: 'quiz-1',
    questions: [
      { questionId: 'q1', type: 'multiple_choice', points: 10 },
      { questionId: 'q2', type: 'true_false', points: 5 },
    ],
  };

  /** Тестэд ашиглах mock дүгнэлт — тэнцсэн */
  const mockPassedGradingResult = {
    gradedAnswers: [
      { questionId: 'q1', isCorrect: true, pointsEarned: 10 },
      { questionId: 'q2', isCorrect: true, pointsEarned: 5 },
    ],
    score: 80,
    maxScore: 100,
  };

  /** Тестэд ашиглах mock дүгнэлт — тэнцээгүй */
  const mockFailedGradingResult = {
    gradedAnswers: [
      { questionId: 'q1', isCorrect: false, pointsEarned: 0 },
      { questionId: 'q2', isCorrect: true, pointsEarned: 5 },
    ],
    score: 40,
    maxScore: 100,
  };

  /** Mock хадгалсан хариултууд */
  const mockSavedAnswers = {
    attemptId: 'attempt-1',
    userId: 'user-1',
    quizId: 'quiz-1',
    answers: mockPassedGradingResult.gradedAnswers,
  };

  beforeEach(() => {
    mockQuizRepository = {
      findById: jest.fn(),
      findAttemptById: jest.fn(),
      updateAttempt: jest.fn(),
    };
    mockQuizQuestionsRepository = {
      findByQuizId: jest.fn(),
    };
    mockQuizAnswersRepository = {
      create: jest.fn(),
    };
    mockQuizGradingService = {
      gradeAnswers: jest.fn(),
    };
    mockQuizCacheService = {
      invalidateAttemptCache: jest.fn(),
    };
    mockCompleteLessonUseCase = {
      execute: jest.fn(),
    };

    useCase = new SubmitAttemptUseCase(
      mockQuizRepository as any,
      mockQuizQuestionsRepository as any,
      mockQuizAnswersRepository as any,
      mockQuizGradingService as any,
      mockQuizCacheService as any,
      mockCompleteLessonUseCase as any,
    );
  });

  it('хариулт амжилттай илгээх — тэнцсэн', async () => {
    /** Attempt олдоно, илгээгдээгүй */
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockAttempt);
    /** Quiz олдоно */
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    /** Асуултууд олдоно */
    mockQuizQuestionsRepository.findByQuizId!.mockResolvedValue(mockQuestionsDoc as any);
    /** Автомат дүгнэлт — тэнцсэн */
    mockQuizGradingService.gradeAnswers!.mockReturnValue(mockPassedGradingResult as any);
    /** Хариултууд хадгалагдсан */
    mockQuizAnswersRepository.create!.mockResolvedValue(mockSavedAnswers as any);
    /** Attempt шинэчлэгдсэн */
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedPassedAttempt);
    /** Хичээл дуусгах — амжилттай */
    mockCompleteLessonUseCase.execute!.mockResolvedValue({
      courseCompleted: false,
      progress: {} as any,
    });

    const result = await useCase.execute('quiz-1', 'attempt-1', 'user-1', mockDto);

    expect(result.attempt).toBeDefined();
    expect(result.answers).toEqual(mockSavedAnswers);
    expect(result.courseCompleted).toBe(false);
    expect(mockQuizGradingService.gradeAnswers).toHaveBeenCalledWith(
      mockDto.answers,
      mockQuestionsDoc.questions,
    );
    expect(mockQuizAnswersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptId: 'attempt-1',
        userId: 'user-1',
        quizId: 'quiz-1',
      }),
    );
    expect(mockQuizRepository.updateAttempt).toHaveBeenCalledWith(
      'attempt-1',
      expect.objectContaining({
        score: 80,
        maxScore: 100,
        passed: true,
      }),
    );
    /** Тэнцсэн учир CompleteLessonUseCase дуудагдсан */
    expect(mockCompleteLessonUseCase.execute).toHaveBeenCalledWith('user-1', 'lesson-1');
    /** Кэш устгагдсан */
    expect(mockQuizCacheService.invalidateAttemptCache).toHaveBeenCalledWith('quiz-1', 'user-1');
  });

  it('хариулт амжилттай илгээх — тэнцээгүй', async () => {
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockQuizQuestionsRepository.findByQuizId!.mockResolvedValue(mockQuestionsDoc as any);
    /** Автомат дүгнэлт — тэнцээгүй */
    mockQuizGradingService.gradeAnswers!.mockReturnValue(mockFailedGradingResult as any);
    mockQuizAnswersRepository.create!.mockResolvedValue(mockSavedAnswers as any);
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedFailedAttempt);

    const result = await useCase.execute('quiz-1', 'attempt-1', 'user-1', mockDto);

    expect(result.courseCompleted).toBe(false);
    /** Тэнцээгүй учир CompleteLessonUseCase дуудагдаагүй */
    expect(mockCompleteLessonUseCase.execute).not.toHaveBeenCalled();
  });

  it('оролдлого олдоогүй бол NotFoundException шидэх', async () => {
    mockQuizRepository.findAttemptById!.mockResolvedValue(null);

    await expect(useCase.execute('quiz-1', 'nonexistent', 'user-1', mockDto)).rejects.toThrow(
      NotFoundException,
    );

    /** Цаашдын шалгалт хийгдээгүй */
    expect(mockQuizRepository.findById).not.toHaveBeenCalled();
    expect(mockQuizGradingService.gradeAnswers).not.toHaveBeenCalled();
  });

  it('бусдын оролдлогод хариулт илгээх бол ForbiddenException шидэх', async () => {
    /** Attempt нь өөр хэрэглэгчийнх */
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockAttempt);

    await expect(useCase.execute('quiz-1', 'attempt-1', 'other-user', mockDto)).rejects.toThrow(
      ForbiddenException,
    );

    /** Цаашдын шалгалт хийгдээгүй */
    expect(mockQuizRepository.findById).not.toHaveBeenCalled();
  });

  it('аль хэдийн илгээгдсэн бол ConflictException шидэх', async () => {
    /** Аль хэдийн илгээгдсэн attempt */
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockSubmittedAttempt);

    await expect(useCase.execute('quiz-1', 'attempt-2', 'user-1', mockDto)).rejects.toThrow(
      ConflictException,
    );

    /** Дүгнэлт хийгдээгүй */
    expect(mockQuizGradingService.gradeAnswers).not.toHaveBeenCalled();
  });

  it('хугацаа дуусгавар болсон бол BadRequestException шидэх', async () => {
    /** Attempt-ийн startedAt-г 1 цагийн өмнө болгож, timeLimitMinutes=30 */
    const expiredAttempt = new QuizAttemptEntity({
      id: 'attempt-1',
      quizId: 'quiz-1',
      userId: 'user-1',
      score: 0,
      maxScore: 0,
      passed: false,
      startedAt: new Date(Date.now() - 60 * 60 * 1000),
      submittedAt: null,
      createdAt: now,
    });

    mockQuizRepository.findAttemptById!.mockResolvedValue(expiredAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);

    await expect(useCase.execute('quiz-1', 'attempt-1', 'user-1', mockDto)).rejects.toThrow(
      BadRequestException,
    );

    /** Дүгнэлт хийгдээгүй */
    expect(mockQuizGradingService.gradeAnswers).not.toHaveBeenCalled();
  });

  it('тэнцсэн бол CompleteLessonUseCase дуудагдах', async () => {
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockQuizQuestionsRepository.findByQuizId!.mockResolvedValue(mockQuestionsDoc as any);
    mockQuizGradingService.gradeAnswers!.mockReturnValue(mockPassedGradingResult as any);
    mockQuizAnswersRepository.create!.mockResolvedValue(mockSavedAnswers as any);
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedPassedAttempt);
    mockCompleteLessonUseCase.execute!.mockResolvedValue({
      courseCompleted: true,
      progress: {} as any,
    });

    const result = await useCase.execute('quiz-1', 'attempt-1', 'user-1', mockDto);

    expect(mockCompleteLessonUseCase.execute).toHaveBeenCalledWith('user-1', 'lesson-1');
    expect(result.courseCompleted).toBe(true);
  });

  it('CompleteLessonUseCase ConflictException шидвэл алгасна', async () => {
    mockQuizRepository.findAttemptById!.mockResolvedValue(mockAttempt);
    mockQuizRepository.findById!.mockResolvedValue(mockQuiz);
    mockQuizQuestionsRepository.findByQuizId!.mockResolvedValue(mockQuestionsDoc as any);
    mockQuizGradingService.gradeAnswers!.mockReturnValue(mockPassedGradingResult as any);
    mockQuizAnswersRepository.create!.mockResolvedValue(mockSavedAnswers as any);
    mockQuizRepository.updateAttempt!.mockResolvedValue(mockUpdatedPassedAttempt);
    /** CompleteLessonUseCase нь ConflictException шидэх — аль хэдийн дуусгасан */
    mockCompleteLessonUseCase.execute!.mockRejectedValue(
      new ConflictException('Аль хэдийн дуусгасан'),
    );

    /** Алдаа шидэхгүй — зүгээр алгасна */
    const result = await useCase.execute('quiz-1', 'attempt-1', 'user-1', mockDto);

    expect(result.courseCompleted).toBe(false);
    /** Кэш устгалт хийгдсэн байх */
    expect(mockQuizCacheService.invalidateAttemptCache).toHaveBeenCalled();
  });
});
