import { Test, TestingModule } from '@nestjs/testing';
import { GetPlatformStatsUseCase } from '../../application/use-cases/get-platform-stats.use-case';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';

describe('GetPlatformStatsUseCase', () => {
  let useCase: GetPlatformStatsUseCase;
  let prisma: any;
  let cacheService: jest.Mocked<AdminCacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPlatformStatsUseCase,
        {
          provide: PrismaService,
          useValue: {
            user: { count: jest.fn().mockResolvedValue(100) },
            course: { count: jest.fn().mockResolvedValue(15) },
            enrollment: { count: jest.fn().mockResolvedValue(250) },
            certificate: { count: jest.fn().mockResolvedValue(40) },
            order: { count: jest.fn().mockResolvedValue(80) },
          },
        },
        {
          provide: AdminCacheService,
          useValue: { getDashboardStats: jest.fn(), setDashboardStats: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<GetPlatformStatsUseCase>(GetPlatformStatsUseCase);
    prisma = module.get(PrismaService);
    cacheService = module.get(AdminCacheService);
  });

  it('кэшнээс олдвол шууд буцаана', async () => {
    const cached = { users: { total: 100 } };
    cacheService.getDashboardStats.mockResolvedValue(cached);

    const result = await useCase.execute();

    expect(result).toEqual(cached);
    expect(prisma.user.count).not.toHaveBeenCalled();
  });

  it('кэш хоосон бол DB-ээс тоолж кэшлэнэ', async () => {
    cacheService.getDashboardStats.mockResolvedValue(null);

    const result = await useCase.execute();

    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('courses');
    expect(result).toHaveProperty('enrollments');
    expect(cacheService.setDashboardStats).toHaveBeenCalled();
  });
});
