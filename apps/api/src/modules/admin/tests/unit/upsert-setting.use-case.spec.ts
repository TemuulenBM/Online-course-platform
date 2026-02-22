import { Test, TestingModule } from '@nestjs/testing';
import { UpsertSettingUseCase } from '../../application/use-cases/upsert-setting.use-case';
import { SystemSettingRepository } from '../../infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';
import { SystemSettingEntity } from '../../domain/entities/system-setting.entity';

describe('UpsertSettingUseCase', () => {
  let useCase: UpsertSettingUseCase;
  let repository: jest.Mocked<SystemSettingRepository>;
  let cacheService: jest.Mocked<AdminCacheService>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockSetting = new SystemSettingEntity({
    id: 'setting-1',
    key: 'site.name',
    value: 'New Name',
    description: null,
    category: 'general',
    isPublic: false,
    updatedBy: 'admin-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertSettingUseCase,
        {
          provide: SystemSettingRepository,
          useValue: { findByKey: jest.fn(), upsert: jest.fn() },
        },
        {
          provide: AdminCacheService,
          useValue: { invalidateSettings: jest.fn() },
        },
        {
          provide: AuditLogService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<UpsertSettingUseCase>(UpsertSettingUseCase);
    repository = module.get(SystemSettingRepository);
    cacheService = module.get(AdminCacheService);
    auditLogService = module.get(AuditLogService);
  });

  it('шинэ тохиргоо үүсгэнэ (existing байхгүй)', async () => {
    repository.findByKey.mockResolvedValue(null);
    repository.upsert.mockResolvedValue(mockSetting);

    const result = await useCase.execute('site.name', { value: 'New Name' }, 'admin-1');

    expect(result).toEqual(mockSetting.toResponse());
    expect(cacheService.invalidateSettings).toHaveBeenCalledWith('site.name');
    expect(auditLogService.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE' }));
  });

  it('байгаа тохиргоог шинэчлэнэ', async () => {
    const existing = new SystemSettingEntity({
      ...mockSetting,
      value: 'Old Name',
    } as any);
    repository.findByKey.mockResolvedValue(existing);
    repository.upsert.mockResolvedValue(mockSetting);

    await useCase.execute('site.name', { value: 'New Name' }, 'admin-1');

    expect(auditLogService.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE' }));
  });

  it('кэш invalidate хийнэ', async () => {
    repository.findByKey.mockResolvedValue(null);
    repository.upsert.mockResolvedValue(mockSetting);

    await useCase.execute('site.name', { value: 'test' }, 'admin-1');

    expect(cacheService.invalidateSettings).toHaveBeenCalledWith('site.name');
  });
});
