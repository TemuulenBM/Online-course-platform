import { QuizCacheService } from '../../infrastructure/services/quiz-cache.service';
import { QuizEntity } from '../../domain/entities/quiz.entity';

describe('QuizCacheService', () => {
  let cacheService: QuizCacheService;
  let mockRedisService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let mockQuizRepository: { findById: jest.Mock; findByLessonId: jest.Mock };

  const now = new Date();

  /** Тестэд ашиглах mock quiz entity */
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
  });

  /** Redis-д хадгалагдсан кэш өгөгдөл (toResponse() формат, Date-ууд string болсон) */
  const cachedQuizData = {
    ...mockQuiz.toResponse(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  beforeEach(() => {
    /** Mock-уудыг гараар үүсгэх */
    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockQuizRepository = {
      findById: jest.fn(),
      findByLessonId: jest.fn(),
    };

    /** CacheService-г гараар mock-уудтай үүсгэх */
    cacheService = new QuizCacheService(mockRedisService as any, mockQuizRepository as any);
  });

  describe('getQuizById', () => {
    it('Кэшэд байвал DB рүү хандахгүй (cache hit)', async () => {
      mockRedisService.get.mockResolvedValue(cachedQuizData);

      const result = await cacheService.getQuizById('quiz-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('quiz-1');
      expect(result!.title).toBe('Тест quiz');
      expect(result!.createdAt).toBeInstanceOf(Date);
      expect(result!.updatedAt).toBeInstanceOf(Date);
      expect(mockRedisService.get).toHaveBeenCalledWith('quiz:quiz-1');
      expect(mockQuizRepository.findById).not.toHaveBeenCalled();
    });

    it('Кэшэд байхгүй бол DB-ээс аваад кэшлэх (cache miss)', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockQuizRepository.findById.mockResolvedValue(mockQuiz);

      const result = await cacheService.getQuizById('quiz-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('quiz-1');
      expect(mockQuizRepository.findById).toHaveBeenCalledWith('quiz-1');
      expect(mockRedisService.set).toHaveBeenCalledWith('quiz:quiz-1', mockQuiz.toResponse(), 900);
    });

    it('Quiz олдоогүй бол null буцаах', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockQuizRepository.findById.mockResolvedValue(null);

      const result = await cacheService.getQuizById('nonexistent');

      expect(result).toBeNull();
      expect(mockQuizRepository.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });
  });

  describe('getQuizByLessonId', () => {
    it('Кэшэд байвал DB рүү хандахгүй (cache hit)', async () => {
      mockRedisService.get.mockResolvedValue(cachedQuizData);

      const result = await cacheService.getQuizByLessonId('lesson-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('quiz-1');
      expect(result!.lessonId).toBe('lesson-1');
      expect(mockRedisService.get).toHaveBeenCalledWith('quiz:lesson:lesson-1');
      expect(mockQuizRepository.findByLessonId).not.toHaveBeenCalled();
    });

    it('Кэшэд байхгүй бол DB-ээс аваад кэшлэх (cache miss)', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockQuizRepository.findByLessonId.mockResolvedValue(mockQuiz);

      const result = await cacheService.getQuizByLessonId('lesson-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('quiz-1');
      expect(mockQuizRepository.findByLessonId).toHaveBeenCalledWith('lesson-1');
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'quiz:lesson:lesson-1',
        mockQuiz.toResponse(),
        900,
      );
    });
  });

  describe('invalidateAll', () => {
    it('Бүх холбоотой кэш устгах (3 del дуудалт)', async () => {
      mockRedisService.del.mockResolvedValue(undefined);

      await cacheService.invalidateAll('quiz-1', 'lesson-1');

      expect(mockRedisService.del).toHaveBeenCalledTimes(3);
      expect(mockRedisService.del).toHaveBeenCalledWith('quiz:quiz-1');
      expect(mockRedisService.del).toHaveBeenCalledWith('quiz:lesson:lesson-1');
      expect(mockRedisService.del).toHaveBeenCalledWith('quiz:questions:quiz-1');
    });
  });

  describe('invalidateAttemptCache', () => {
    it('Attempt кэш устгах', async () => {
      mockRedisService.del.mockResolvedValue(undefined);

      await cacheService.invalidateAttemptCache('quiz-1', 'user-1');

      expect(mockRedisService.del).toHaveBeenCalledWith('quiz:attempts:quiz-1:user-1');
    });
  });
});
