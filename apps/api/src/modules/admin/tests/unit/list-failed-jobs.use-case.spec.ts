import { Test, TestingModule } from '@nestjs/testing';
import { ListFailedJobsUseCase } from '../../application/use-cases/list-failed-jobs.use-case';
import { DlqRepository } from '../../../../common/dlq/dlq.repository';

describe('ListFailedJobsUseCase', () => {
  let useCase: ListFailedJobsUseCase;
  let dlqRepository: jest.Mocked<DlqRepository>;

  const mockResult = {
    items: [{ id: 'fj-1', queueName: 'payments', severity: 'CRITICAL' }],
    total: 1,
    page: 1,
    limit: 20,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListFailedJobsUseCase,
        {
          provide: DlqRepository,
          useValue: { findMany: jest.fn().mockResolvedValue(mockResult) },
        },
      ],
    }).compile();

    useCase = module.get<ListFailedJobsUseCase>(ListFailedJobsUseCase);
    dlqRepository = module.get(DlqRepository);
  });

  it('failed job жагсаалт буцаана', async () => {
    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result).toEqual(mockResult);
    expect(dlqRepository.findMany).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('filter-тэй дуудаж болно', async () => {
    await useCase.execute({
      page: 1,
      limit: 10,
      queueName: 'payments',
      severity: 'CRITICAL',
      status: 'PENDING',
    });

    expect(dlqRepository.findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      queueName: 'payments',
      severity: 'CRITICAL',
      status: 'PENDING',
    });
  });
});
