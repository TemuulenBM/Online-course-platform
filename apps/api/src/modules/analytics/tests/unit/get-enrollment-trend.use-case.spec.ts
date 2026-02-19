import { Test, TestingModule } from '@nestjs/testing';
import { GetEnrollmentTrendUseCase } from '../../application/use-cases/get-enrollment-trend.use-case';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import {
  EnrollmentTrend,
  EnrollmentTrendItem,
} from '../../domain/entities/enrollment-trend.entity';

describe('GetEnrollmentTrendUseCase', () => {
  let useCase: GetEnrollmentTrendUseCase;
  let cacheService: jest.Mocked<AnalyticsCacheService>;
  let aggregationRepo: jest.Mocked<AnalyticsAggregationRepository>;

  const mockTrendResponse = {
    data: [{ period: '2025-01-01', enrollmentCount: 20, completedCount: 5, cancelledCount: 1 }],
    totalEnrollments: 20,
    totalCompleted: 5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEnrollmentTrendUseCase,
        {
          provide: AnalyticsAggregationRepository,
          useValue: { getEnrollmentTrend: jest.fn() },
        },
        {
          provide: AnalyticsCacheService,
          useValue: { getEnrollmentTrend: jest.fn(), setEnrollmentTrend: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetEnrollmentTrendUseCase>(GetEnrollmentTrendUseCase);
    cacheService = module.get(AnalyticsCacheService);
    aggregationRepo = module.get(AnalyticsAggregationRepository);
  });

  it('кэшнээс enrollment trend олдвол шууд буцаана', async () => {
    cacheService.getEnrollmentTrend.mockResolvedValue(mockTrendResponse);

    const result = await useCase.execute({
      period: 'month',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
    });

    expect(result).toEqual(mockTrendResponse);
    expect(aggregationRepo.getEnrollmentTrend).not.toHaveBeenCalled();
  });

  it('кэш хоосон бол DB-ээс query хийж кэшлэнэ', async () => {
    cacheService.getEnrollmentTrend.mockResolvedValue(null);
    aggregationRepo.getEnrollmentTrend.mockResolvedValue(
      new EnrollmentTrend([
        new EnrollmentTrendItem({
          period: '2025-01-01',
          enrollmentCount: 20,
          completedCount: 5,
          cancelledCount: 1,
        }),
      ]),
    );

    const result = await useCase.execute({
      period: 'month',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
    });

    expect(result.totalEnrollments).toBe(20);
    expect(result.data).toHaveLength(1);
    expect(cacheService.setEnrollmentTrend).toHaveBeenCalled();
  });

  it('dateFrom/dateTo өгөөгүй бол default утга ашиглана', async () => {
    cacheService.getEnrollmentTrend.mockResolvedValue(null);
    aggregationRepo.getEnrollmentTrend.mockResolvedValue(new EnrollmentTrend([]));

    await useCase.execute({ period: 'day' });

    expect(aggregationRepo.getEnrollmentTrend).toHaveBeenCalledWith(
      'day',
      expect.any(Date),
      expect.any(Date),
    );
  });
});
