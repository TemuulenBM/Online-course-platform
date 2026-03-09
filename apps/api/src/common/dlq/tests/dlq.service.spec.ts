import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { DlqService } from '../dlq.service';
import { DlqRepository } from '../dlq.repository';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DlqService', () => {
  let service: DlqService;
  let dlqRepository: jest.Mocked<DlqRepository>;
  let redisService: jest.Mocked<RedisService>;
  let prisma: any;

  /** Mock queue factory */
  const createMockQueue = (name: string) => ({
    name,
    add: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
  });

  const mockQueues: Record<string, any> = {};
  const queueNames = [
    'payments',
    'certificates',
    'notifications',
    'analytics',
    'admin',
    'live-classes',
  ];

  beforeEach(async () => {
    for (const name of queueNames) {
      mockQueues[name] = createMockQueue(name);
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DlqService,
        {
          provide: DlqRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'fj-1', queueName: 'payments' }),
            findById: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { findMany: jest.fn().mockResolvedValue([{ id: 'admin-1' }]) },
            notification: { createMany: jest.fn() },
            auditLog: { create: jest.fn() },
          },
        },
        ...queueNames.map((name) => ({
          provide: getQueueToken(name),
          useValue: mockQueues[name],
        })),
      ],
    }).compile();

    service = module.get<DlqService>(DlqService);
    dlqRepository = module.get(DlqRepository);
    redisService = module.get(RedisService);
    prisma = module.get(PrismaService);
  });

  describe('handleDeadLetter', () => {
    const mockJob = {
      id: '123',
      name: 'payment-approved',
      data: { orderId: 'order-1' },
      attemptsMade: 3,
      opts: { attempts: 3 },
      failedReason: 'DB timeout',
    } as any;

    const mockError = new Error('DB timeout');

    it('failed job-г DB-д хадгалж, audit log бүртгэнэ', async () => {
      redisService.get.mockResolvedValue(null);

      await service.handleDeadLetter('payments', mockJob, mockError);

      expect(dlqRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          queueName: 'payments',
          jobName: 'payment-approved',
          severity: 'CRITICAL',
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('CRITICAL queue дээр admin-д alert илгээнэ', async () => {
      redisService.get.mockResolvedValue(null);

      await service.handleDeadLetter('payments', mockJob, mockError);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      expect(prisma.notification.createMany).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith('dlq:alert:payments', '1', 300);
    });

    it('LOW severity queue дээр alert илгээхгүй', async () => {
      await service.handleDeadLetter('analytics', mockJob, mockError);

      expect(prisma.user.findMany).not.toHaveBeenCalled();
      expect(prisma.notification.createMany).not.toHaveBeenCalled();
    });

    it('rate limit ажиллаж байвал alert давтахгүй', async () => {
      redisService.get.mockResolvedValue('1');

      await service.handleDeadLetter('payments', mockJob, mockError);

      expect(prisma.notification.createMany).not.toHaveBeenCalled();
    });

    it('DLQ боловсруулалт өөрөө fail болоход exception шидэхгүй', async () => {
      dlqRepository.create.mockRejectedValue(new Error('DB down'));

      // Exception шидэхгүй — зөвхөн log
      await expect(
        service.handleDeadLetter('payments', mockJob, mockError),
      ).resolves.toBeUndefined();
    });
  });

  describe('retryJob', () => {
    it('failed job-г original queue-д дахин нэмнэ', async () => {
      dlqRepository.findById.mockResolvedValue({
        id: 'fj-1',
        queueName: 'payments',
        jobName: 'payment-approved',
        jobData: { orderId: 'order-1' },
      } as any);

      await service.retryJob('fj-1');

      expect(mockQueues['payments'].add).toHaveBeenCalledWith('payment-approved', {
        orderId: 'order-1',
      });
      expect(dlqRepository.updateStatus).toHaveBeenCalledWith('fj-1', 'RETRIED');
    });

    it('олдохгүй бол error шидэнэ', async () => {
      dlqRepository.findById.mockResolvedValue(null);

      await expect(service.retryJob('nonexistent')).rejects.toThrow('Failed job олдсонгүй');
    });
  });
});
