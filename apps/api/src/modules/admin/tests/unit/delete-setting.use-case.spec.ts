import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteSettingUseCase } from '../../application/use-cases/delete-setting.use-case';
import { SystemSettingRepository } from '../../infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';
import { SystemSettingEntity } from '../../domain/entities/system-setting.entity';

describe('DeleteSettingUseCase', () => {
  let useCase: DeleteSettingUseCase;
  let repository: jest.Mocked<SystemSettingRepository>;
  let cacheService: jest.Mocked<AdminCacheService>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockSetting = new SystemSettingEntity({
    id: 'setting-1',
    key: 'old.setting',
    value: 'value',
    description: null,
    category: 'general',
    isPublic: false,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSettingUseCase,
        {
          provide: SystemSettingRepository,
          useValue: { findByKey: jest.fn(), delete: jest.fn() },
        },
        { provide: AdminCacheService, useValue: { invalidateSettings: jest.fn() } },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<DeleteSettingUseCase>(DeleteSettingUseCase);
    repository = module.get(SystemSettingRepository);
    cacheService = module.get(AdminCacheService);
    auditLogService = module.get(AuditLogService);
  });

  it('тохиргоо амжилттай устгана', async () => {
    repository.findByKey.mockResolvedValue(mockSetting);

    await useCase.execute('old.setting', 'admin-1');

    expect(repository.delete).toHaveBeenCalledWith('old.setting');
    expect(cacheService.invalidateSettings).toHaveBeenCalledWith('old.setting');
    expect(auditLogService.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE' }));
  });

  it('олдоогүй бол NotFoundException шидэнэ', async () => {
    repository.findByKey.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'admin-1')).rejects.toThrow(NotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
