import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { RedisService } from '../../../../common/redis/redis.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

describe('EnrollmentCacheService', () => {
  let cacheService: EnrollmentCacheService;
  let redisService: jest.Mocked<RedisService>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;

  const now = new Date();

  const mockEnrollment = new EnrollmentEntity({
    id: 'enrollment-id-1',
    userId: 'user-id-1',
    courseId: 'course-id-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: EnrollmentRepository,
          useValue: {
            findById: jest.fn(),
            findByUserAndCourse: jest.fn(),
          },
        },
      ],
    }).compile();

    cacheService = module.get<EnrollmentCacheService>(EnrollmentCacheService);
    redisService = module.get(RedisService);
    enrollmentRepository = module.get(EnrollmentRepository);
  });

  describe('getEnrollment', () => {
    it('кэшнээс элсэлт авах', async () => {
      redisService.get.mockResolvedValue(mockEnrollment.toResponse());

      const result = await cacheService.getEnrollment('enrollment-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('enrollment-id-1');
      expect(enrollmentRepository.findById).not.toHaveBeenCalled();
    });

    it('DB-ээс аваад кэшлэх (cache miss)', async () => {
      redisService.get.mockResolvedValue(null);
      enrollmentRepository.findById.mockResolvedValue(mockEnrollment);

      const result = await cacheService.getEnrollment('enrollment-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('enrollment-id-1');
      expect(enrollmentRepository.findById).toHaveBeenCalledWith('enrollment-id-1');
      expect(redisService.set).toHaveBeenCalledWith(
        'enrollment:enrollment-id-1',
        mockEnrollment.toResponse(),
        900,
      );
    });

    it('олдоогүй — кэшлэхгүй', async () => {
      redisService.get.mockResolvedValue(null);
      enrollmentRepository.findById.mockResolvedValue(null);

      const result = await cacheService.getEnrollment('nonexistent');

      expect(result).toBeNull();
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('checkEnrollment', () => {
    it('кэшнээс шалгалт авах', async () => {
      redisService.get.mockResolvedValue(mockEnrollment.toResponse());

      const result = await cacheService.checkEnrollment('user-id-1', 'course-id-1');

      expect(result).toBeDefined();
      expect(enrollmentRepository.findByUserAndCourse).not.toHaveBeenCalled();
    });
  });

  describe('invalidateAll', () => {
    it('бүх холбогдох кэш устгах', async () => {
      await cacheService.invalidateAll('enrollment-id-1', 'user-id-1', 'course-id-1');

      expect(redisService.del).toHaveBeenCalledWith('enrollment:enrollment-id-1');
      expect(redisService.del).toHaveBeenCalledWith('enrollment:check:user-id-1:course-id-1');
    });
  });
});
