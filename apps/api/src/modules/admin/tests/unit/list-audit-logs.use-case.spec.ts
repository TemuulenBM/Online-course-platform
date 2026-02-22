import { Test, TestingModule } from '@nestjs/testing';
import { ListAuditLogsUseCase } from '../../application/use-cases/list-audit-logs.use-case';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

describe('ListAuditLogsUseCase', () => {
  let useCase: ListAuditLogsUseCase;
  let repository: jest.Mocked<AuditLogRepository>;

  const mockLog = new AuditLogEntity({
    id: 'log-1',
    userId: 'user-1',
    action: 'CREATE',
    entityType: 'COURSE',
    entityId: 'course-1',
    changes: null,
    ipAddress: null,
    userAgent: null,
    metadata: null,
    createdAt: new Date(),
    userName: 'Test',
    userEmail: 'test@test.com',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAuditLogsUseCase,
        { provide: AuditLogRepository, useValue: { findMany: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<ListAuditLogsUseCase>(ListAuditLogsUseCase);
    repository = module.get(AuditLogRepository);
  });

  it('audit log жагсаалт буцаана', async () => {
    repository.findMany.mockResolvedValue({
      data: [mockLog],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(repository.findMany).toHaveBeenCalled();
  });

  it('filter параметрүүдийг зөв дамжуулна', async () => {
    repository.findMany.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    await useCase.execute({
      page: 1,
      limit: 10,
      userId: 'user-1',
      entityType: 'COURSE',
      action: 'UPDATE',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
    });

    expect(repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        entityType: 'COURSE',
        action: 'UPDATE',
      }),
    );
  });

  it('хоосон жагсаалт буцааж болно', async () => {
    repository.findMany.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
