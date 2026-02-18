import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CreateQuizUseCase } from '../../application/use-cases/create-quiz.use-case';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from '../../infrastructure/repositories/quiz-questions.repository';
import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { CreateQuizDto } from '../../dto/create-quiz.dto';

describe('CreateQuizUseCase', () => {
  let useCase: CreateQuizUseCase;
  let mockLessonRepository: jest.Mocked<Partial<LessonRepository>>;
  let mockQuizRepository: jest.Mocked<Partial<QuizRepository>>;
  let mockQuizQuestionsRepository: jest.Mocked<Partial<QuizQuestionsRepository>>;
  let mockQuizCacheService: jest.Mocked<Partial<QuizCacheService>>;

  const now = new Date();

  /** Тестэд ашиглах mock хичээл — төрөл нь QUIZ */
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

  /** Тестэд ашиглах DTO */
  const mockDto: CreateQuizDto = {
    lessonId: 'lesson-1',
    title: 'React Hooks шалгалт',
    description: 'React Hooks-ийн мэдлэг шалгах quiz',
    timeLimitMinutes: 30,
    passingScorePercentage: 70,
    randomizeQuestions: false,
    randomizeOptions: false,
    maxAttempts: 3,
  };

  /** Тестэд ашиглах mock quiz entity */
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
  });

  beforeEach(() => {
    mockLessonRepository = {
      findById: jest.fn(),
    };
    mockQuizRepository = {
      findByLessonId: jest.fn(),
      create: jest.fn(),
    };
    mockQuizQuestionsRepository = {
      create: jest.fn(),
    };
    mockQuizCacheService = {
      invalidateQuizCache: jest.fn(),
    };

    useCase = new CreateQuizUseCase(
      mockLessonRepository as any,
      mockQuizRepository as any,
      mockQuizQuestionsRepository as any,
      mockQuizCacheService as any,
    );
  });

  it('quiz амжилттай үүсгэх — хичээл олдсон, төрөл quiz, эзэмшигч, давхардал байхгүй', async () => {
    /** Хичээл олдоно */
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    /** Давхардсан quiz байхгүй */
    mockQuizRepository.findByLessonId!.mockResolvedValue(null);
    /** Quiz амжилттай үүссэн */
    mockQuizRepository.create!.mockResolvedValue(mockQuiz);
    /** MongoDB-д document үүссэн */
    mockQuizQuestionsRepository.create!.mockResolvedValue(undefined as any);

    const result = await useCase.execute('instructor-1', 'TEACHER', mockDto);

    expect(result).toEqual(mockQuiz);
    expect(mockLessonRepository.findById).toHaveBeenCalledWith('lesson-1');
    expect(mockQuizRepository.findByLessonId).toHaveBeenCalledWith('lesson-1');
    expect(mockQuizRepository.create).toHaveBeenCalledWith({
      lessonId: mockDto.lessonId,
      title: mockDto.title,
      description: mockDto.description,
      timeLimitMinutes: mockDto.timeLimitMinutes,
      passingScorePercentage: mockDto.passingScorePercentage,
      randomizeQuestions: mockDto.randomizeQuestions,
      randomizeOptions: mockDto.randomizeOptions,
      maxAttempts: mockDto.maxAttempts,
    });
    expect(mockQuizQuestionsRepository.create).toHaveBeenCalledWith('quiz-1');
  });

  it('хичээл олдоогүй бол NotFoundException шидэх', async () => {
    mockLessonRepository.findById!.mockResolvedValue(null);

    await expect(useCase.execute('instructor-1', 'TEACHER', mockDto)).rejects.toThrow(
      NotFoundException,
    );

    /** Quiz repository дуудагдаагүй байх */
    expect(mockQuizRepository.findByLessonId).not.toHaveBeenCalled();
    expect(mockQuizRepository.create).not.toHaveBeenCalled();
  });

  it('хичээлийн төрөл QUIZ биш бол BadRequestException шидэх', async () => {
    /** Хичээлийн төрөл VIDEO */
    const videoLesson = { ...mockLesson, lessonType: 'video' };
    mockLessonRepository.findById!.mockResolvedValue(videoLesson as any);

    await expect(useCase.execute('instructor-1', 'TEACHER', mockDto)).rejects.toThrow(
      BadRequestException,
    );

    /** Quiz repository дуудагдаагүй байх */
    expect(mockQuizRepository.findByLessonId).not.toHaveBeenCalled();
    expect(mockQuizRepository.create).not.toHaveBeenCalled();
  });

  it('эзэмшигч биш бол ForbiddenException шидэх', async () => {
    /** Хичээл олдоно, гэхдээ өөр хэрэглэгчийн */
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);

    await expect(useCase.execute('other-user-1', 'TEACHER', mockDto)).rejects.toThrow(
      ForbiddenException,
    );

    /** Quiz repository дуудагдаагүй байх */
    expect(mockQuizRepository.findByLessonId).not.toHaveBeenCalled();
    expect(mockQuizRepository.create).not.toHaveBeenCalled();
  });

  it('ADMIN бол эзэмшигч биш байсан ч зөвшөөрнө', async () => {
    /** Хичээл олдоно, гэхдээ ADMIN хэрэглэгч */
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    mockQuizRepository.findByLessonId!.mockResolvedValue(null);
    mockQuizRepository.create!.mockResolvedValue(mockQuiz);
    mockQuizQuestionsRepository.create!.mockResolvedValue(undefined as any);

    /** ADMIN нь бусдын хичээлд quiz үүсгэж чадах */
    const result = await useCase.execute('admin-user-1', 'ADMIN', mockDto);

    expect(result).toEqual(mockQuiz);
    expect(mockQuizRepository.create).toHaveBeenCalled();
    expect(mockQuizQuestionsRepository.create).toHaveBeenCalledWith('quiz-1');
  });

  it('давхардсан quiz байвал ConflictException шидэх', async () => {
    /** Хичээл олдоно */
    mockLessonRepository.findById!.mockResolvedValue(mockLesson as any);
    /** Аль хэдийн quiz үүсгэсэн */
    mockQuizRepository.findByLessonId!.mockResolvedValue(mockQuiz);

    await expect(useCase.execute('instructor-1', 'TEACHER', mockDto)).rejects.toThrow(
      ConflictException,
    );

    /** Шинэ quiz үүсгэх гэж оролдоогүй */
    expect(mockQuizRepository.create).not.toHaveBeenCalled();
    expect(mockQuizQuestionsRepository.create).not.toHaveBeenCalled();
  });
});
