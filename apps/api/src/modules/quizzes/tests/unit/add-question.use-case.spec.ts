import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AddQuestionUseCase } from '../../application/use-cases/add-question.use-case';
import { QuizEntity } from '../../domain/entities/quiz.entity';

describe('AddQuestionUseCase', () => {
  let useCase: AddQuestionUseCase;
  let mockQuizRepository: { findById: jest.Mock };
  let mockQuizQuestionsRepository: {
    findByQuizId: jest.Mock;
    addQuestion: jest.Mock;
  };
  let mockQuizCacheService: { invalidateAll: jest.Mock };

  const now = new Date();

  /** Тестэд ашиглах mock quiz entity (instructorId-тэй) */
  const mockQuiz = new QuizEntity({
    id: 'quiz-1',
    lessonId: 'lesson-1',
    title: 'Тест quiz',
    description: null,
    timeLimitMinutes: null,
    passingScorePercentage: 70,
    randomizeQuestions: false,
    randomizeOptions: false,
    maxAttempts: null,
    createdAt: now,
    updatedAt: now,
    instructorId: 'instructor-1',
    courseId: 'course-1',
  });

  /** Тестэд ашиглах multiple_choice DTO */
  const multipleChoiceDto = {
    type: 'multiple_choice' as const,
    questionText: 'React гэж юу вэ?',
    points: 10,
    options: [
      { optionId: 'a', text: 'JavaScript library', isCorrect: true },
      { optionId: 'b', text: 'Programming language', isCorrect: false },
    ],
  };

  /** Тестэд ашиглах одоогийн questions document (хоосон биш) */
  const existingQuestionsDoc = {
    quizId: 'quiz-1',
    questions: [
      { questionId: 'q-existing', type: 'true_false', orderIndex: 0, points: 5 },
      { questionId: 'q-existing-2', type: 'essay', orderIndex: 1, points: 20 },
    ],
  };

  /** Тестэд ашиглах хоосон questions document */
  const emptyQuestionsDoc = {
    quizId: 'quiz-1',
    questions: [],
  };

  beforeEach(() => {
    /** Mock-уудыг гараар үүсгэх */
    mockQuizRepository = {
      findById: jest.fn(),
    };

    mockQuizQuestionsRepository = {
      findByQuizId: jest.fn(),
      addQuestion: jest.fn(),
    };

    mockQuizCacheService = {
      invalidateAll: jest.fn(),
    };

    /** UseCase-г гараар mock-уудтай үүсгэх */
    useCase = new AddQuestionUseCase(
      mockQuizRepository as any,
      mockQuizQuestionsRepository as any,
      mockQuizCacheService as any,
    );
  });

  it('Асуулт амжилттай нэмэх (multiple_choice)', async () => {
    mockQuizRepository.findById.mockResolvedValue(mockQuiz);
    mockQuizQuestionsRepository.findByQuizId.mockResolvedValue(existingQuestionsDoc);
    const updatedDoc = {
      quizId: 'quiz-1',
      questions: [
        ...existingQuestionsDoc.questions,
        { questionId: 'new-q', type: 'multiple_choice', orderIndex: 2, points: 10 },
      ],
    };
    mockQuizQuestionsRepository.addQuestion.mockResolvedValue(updatedDoc);
    mockQuizCacheService.invalidateAll.mockResolvedValue(undefined);

    const result = await useCase.execute(
      'quiz-1',
      'instructor-1',
      'TEACHER',
      multipleChoiceDto as any,
    );

    expect(result).toEqual(updatedDoc);
    expect(mockQuizRepository.findById).toHaveBeenCalledWith('quiz-1');
    expect(mockQuizQuestionsRepository.findByQuizId).toHaveBeenCalledWith('quiz-1');
    /** addQuestion-г зөв orderIndex-тэй дуудсан эсэх шалгах */
    expect(mockQuizQuestionsRepository.addQuestion).toHaveBeenCalledWith(
      'quiz-1',
      expect.objectContaining({
        type: 'multiple_choice',
        questionText: 'React гэж юу вэ?',
        points: 10,
        orderIndex: 2,
        options: multipleChoiceDto.options,
      }),
    );
    expect(mockQuizCacheService.invalidateAll).toHaveBeenCalledWith('quiz-1', 'lesson-1');
  });

  it('Quiz олдоогүй бол NotFoundException', async () => {
    mockQuizRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'user-1', 'TEACHER', multipleChoiceDto as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('Эрхгүй бол ForbiddenException', async () => {
    mockQuizRepository.findById.mockResolvedValue(mockQuiz);

    /** Өөр хэрэглэгч (instructor биш, admin биш) */
    await expect(
      useCase.execute('quiz-1', 'other-user', 'TEACHER', multipleChoiceDto as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('ADMIN бол зөвшөөрнө (instructorId таарахгүй ч)', async () => {
    mockQuizRepository.findById.mockResolvedValue(mockQuiz);
    mockQuizQuestionsRepository.findByQuizId.mockResolvedValue(emptyQuestionsDoc);
    const updatedDoc = {
      quizId: 'quiz-1',
      questions: [{ questionId: 'new-q', type: 'multiple_choice', orderIndex: 0, points: 10 }],
    };
    mockQuizQuestionsRepository.addQuestion.mockResolvedValue(updatedDoc);
    mockQuizCacheService.invalidateAll.mockResolvedValue(undefined);

    /** ADMIN эрхтэй хэрэглэгч — instructorId таарахгүй ч зөвшөөрнө */
    const result = await useCase.execute('quiz-1', 'admin-user', 'ADMIN', multipleChoiceDto as any);

    expect(result).toEqual(updatedDoc);
  });

  it('Multiple choice 2-оос бага сонголттой бол BadRequestException', async () => {
    mockQuizRepository.findById.mockResolvedValue(mockQuiz);

    const invalidDto = {
      type: 'multiple_choice',
      questionText: 'Юу вэ?',
      points: 10,
      options: [{ optionId: 'a', text: 'A', isCorrect: true }],
    };

    await expect(
      useCase.execute('quiz-1', 'instructor-1', 'TEACHER', invalidDto as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('Multiple choice 1-ээс олон зөв хариулттай бол BadRequestException', async () => {
    mockQuizRepository.findById.mockResolvedValue(mockQuiz);

    const invalidDto = {
      type: 'multiple_choice',
      questionText: 'Юу вэ?',
      points: 10,
      options: [
        { optionId: 'a', text: 'A', isCorrect: true },
        { optionId: 'b', text: 'B', isCorrect: true },
      ],
    };

    await expect(
      useCase.execute('quiz-1', 'instructor-1', 'TEACHER', invalidDto as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('True/false correctAnswer байхгүй бол BadRequestException', async () => {
    mockQuizRepository.findById.mockResolvedValue(mockQuiz);

    const invalidDto = {
      type: 'true_false',
      questionText: 'Зөв үү?',
      points: 5,
      /** correctAnswer тавиагүй */
    };

    await expect(
      useCase.execute('quiz-1', 'instructor-1', 'TEACHER', invalidDto as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('Fill blank correctAnswers хоосон бол BadRequestException', async () => {
    mockQuizRepository.findById.mockResolvedValue(mockQuiz);

    const invalidDto = {
      type: 'fill_blank',
      questionText: 'Нөхөх?',
      points: 5,
      correctAnswers: [],
    };

    await expect(
      useCase.execute('quiz-1', 'instructor-1', 'TEACHER', invalidDto as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('orderIndex автоматаар тооцоолох (max+1)', async () => {
    mockQuizRepository.findById.mockResolvedValue(mockQuiz);
    /** Одоогийн doc-д orderIndex 0, 1 байгаа — дараагийн нь 2 байх ёстой */
    mockQuizQuestionsRepository.findByQuizId.mockResolvedValue(existingQuestionsDoc);
    mockQuizQuestionsRepository.addQuestion.mockResolvedValue({
      quizId: 'quiz-1',
      questions: [...existingQuestionsDoc.questions, { orderIndex: 2 }],
    });
    mockQuizCacheService.invalidateAll.mockResolvedValue(undefined);

    await useCase.execute('quiz-1', 'instructor-1', 'TEACHER', multipleChoiceDto as any);

    /** addQuestion-д дамжуулсан question объектын orderIndex 2 байх */
    expect(mockQuizQuestionsRepository.addQuestion).toHaveBeenCalledWith(
      'quiz-1',
      expect.objectContaining({ orderIndex: 2 }),
    );
  });
});
