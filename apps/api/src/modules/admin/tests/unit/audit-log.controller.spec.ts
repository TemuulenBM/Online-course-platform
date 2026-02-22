import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from '../../interface/controllers/audit-log.controller';
import { ListAuditLogsUseCase } from '../../application/use-cases/list-audit-logs.use-case';
import { GetAuditLogUseCase } from '../../application/use-cases/get-audit-log.use-case';
import { GetEntityAuditTrailUseCase } from '../../application/use-cases/get-entity-audit-trail.use-case';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let listUseCase: jest.Mocked<ListAuditLogsUseCase>;
  let getUseCase: jest.Mocked<GetAuditLogUseCase>;
  let trailUseCase: jest.Mocked<GetEntityAuditTrailUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        { provide: ListAuditLogsUseCase, useValue: { execute: jest.fn() } },
        { provide: GetAuditLogUseCase, useValue: { execute: jest.fn() } },
        { provide: GetEntityAuditTrailUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
    listUseCase = module.get(ListAuditLogsUseCase);
    getUseCase = module.get(GetAuditLogUseCase);
    trailUseCase = module.get(GetEntityAuditTrailUseCase);
  });

  it('list — жагсаалт авах', async () => {
    const mockResult = { data: [], total: 0, page: 1, limit: 20 };
    listUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.list({ page: 1, limit: 20 });

    expect(result).toEqual(mockResult);
  });

  it('getById — ID-аар олох', async () => {
    const mockLog = { id: 'log-1', action: 'CREATE' };
    getUseCase.execute.mockResolvedValue(mockLog as any);

    const result = await controller.getById('log-1');

    expect(result).toEqual(mockLog);
  });

  it('getEntityTrail — entity trail', async () => {
    const mockResult = { data: [], total: 0, page: 1, limit: 20 };
    trailUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.getEntityTrail('COURSE', 'course-1', {});

    expect(result).toEqual(mockResult);
  });
});
