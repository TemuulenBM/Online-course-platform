import { Test, TestingModule } from '@nestjs/testing';
import { DlqRepository } from '../dlq.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('DlqRepository', () => {
  let repository: DlqRepository;
  let prisma: any;

  const mockFailedJob = {
    id: 'fj-1',
    queueName: 'payments',
    jobName: 'payment-approved',
    jobId: '123',
    jobData: { orderId: 'order-1' },
    errorMessage: 'DB timeout',
    errorStack: 'Error: DB timeout\n  at ...',
    attemptsMade: 3,
    severity: 'CRITICAL',
    status: 'PENDING',
    resolvedBy: null,
    resolvedAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DlqRepository,
        {
          provide: PrismaService,
          useValue: {
            failedJob: {
              create: jest.fn().mockResolvedValue(mockFailedJob),
              findUnique: jest.fn().mockResolvedValue(mockFailedJob),
              findMany: jest.fn().mockResolvedValue([mockFailedJob]),
              count: jest.fn().mockResolvedValue(1),
              update: jest.fn().mockResolvedValue({ ...mockFailedJob, status: 'RESOLVED' }),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<DlqRepository>(DlqRepository);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('failed job үүсгэнэ', async () => {
      const result = await repository.create({
        queueName: 'payments',
        jobName: 'payment-approved',
        jobId: '123',
        jobData: { orderId: 'order-1' },
        errorMessage: 'DB timeout',
        errorStack: 'Error: DB timeout',
        attemptsMade: 3,
        severity: 'CRITICAL',
      });

      expect(result).toEqual(mockFailedJob);
      expect(prisma.failedJob.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          queueName: 'payments',
          severity: 'CRITICAL',
        }),
      });
    });
  });

  describe('findById', () => {
    it('ID-аар олно', async () => {
      const result = await repository.findById('fj-1');
      expect(result).toEqual(mockFailedJob);
      expect(prisma.failedJob.findUnique).toHaveBeenCalledWith({ where: { id: 'fj-1' } });
    });
  });

  describe('findMany', () => {
    it('жагсаалт pagination-тай буцаана', async () => {
      const result = await repository.findMany({ page: 1, limit: 20 });
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result.page).toBe(1);
    });

    it('filter-тэй query дамжуулна', async () => {
      await repository.findMany({
        page: 1,
        limit: 10,
        queueName: 'payments',
        severity: 'CRITICAL',
        status: 'PENDING',
      });

      expect(prisma.failedJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { queueName: 'payments', severity: 'CRITICAL', status: 'PENDING' },
        }),
      );
    });
  });

  describe('countPending', () => {
    it('PENDING тоо буцаана', async () => {
      const result = await repository.countPending();
      expect(result).toBe(1);
      expect(prisma.failedJob.count).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
      });
    });
  });

  describe('updateStatus', () => {
    it('status шинэчлэнэ', async () => {
      const result = await repository.updateStatus('fj-1', 'RESOLVED', 'admin-1');
      expect(result.status).toBe('RESOLVED');
      expect(prisma.failedJob.update).toHaveBeenCalledWith({
        where: { id: 'fj-1' },
        data: expect.objectContaining({
          status: 'RESOLVED',
          resolvedBy: 'admin-1',
        }),
      });
    });
  });
});
