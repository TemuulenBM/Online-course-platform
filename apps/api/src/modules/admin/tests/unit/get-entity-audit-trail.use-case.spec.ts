import { Test, TestingModule } from '@nestjs/testing';
import { GetEntityAuditTrailUseCase } from '../../application/use-cases/get-entity-audit-trail.use-case';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

describe('GetEntityAuditTrailUseCase', () => {
  let useCase: GetEntityAuditTrailUseCase;
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
        GetEntityAuditTrailUseCase,
        { provide: AuditLogRepository, useValue: { findByEntity: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<GetEntityAuditTrailUseCase>(GetEntityAuditTrailUseCase);
    repository = module.get(AuditLogRepository);
  });

  it('entity-ийн audit trail буцаана', async () => {
    repository.findByEntity.mockResolvedValue({
      data: [mockLog],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('COURSE', 'course-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(repository.findByEntity).toHaveBeenCalledWith('COURSE', 'course-1', {
      page: 1,
      limit: 20,
    });
  });

  it('хоосон trail буцааж болно', async () => {
    repository.findByEntity.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    const result = await useCase.execute('USER', 'user-99', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
  });
});
