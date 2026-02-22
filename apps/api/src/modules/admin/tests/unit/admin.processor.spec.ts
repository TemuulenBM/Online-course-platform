import { Test, TestingModule } from '@nestjs/testing';
import { AdminProcessor } from '../../infrastructure/services/admin.processor';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

describe('AdminProcessor', () => {
  let processor: AdminProcessor;
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
      providers: [AdminProcessor, { provide: AuditLogRepository, useValue: { create: jest.fn() } }],
    }).compile();

    processor = module.get<AdminProcessor>(AdminProcessor);
    repository = module.get(AuditLogRepository);
  });

  it('audit log-г DB-д бичнэ', async () => {
    repository.create.mockResolvedValue(mockLog);

    await processor.handleCreateAuditLog({
      data: {
        userId: 'user-1',
        action: 'UPDATE',
        entityType: 'COURSE',
        entityId: 'course-1',
      },
    } as any);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'UPDATE',
      }),
    );
  });

  it('алдаа гарсан ч exception шидэхгүй', async () => {
    repository.create.mockRejectedValue(new Error('DB error'));

    await expect(
      processor.handleCreateAuditLog({
        data: {
          userId: 'user-1',
          action: 'UPDATE',
          entityType: 'COURSE',
          entityId: 'course-1',
        },
      } as any),
    ).resolves.not.toThrow();
  });
});
