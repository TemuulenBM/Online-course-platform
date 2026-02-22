import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuditLogUseCase } from '../../application/use-cases/create-audit-log.use-case';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

describe('CreateAuditLogUseCase', () => {
  let useCase: CreateAuditLogUseCase;
  let repository: jest.Mocked<AuditLogRepository>;

  const mockAuditLog = new AuditLogEntity({
    id: 'log-1',
    userId: 'user-1',
    action: 'UPDATE',
    entityType: 'COURSE',
    entityId: 'course-1',
    changes: { before: { title: 'Old' }, after: { title: 'New' } },
    ipAddress: '127.0.0.1',
    userAgent: null,
    metadata: null,
    createdAt: new Date(),
    userName: 'Test User',
    userEmail: 'test@test.com',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAuditLogUseCase,
        { provide: AuditLogRepository, useValue: { create: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<CreateAuditLogUseCase>(CreateAuditLogUseCase);
    repository = module.get(AuditLogRepository);
  });

  it('audit log амжилттай бүртгэнэ', async () => {
    repository.create.mockResolvedValue(mockAuditLog);

    const result = await useCase.execute({
      userId: 'user-1',
      action: 'UPDATE',
      entityType: 'COURSE',
      entityId: 'course-1',
      changes: { before: { title: 'Old' }, after: { title: 'New' } },
    });

    expect(result).toEqual(mockAuditLog.toResponse());
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'UPDATE',
      }),
    );
  });

  it('repository-д зөв өгөгдөл дамжуулна', async () => {
    repository.create.mockResolvedValue(mockAuditLog);

    await useCase.execute({
      userId: 'user-1',
      action: 'DELETE',
      entityType: 'USER',
      entityId: 'user-2',
      ipAddress: '192.168.1.1',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE',
        entityType: 'USER',
        entityId: 'user-2',
        ipAddress: '192.168.1.1',
      }),
    );
  });
});
