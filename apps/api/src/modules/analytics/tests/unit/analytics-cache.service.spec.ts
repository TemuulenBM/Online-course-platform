import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import { RedisService } from '../../../../common/redis/redis.service';

describe('AnalyticsCacheService', () => {
  let cacheService: AnalyticsCacheService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    cacheService = module.get<AnalyticsCacheService>(AnalyticsCacheService);
    redisService = module.get(RedisService);
  });

  describe('getOverview / setOverview', () => {
    it('кэшнээс overview олдвол буцаана', async () => {
      const mockData = { totalUsers: 100, totalCourses: 10 };
      redisService.get.mockResolvedValue(mockData);

      const result = await cacheService.getOverview();

      expect(result).toEqual(mockData);
      expect(redisService.get).toHaveBeenCalledWith('analytics:overview');
    });

    it('кэш хоосон бол null буцаана', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await cacheService.getOverview();

      expect(result).toBeNull();
    });

    it('overview кэшлэхэд TTL 300 секунд ашиглана', async () => {
      const mockData = { totalUsers: 100 };
      await cacheService.setOverview(mockData);

      expect(redisService.set).toHaveBeenCalledWith('analytics:overview', mockData, 300);
    });
  });

  describe('getRevenue / setRevenue', () => {
    it('кэшнээс revenue олдвол буцаана', async () => {
      const mockData = { data: [], totalRevenue: 50000 };
      redisService.get.mockResolvedValue(mockData);

      const result = await cacheService.getRevenue('month', '2025-01-01', '2025-12-31');

      expect(result).toEqual(mockData);
      expect(redisService.get).toHaveBeenCalledWith(
        'analytics:revenue:month:2025-01-01:2025-12-31',
      );
    });

    it('revenue кэшлэхэд TTL 900 секунд ашиглана', async () => {
      const mockData = { data: [], totalRevenue: 0 };
      await cacheService.setRevenue('month', '2025-01-01', '2025-12-31', mockData);

      expect(redisService.set).toHaveBeenCalledWith(
        'analytics:revenue:month:2025-01-01:2025-12-31',
        mockData,
        900,
      );
    });
  });

  describe('getEnrollmentTrend / setEnrollmentTrend', () => {
    it('кэшнээс enrollment trend олдвол буцаана', async () => {
      const mockData = { data: [], totalEnrollments: 200 };
      redisService.get.mockResolvedValue(mockData);

      const result = await cacheService.getEnrollmentTrend('day', '2025-06-01', '2025-06-30');

      expect(result).toEqual(mockData);
      expect(redisService.get).toHaveBeenCalledWith(
        'analytics:enrollments:day:2025-06-01:2025-06-30',
      );
    });

    it('enrollment trend кэшлэхэд TTL 900 секунд', async () => {
      const mockData = { data: [] };
      await cacheService.setEnrollmentTrend('day', '2025-06-01', '2025-06-30', mockData);

      expect(redisService.set).toHaveBeenCalledWith(
        'analytics:enrollments:day:2025-06-01:2025-06-30',
        mockData,
        900,
      );
    });
  });

  describe('getPopularCourses / setPopularCourses', () => {
    it('кэшнээс popular courses олдвол буцаана', async () => {
      const mockData = [{ courseId: 'c1', enrollmentCount: 50 }];
      redisService.get.mockResolvedValue(mockData);

      const result = await cacheService.getPopularCourses(10);

      expect(result).toEqual(mockData);
      expect(redisService.get).toHaveBeenCalledWith('analytics:popular:10');
    });

    it('popular courses кэшлэхэд TTL 900 секунд', async () => {
      const mockData = [{ courseId: 'c1' }];
      await cacheService.setPopularCourses(5, mockData);

      expect(redisService.set).toHaveBeenCalledWith('analytics:popular:5', mockData, 900);
    });
  });

  describe('getCourseStats / setCourseStats', () => {
    it('кэшнээс course stats олдвол буцаана', async () => {
      const mockData = { courseId: 'c1', totalEnrollments: 30 };
      redisService.get.mockResolvedValue(mockData);

      const result = await cacheService.getCourseStats('c1');

      expect(result).toEqual(mockData);
      expect(redisService.get).toHaveBeenCalledWith('analytics:course:c1');
    });

    it('course stats кэшлэхэд TTL 900 секунд', async () => {
      const mockData = { courseId: 'c1' };
      await cacheService.setCourseStats('c1', mockData);

      expect(redisService.set).toHaveBeenCalledWith('analytics:course:c1', mockData, 900);
    });
  });
});
