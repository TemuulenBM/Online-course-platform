import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let queue: { add: jest.Mock };

  beforeEach(async () => {
    queue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLogService, { provide: getQueueToken('admin'), useValue: queue }],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('audit log-г queue-д нэмнэ', async () => {
    await service.log({
      userId: 'user-1',
      action: 'UPDATE',
      entityType: 'COURSE',
      entityId: 'course-1',
    });

    expect(queue.add).toHaveBeenCalledWith(
      'create-audit-log',
      expect.objectContaining({
        userId: 'user-1',
        action: 'UPDATE',
        entityType: 'COURSE',
        entityId: 'course-1',
      }),
      expect.objectContaining({ removeOnComplete: true }),
    );
  });

  it('changes болон metadata дамжуулна', async () => {
    await service.log({
      userId: 'user-1',
      action: 'DELETE',
      entityType: 'USER',
      entityId: 'user-2',
      changes: { before: { role: 'STUDENT' } },
      metadata: { reason: 'test' },
    });

    expect(queue.add).toHaveBeenCalledWith(
      'create-audit-log',
      expect.objectContaining({
        changes: { before: { role: 'STUDENT' } },
        metadata: { reason: 'test' },
      }),
      expect.any(Object),
    );
  });
});
