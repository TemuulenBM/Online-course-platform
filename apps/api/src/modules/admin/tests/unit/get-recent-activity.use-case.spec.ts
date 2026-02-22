import { Test, TestingModule } from '@nestjs/testing';
import { GetRecentActivityUseCase } from '../../application/use-cases/get-recent-activity.use-case';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

describe('GetRecentActivityUseCase', () => {
  let useCase: GetRecentActivityUseCase;
  let repository: jest.Mocked<AuditLogRepository>;

  const mockLog = new AuditLogEntity({
    id: 'log-1',
    userId: 'user-1',
    action: 'UPDATE',
    entityType: 'COURSE',
    entityId: 'course-1',
    changes: null,
    ipAddress: null,
    userAgent: null,
    metadata: null,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRecentActivityUseCase,
        { provide: AuditLogRepository, useValue: { findRecent: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<GetRecentActivityUseCase>(GetRecentActivityUseCase);
    repository = module.get(AuditLogRepository);
  });

  it('сүүлийн үйлдлүүд буцаана', async () => {
    repository.findRecent.mockResolvedValue([mockLog]);

    const result = await useCase.execute(10);

    expect(result).toHaveLength(1);
    expect(repository.findRecent).toHaveBeenCalledWith(10);
  });

  it('default limit 10', async () => {
    repository.findRecent.mockResolvedValue([]);

    await useCase.execute();

    expect(repository.findRecent).toHaveBeenCalledWith(10);
  });
});
