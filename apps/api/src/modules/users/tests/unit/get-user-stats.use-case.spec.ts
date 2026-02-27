import { Test, TestingModule } from '@nestjs/testing';
import { GetUserStatsUseCase } from '../../application/use-cases/get-user-stats.use-case';
import { PrismaService } from '../../../../common/prisma/prisma.service';

describe('GetUserStatsUseCase', () => {
  let useCase: GetUserStatsUseCase;
  let prisma: {
    enrollment: { count: jest.Mock };
    certificate: { count: jest.Mock };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserStatsUseCase,
        {
          provide: PrismaService,
          useValue: {
            enrollment: { count: jest.fn() },
            certificate: { count: jest.fn() },
          },
        },
      ],
    }).compile();

    useCase = module.get<GetUserStatsUseCase>(GetUserStatsUseCase);
    prisma = module.get(PrismaService);
  });

  it('хэрэглэгчийн статистик зөв тоолох', async () => {
    prisma.enrollment.count
      .mockResolvedValueOnce(3) // COMPLETED
      .mockResolvedValueOnce(2); // ACTIVE
    prisma.certificate.count.mockResolvedValue(3);

    const result = await useCase.execute('user-id-1');

    expect(result).toEqual({
      completedCourses: 3,
      activeCourses: 2,
      totalCertificates: 3,
    });
    expect(prisma.enrollment.count).toHaveBeenCalledWith({
      where: { userId: 'user-id-1', status: 'COMPLETED' },
    });
    expect(prisma.enrollment.count).toHaveBeenCalledWith({
      where: { userId: 'user-id-1', status: 'ACTIVE' },
    });
    expect(prisma.certificate.count).toHaveBeenCalledWith({
      where: { userId: 'user-id-1' },
    });
  });

  it('дата байхгүй хэрэглэгчид 0 буцаах', async () => {
    prisma.enrollment.count.mockResolvedValue(0);
    prisma.certificate.count.mockResolvedValue(0);

    const result = await useCase.execute('new-user-id');

    expect(result).toEqual({
      completedCourses: 0,
      activeCourses: 0,
      totalCertificates: 0,
    });
  });
});
