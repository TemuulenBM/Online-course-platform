import { Test, TestingModule } from '@nestjs/testing';
import { GetPopularCoursesUseCase } from '../../application/use-cases/get-popular-courses.use-case';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import { PopularCourseItem } from '../../domain/entities/course-stats.entity';

describe('GetPopularCoursesUseCase', () => {
  let useCase: GetPopularCoursesUseCase;
  let cacheService: jest.Mocked<AnalyticsCacheService>;
  let aggregationRepo: jest.Mocked<AnalyticsAggregationRepository>;

  const mockPopularCourses = [
    {
      courseId: 'c1',
      courseTitle: 'NestJS',
      enrollmentCount: 50,
      completionCount: 20,
      revenue: 500000,
    },
    {
      courseId: 'c2',
      courseTitle: 'React',
      enrollmentCount: 40,
      completionCount: 15,
      revenue: 300000,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPopularCoursesUseCase,
        {
          provide: AnalyticsAggregationRepository,
          useValue: { getPopularCourses: jest.fn() },
        },
        {
          provide: AnalyticsCacheService,
          useValue: { getPopularCourses: jest.fn(), setPopularCourses: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetPopularCoursesUseCase>(GetPopularCoursesUseCase);
    cacheService = module.get(AnalyticsCacheService);
    aggregationRepo = module.get(AnalyticsAggregationRepository);
  });

  it('кэшнээс popular courses олдвол шууд буцаана', async () => {
    cacheService.getPopularCourses.mockResolvedValue(mockPopularCourses);

    const result = await useCase.execute(10);

    expect(result).toEqual(mockPopularCourses);
    expect(aggregationRepo.getPopularCourses).not.toHaveBeenCalled();
  });

  it('кэш хоосон бол DB-ээс query хийж кэшлэнэ', async () => {
    cacheService.getPopularCourses.mockResolvedValue(null);
    aggregationRepo.getPopularCourses.mockResolvedValue([
      new PopularCourseItem({
        courseId: 'c1',
        courseTitle: 'NestJS',
        enrollmentCount: 50,
        completionCount: 20,
        revenue: 500000,
      }),
    ]);

    const result = await useCase.execute(10);

    expect(result).toHaveLength(1);
    expect(result[0].courseId).toBe('c1');
    expect(cacheService.setPopularCourses).toHaveBeenCalledWith(10, result);
  });

  it('default limit 10 ашиглана', async () => {
    cacheService.getPopularCourses.mockResolvedValue(null);
    aggregationRepo.getPopularCourses.mockResolvedValue([]);

    await useCase.execute();

    expect(aggregationRepo.getPopularCourses).toHaveBeenCalledWith(10);
    expect(cacheService.getPopularCourses).toHaveBeenCalledWith(10);
  });
});
