import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetSettingUseCase } from '../../application/use-cases/get-setting.use-case';
import { SystemSettingRepository } from '../../infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { SystemSettingEntity } from '../../domain/entities/system-setting.entity';

describe('GetSettingUseCase', () => {
  let useCase: GetSettingUseCase;
  let repository: jest.Mocked<SystemSettingRepository>;
  let cacheService: jest.Mocked<AdminCacheService>;

  const mockSetting = new SystemSettingEntity({
    id: 'setting-1',
    key: 'site.name',
    value: 'My Platform',
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
        GetSettingUseCase,
        { provide: SystemSettingRepository, useValue: { findByKey: jest.fn() } },
        { provide: AdminCacheService, useValue: { getSetting: jest.fn(), setSetting: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<GetSettingUseCase>(GetSettingUseCase);
    repository = module.get(SystemSettingRepository);
    cacheService = module.get(AdminCacheService);
  });

  it('кэшнээс олдвол шууд буцаана', async () => {
    cacheService.getSetting.mockResolvedValue(mockSetting.toResponse());

    const result = await useCase.execute('site.name');

    expect(result).toEqual(mockSetting.toResponse());
    expect(repository.findByKey).not.toHaveBeenCalled();
  });

  it('DB-ээс олж кэшлэнэ', async () => {
    cacheService.getSetting.mockResolvedValue(null);
    repository.findByKey.mockResolvedValue(mockSetting);

    const result = await useCase.execute('site.name');

    expect(result).toEqual(mockSetting.toResponse());
    expect(cacheService.setSetting).toHaveBeenCalledWith('site.name', mockSetting.toResponse());
  });

  it('олдоогүй бол NotFoundException шидэнэ', async () => {
    cacheService.getSetting.mockResolvedValue(null);
    repository.findByKey.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });
});
