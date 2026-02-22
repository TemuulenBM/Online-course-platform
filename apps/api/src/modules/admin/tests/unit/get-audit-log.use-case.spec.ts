import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAuditLogUseCase } from '../../application/use-cases/get-audit-log.use-case';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

describe('GetAuditLogUseCase', () => {
  let useCase: GetAuditLogUseCase;
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
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAuditLogUseCase,
        { provide: AuditLogRepository, useValue: { findById: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<GetAuditLogUseCase>(GetAuditLogUseCase);
    repository = module.get(AuditLogRepository);
  });

  it('ID-аар audit log олж буцаана', async () => {
    repository.findById.mockResolvedValue(mockLog);

    const result = await useCase.execute('log-1');

    expect(result).toEqual(mockLog.toResponse());
  });

  it('олдоогүй бол NotFoundException шидэнэ', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
