import { Test, TestingModule } from '@nestjs/testing';
import { GetOverviewUseCase } from '../../application/use-cases/get-overview.use-case';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import { OverviewStats } from '../../domain/entities/overview-stats.entity';

describe('GetOverviewUseCase', () => {
  let useCase: GetOverviewUseCase;
  let cacheService: jest.Mocked<AnalyticsCacheService>;
  let aggregationRepo: jest.Mocked<AnalyticsAggregationRepository>;

  const mockOverviewResponse = {
    totalUsers: 100,
    totalCourses: 15,
    totalEnrollments: 250,
    totalRevenue: 5000000,
    activeEnrollments: 180,
    completedEnrollments: 50,
    totalCertificates: 40,
    newUsersThisMonth: 20,
    newEnrollmentsThisMonth: 30,
    revenueThisMonth: 800000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOverviewUseCase,
        {
          provide: AnalyticsAggregationRepository,
          useValue: { getOverview: jest.fn() },
        },
        {
          provide: AnalyticsCacheService,
          useValue: { getOverview: jest.fn(), setOverview: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetOverviewUseCase>(GetOverviewUseCase);
    cacheService = module.get(AnalyticsCacheService);
    aggregationRepo = module.get(AnalyticsAggregationRepository);
  });

  it('кэшнээс overview олдвол шууд буцаана', async () => {
    cacheService.getOverview.mockResolvedValue(mockOverviewResponse);

    const result = await useCase.execute();

    expect(result).toEqual(mockOverviewResponse);
    expect(cacheService.getOverview).toHaveBeenCalled();
    expect(aggregationRepo.getOverview).not.toHaveBeenCalled();
  });

  it('кэш хоосон бол DB-ээс aggregate хийж кэшлэнэ', async () => {
    cacheService.getOverview.mockResolvedValue(null);
    aggregationRepo.getOverview.mockResolvedValue(new OverviewStats(mockOverviewResponse));

    const result = await useCase.execute();

    expect(result).toEqual(mockOverviewResponse);
    expect(aggregationRepo.getOverview).toHaveBeenCalled();
    expect(cacheService.setOverview).toHaveBeenCalledWith(mockOverviewResponse);
  });
});
