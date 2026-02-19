import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../../interface/controllers/dashboard.controller';
import { GetOverviewUseCase } from '../../application/use-cases/get-overview.use-case';
import { GetRevenueReportUseCase } from '../../application/use-cases/get-revenue-report.use-case';
import { GetEnrollmentTrendUseCase } from '../../application/use-cases/get-enrollment-trend.use-case';
import { GetPopularCoursesUseCase } from '../../application/use-cases/get-popular-courses.use-case';

describe('DashboardController', () => {
  let controller: DashboardController;
  let getOverviewUseCase: jest.Mocked<GetOverviewUseCase>;
  let getRevenueReportUseCase: jest.Mocked<GetRevenueReportUseCase>;
  let getEnrollmentTrendUseCase: jest.Mocked<GetEnrollmentTrendUseCase>;
  let getPopularCoursesUseCase: jest.Mocked<GetPopularCoursesUseCase>;

  /** Тестэд ашиглах mock overview хариу */
  const mockOverviewResult = {
    totalUsers: 100,
    totalCourses: 20,
    totalEnrollments: 500,
    totalRevenue: 5000000,
  };

  /** Тестэд ашиглах mock revenue тайлан */
  const mockRevenueResult = {
    period: 'month',
    totalRevenue: 5000000,
    items: [
      { label: '2026-01', revenue: 2500000, orderCount: 10 },
      { label: '2026-02', revenue: 2500000, orderCount: 12 },
    ],
  };

  /** Тестэд ашиглах mock элсэлтийн трэнд */
  const mockEnrollmentTrendResult = {
    period: 'month',
    totalEnrollments: 50,
    items: [
      { label: '2026-01', enrollmentCount: 25 },
      { label: '2026-02', enrollmentCount: 25 },
    ],
  };

  /** Тестэд ашиглах mock топ сургалтууд */
  const mockPopularCoursesResult = [
    {
      courseId: 'course-1',
      courseTitle: 'Тест сургалт 1',
      enrollmentCount: 100,
      completionCount: 50,
      revenue: 2500000,
    },
    {
      courseId: 'course-2',
      courseTitle: 'Тест сургалт 2',
      enrollmentCount: 80,
      completionCount: 40,
      revenue: 2000000,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: GetOverviewUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetRevenueReportUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetEnrollmentTrendUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetPopularCoursesUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    getOverviewUseCase = module.get(GetOverviewUseCase);
    getRevenueReportUseCase = module.get(GetRevenueReportUseCase);
    getEnrollmentTrendUseCase = module.get(GetEnrollmentTrendUseCase);
    getPopularCoursesUseCase = module.get(GetPopularCoursesUseCase);
  });

  it('controller тодорхойлогдсон байх', () => {
    expect(controller).toBeDefined();
  });

  describe('getOverview', () => {
    it('GetOverviewUseCase-г дуудаж үр дүнг буцаах', async () => {
      getOverviewUseCase.execute.mockResolvedValue(mockOverviewResult);

      const result = await controller.getOverview();

      expect(getOverviewUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockOverviewResult);
    });
  });

  describe('getRevenueReport', () => {
    it('query параметрүүдийг GetRevenueReportUseCase-д зөв дамжуулах', async () => {
      getRevenueReportUseCase.execute.mockResolvedValue(mockRevenueResult);

      const query = {
        period: 'month' as const,
        dateFrom: '2026-01-01',
        dateTo: '2026-02-28',
      };
      const result = await controller.getRevenueReport(query);

      expect(getRevenueReportUseCase.execute).toHaveBeenCalledWith({
        period: 'month',
        dateFrom: '2026-01-01',
        dateTo: '2026-02-28',
      });
      expect(result).toEqual(mockRevenueResult);
    });

    it('period параметр байхгүй бол default "month" дамжуулах', async () => {
      getRevenueReportUseCase.execute.mockResolvedValue(mockRevenueResult);

      const query = {
        period: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      };
      const result = await controller.getRevenueReport(query as any);

      expect(getRevenueReportUseCase.execute).toHaveBeenCalledWith({
        period: 'month',
        dateFrom: undefined,
        dateTo: undefined,
      });
      expect(result).toEqual(mockRevenueResult);
    });
  });

  describe('getEnrollmentTrend', () => {
    it('query параметрүүдийг GetEnrollmentTrendUseCase-д зөв дамжуулах', async () => {
      getEnrollmentTrendUseCase.execute.mockResolvedValue(mockEnrollmentTrendResult);

      const query = {
        period: 'day' as const,
        dateFrom: '2026-02-01',
        dateTo: '2026-02-19',
      };
      const result = await controller.getEnrollmentTrend(query);

      expect(getEnrollmentTrendUseCase.execute).toHaveBeenCalledWith({
        period: 'day',
        dateFrom: '2026-02-01',
        dateTo: '2026-02-19',
      });
      expect(result).toEqual(mockEnrollmentTrendResult);
    });

    it('period параметр байхгүй бол default "month" дамжуулах', async () => {
      getEnrollmentTrendUseCase.execute.mockResolvedValue(mockEnrollmentTrendResult);

      const query = {
        period: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      };
      const result = await controller.getEnrollmentTrend(query as any);

      expect(getEnrollmentTrendUseCase.execute).toHaveBeenCalledWith({
        period: 'month',
        dateFrom: undefined,
        dateTo: undefined,
      });
      expect(result).toEqual(mockEnrollmentTrendResult);
    });
  });

  describe('getPopularCourses', () => {
    it('limit параметрийг GetPopularCoursesUseCase-д зөв дамжуулах', async () => {
      getPopularCoursesUseCase.execute.mockResolvedValue(mockPopularCoursesResult);

      const result = await controller.getPopularCourses(5);

      expect(getPopularCoursesUseCase.execute).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockPopularCoursesResult);
    });

    it('limit параметр байхгүй бол default 10 дамжуулах', async () => {
      getPopularCoursesUseCase.execute.mockResolvedValue(mockPopularCoursesResult);

      const result = await controller.getPopularCourses(undefined);

      expect(getPopularCoursesUseCase.execute).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockPopularCoursesResult);
    });
  });
});
