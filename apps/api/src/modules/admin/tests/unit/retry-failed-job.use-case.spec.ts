import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RetryFailedJobUseCase } from '../../application/use-cases/retry-failed-job.use-case';
import { DlqService } from '../../../../common/dlq/dlq.service';
import { DlqRepository } from '../../../../common/dlq/dlq.repository';

describe('RetryFailedJobUseCase', () => {
  let useCase: RetryFailedJobUseCase;
  let dlqService: jest.Mocked<DlqService>;
  let dlqRepository: jest.Mocked<DlqRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryFailedJobUseCase,
        {
          provide: DlqService,
          useValue: { retryJob: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: DlqRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue({
              id: 'fj-1',
              queueName: 'payments',
              status: 'PENDING',
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<RetryFailedJobUseCase>(RetryFailedJobUseCase);
    dlqService = module.get(DlqService);
    dlqRepository = module.get(DlqRepository);
  });

  it('failed job-г дахин queue-д нэмнэ', async () => {
    const result = await useCase.execute('fj-1');

    expect(result.message).toContain('дахин queue-д нэмэгдлээ');
    expect(dlqService.retryJob).toHaveBeenCalledWith('fj-1');
  });

  it('олдохгүй бол NotFoundException шидэнэ', async () => {
    dlqRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
