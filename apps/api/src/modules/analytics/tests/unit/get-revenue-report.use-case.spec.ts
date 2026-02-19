import { Test, TestingModule } from '@nestjs/testing';
import { GetRevenueReportUseCase } from '../../application/use-cases/get-revenue-report.use-case';
import { AnalyticsAggregationRepository } from '../../infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from '../../infrastructure/services/analytics-cache.service';
import { RevenueReport, RevenueReportItem } from '../../domain/entities/revenue-report.entity';

describe('GetRevenueReportUseCase', () => {
  let useCase: GetRevenueReportUseCase;
  let cacheService: jest.Mocked<AnalyticsCacheService>;
  let aggregationRepo: jest.Mocked<AnalyticsAggregationRepository>;

  const mockRevenueResponse = {
    data: [
      { period: '2025-01-01', totalRevenue: 100000, orderCount: 5 },
      { period: '2025-02-01', totalRevenue: 200000, orderCount: 8 },
    ],
    totalRevenue: 300000,
    totalOrders: 13,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRevenueReportUseCase,
        {
          provide: AnalyticsAggregationRepository,
          useValue: { getRevenueReport: jest.fn() },
        },
        {
          provide: AnalyticsCacheService,
          useValue: { getRevenue: jest.fn(), setRevenue: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetRevenueReportUseCase>(GetRevenueReportUseCase);
    cacheService = module.get(AnalyticsCacheService);
    aggregationRepo = module.get(AnalyticsAggregationRepository);
  });

  it('кэшнээс revenue олдвол шууд буцаана', async () => {
    cacheService.getRevenue.mockResolvedValue(mockRevenueResponse);

    const result = await useCase.execute({
      period: 'month',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
    });

    expect(result).toEqual(mockRevenueResponse);
    expect(aggregationRepo.getRevenueReport).not.toHaveBeenCalled();
  });

  it('кэш хоосон бол DB-ээс query хийж кэшлэнэ', async () => {
    cacheService.getRevenue.mockResolvedValue(null);
    aggregationRepo.getRevenueReport.mockResolvedValue(
      new RevenueReport([
        new RevenueReportItem({
          period: '2025-01-01',
          totalRevenue: 100000,
          orderCount: 5,
        }),
      ]),
    );

    const result = await useCase.execute({
      period: 'month',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
    });

    expect(result.totalRevenue).toBe(100000);
    expect(result.data).toHaveLength(1);
    expect(aggregationRepo.getRevenueReport).toHaveBeenCalled();
    expect(cacheService.setRevenue).toHaveBeenCalled();
  });

  it('dateFrom/dateTo өгөөгүй бол default утга ашиглана', async () => {
    cacheService.getRevenue.mockResolvedValue(null);
    aggregationRepo.getRevenueReport.mockResolvedValue(new RevenueReport([]));

    await useCase.execute({ period: 'month' });

    expect(aggregationRepo.getRevenueReport).toHaveBeenCalledWith(
      'month',
      expect.any(Date),
      expect.any(Date),
    );
  });
});
