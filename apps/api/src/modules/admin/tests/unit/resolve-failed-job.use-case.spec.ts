import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ResolveFailedJobUseCase } from '../../application/use-cases/resolve-failed-job.use-case';
import { DlqRepository } from '../../../../common/dlq/dlq.repository';

describe('ResolveFailedJobUseCase', () => {
  let useCase: ResolveFailedJobUseCase;
  let dlqRepository: jest.Mocked<DlqRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResolveFailedJobUseCase,
        {
          provide: DlqRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue({
              id: 'fj-1',
              queueName: 'payments',
              status: 'PENDING',
            }),
            updateStatus: jest.fn().mockResolvedValue({
              id: 'fj-1',
              status: 'RESOLVED',
              resolvedBy: 'admin-1',
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<ResolveFailedJobUseCase>(ResolveFailedJobUseCase);
    dlqRepository = module.get(DlqRepository);
  });

  it('failed job-г resolved гэж тэмдэглэнэ', async () => {
    const result = await useCase.execute('fj-1', 'admin-1');

    expect(result.message).toContain('шийдвэрлэгдсэн');
    expect(dlqRepository.updateStatus).toHaveBeenCalledWith('fj-1', 'RESOLVED', 'admin-1');
  });

  it('олдохгүй бол NotFoundException шидэнэ', async () => {
    dlqRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'admin-1')).rejects.toThrow(NotFoundException);
  });
});
