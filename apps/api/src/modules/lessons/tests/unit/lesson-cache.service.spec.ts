import { Test, TestingModule } from '@nestjs/testing';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { RedisService } from '../../../../common/redis/redis.service';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonEntity } from '../../domain/entities/lesson.entity';

describe('LessonCacheService', () => {
  let service: LessonCacheService;
  let redisService: jest.Mocked<RedisService>;
  let lessonRepository: jest.Mocked<LessonRepository>;

  /** Тестэд ашиглах mock хичээл */
  const mockLesson = new LessonEntity({
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'React-ийн суурь ойлголтууд',
    orderIndex: 0,
    lessonType: 'video',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    courseTitle: 'TypeScript Сургалт',
    courseInstructorId: 'user-id-1',
  });

  /** Кэшэд хадгалагдсан хичээлийн мэдээлэл */
  const cachedLessonData = {
    ...mockLesson.toResponse(),
    courseInstructorId: 'user-id-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
            findByCourseId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LessonCacheService>(LessonCacheService);
    redisService = module.get(RedisService);
    lessonRepository = module.get(LessonRepository);
  });

  describe('getLesson', () => {
    it('кэшнээс хичээл авах (cache hit)', async () => {
      redisService.get.mockResolvedValue(cachedLessonData);

      const result = await service.getLesson('lesson-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('lesson-id-1');
      expect(result!.title).toBe('React-ийн суурь ойлголтууд');
      expect(redisService.get).toHaveBeenCalledWith('lesson:lesson-id-1');
      /** DB руу хандаагүй байх ёстой */
      expect(lessonRepository.findById).not.toHaveBeenCalled();
    });

    it('кэш байхгүй, DB-ээс аваад кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      lessonRepository.findById.mockResolvedValue(mockLesson);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getLesson('lesson-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('lesson-id-1');
      expect(redisService.get).toHaveBeenCalledWith('lesson:lesson-id-1');
      expect(lessonRepository.findById).toHaveBeenCalledWith('lesson-id-1');
      /** Кэшлэгдсэн байх ёстой (TTL: 900 секунд) */
      expect(redisService.set).toHaveBeenCalledWith(
        'lesson:lesson-id-1',
        { ...mockLesson.toResponse(), courseInstructorId: mockLesson.courseInstructorId },
        900,
      );
    });

    it('DB-д ч олдоогүй (returns null)', async () => {
      redisService.get.mockResolvedValue(null);
      lessonRepository.findById.mockResolvedValue(null);

      const result = await service.getLesson('nonexistent');

      expect(result).toBeNull();
      /** Кэшлэгдээгүй байх ёстой */
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('getPublishedLessonsByCourse', () => {
    it('кэшнээс сургалтын хичээлүүд авах (cache hit)', async () => {
      const cachedList = [mockLesson.toResponse()];
      redisService.get.mockResolvedValue(cachedList);

      const result = await service.getPublishedLessonsByCourse('course-id-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('lesson-id-1');
      expect(redisService.get).toHaveBeenCalledWith('lessons:course:course-id-1');
      /** DB руу хандаагүй байх ёстой */
      expect(lessonRepository.findByCourseId).not.toHaveBeenCalled();
    });

    it('кэш байхгүй, DB-ээс аваад кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      lessonRepository.findByCourseId.mockResolvedValue([mockLesson]);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getPublishedLessonsByCourse('course-id-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('lesson-id-1');
      expect(lessonRepository.findByCourseId).toHaveBeenCalledWith('course-id-1', true);
      /** Кэшлэгдсэн байх ёстой (TTL: 900 секунд) */
      expect(redisService.set).toHaveBeenCalledWith(
        'lessons:course:course-id-1',
        [mockLesson.toResponse()],
        900,
      );
    });
  });

  describe('invalidateLesson', () => {
    it('зөв key устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateLesson('lesson-id-1');

      expect(redisService.del).toHaveBeenCalledWith('lesson:lesson-id-1');
    });
  });

  describe('invalidateCourseLessons', () => {
    it('зөв key устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateCourseLessons('course-id-1');

      expect(redisService.del).toHaveBeenCalledWith('lessons:course:course-id-1');
    });
  });

  describe('invalidateAll', () => {
    it('хоёр key хамт устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateAll('lesson-id-1', 'course-id-1');

      /** Хичээлийн кэш устгагдсан */
      expect(redisService.del).toHaveBeenCalledWith('lesson:lesson-id-1');
      /** Сургалтын хичээлүүдийн кэш устгагдсан */
      expect(redisService.del).toHaveBeenCalledWith('lessons:course:course-id-1');
      /** Нийт 2 удаа del дуудагдсан */
      expect(redisService.del).toHaveBeenCalledTimes(2);
    });
  });
});
