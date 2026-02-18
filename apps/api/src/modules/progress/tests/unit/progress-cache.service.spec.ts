import { Test, TestingModule } from '@nestjs/testing';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { RedisService } from '../../../../common/redis/redis.service';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

describe('ProgressCacheService', () => {
  let cacheService: ProgressCacheService;
  let redisService: jest.Mocked<RedisService>;
  let progressRepository: jest.Mocked<ProgressRepository>;

  const now = new Date();

  const mockProgress = new UserProgressEntity({
    id: 'progress-id-1',
    userId: 'user-id-1',
    lessonId: 'lesson-id-1',
    progressPercentage: 50,
    completed: false,
    timeSpentSeconds: 300,
    lastPositionSeconds: 150,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    lessonTitle: 'Хичээл 1',
    lessonType: 'video',
    courseId: 'course-id-1',
    lessonOrderIndex: 0,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: ProgressRepository,
          useValue: {
            findByUserAndLesson: jest.fn(),
            findByUserAndCourse: jest.fn(),
          },
        },
      ],
    }).compile();

    cacheService = module.get<ProgressCacheService>(ProgressCacheService);
    redisService = module.get(RedisService);
    progressRepository = module.get(ProgressRepository);
  });

  describe('getLessonProgress', () => {
    it('Кэшнээс ахиц авах (cache hit)', async () => {
      redisService.get.mockResolvedValue(mockProgress.toResponse());

      const result = await cacheService.getLessonProgress('user-id-1', 'lesson-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('progress-id-1');
      expect(result!.userId).toBe('user-id-1');
      expect(result!.lessonId).toBe('lesson-id-1');
      expect(progressRepository.findByUserAndLesson).not.toHaveBeenCalled();
    });

    it('DB-ээс аваад кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      progressRepository.findByUserAndLesson.mockResolvedValue(mockProgress);

      const result = await cacheService.getLessonProgress('user-id-1', 'lesson-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('progress-id-1');
      expect(progressRepository.findByUserAndLesson).toHaveBeenCalledWith(
        'user-id-1',
        'lesson-id-1',
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'progress:lesson:user-id-1:lesson-id-1',
        mockProgress.toResponse(),
        900,
      );
    });
  });

  describe('invalidateAll', () => {
    it('Кэш invalidate хийх — lesson болон course түлхүүрүүд устгагдана', async () => {
      await cacheService.invalidateAll('user-id-1', 'lesson-id-1', 'course-id-1');

      expect(redisService.del).toHaveBeenCalledWith('progress:lesson:user-id-1:lesson-id-1');
      expect(redisService.del).toHaveBeenCalledWith('progress:course:user-id-1:course-id-1');
    });
  });
});
