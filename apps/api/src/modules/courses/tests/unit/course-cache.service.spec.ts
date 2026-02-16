import { Test, TestingModule } from '@nestjs/testing';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { RedisService } from '../../../../common/redis/redis.service';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('CourseCacheService', () => {
  let service: CourseCacheService;
  let redisService: jest.Mocked<RedisService>;
  let courseRepository: jest.Mocked<CourseRepository>;

  /** Тестэд ашиглах mock сургалт */
  const mockCourse = new CourseEntity({
    id: 'course-id-1',
    title: 'TypeScript Сургалт',
    slug: 'typescript-surgalt',
    description: 'TypeScript суралцах сургалт',
    instructorId: 'user-id-1',
    categoryId: 'cat-id-1',
    price: 29900,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['typescript'],
  });

  /** Кэшэд хадгалагдсан сургалтын мэдээлэл */
  const cachedCourseData = mockCourse.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CourseCacheService>(CourseCacheService);
    redisService = module.get(RedisService);
    courseRepository = module.get(CourseRepository);
  });

  describe('getCourse', () => {
    it('кэшнээс сургалт авах', async () => {
      redisService.get.mockResolvedValue(cachedCourseData);

      const result = await service.getCourse('course-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('course-id-1');
      expect(result!.title).toBe('TypeScript Сургалт');
      expect(redisService.get).toHaveBeenCalledWith('course:course-id-1');
      // DB руу хандаагүй байх ёстой
      expect(courseRepository.findById).not.toHaveBeenCalled();
    });

    it('DB-ээс сургалт аваад кэшлэх', async () => {
      redisService.get.mockResolvedValue(null);
      courseRepository.findById.mockResolvedValue(mockCourse);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getCourse('course-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('course-id-1');
      expect(redisService.get).toHaveBeenCalledWith('course:course-id-1');
      expect(courseRepository.findById).toHaveBeenCalledWith('course-id-1');
      // Кэшлэгдсэн байх ёстой (TTL: 900 секунд)
      expect(redisService.set).toHaveBeenCalledWith(
        'course:course-id-1',
        mockCourse.toResponse(),
        900,
      );
    });

    it('сургалт олдоогүй', async () => {
      redisService.get.mockResolvedValue(null);
      courseRepository.findById.mockResolvedValue(null);

      const result = await service.getCourse('nonexistent');

      expect(result).toBeNull();
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCourse', () => {
    it('сургалтын кэш амжилттай устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateCourse('course-id-1');

      expect(redisService.del).toHaveBeenCalledWith('course:course-id-1');
    });
  });

  describe('invalidateCategoryTree', () => {
    it('ангиллын мод кэш амжилттай устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateCategoryTree();

      expect(redisService.del).toHaveBeenCalledWith('category:tree');
    });
  });
});
