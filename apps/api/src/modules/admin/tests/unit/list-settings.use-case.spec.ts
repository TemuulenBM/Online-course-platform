import { Test, TestingModule } from '@nestjs/testing';
import { ListSettingsUseCase } from '../../application/use-cases/list-settings.use-case';
import { SystemSettingRepository } from '../../infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { SystemSettingEntity } from '../../domain/entities/system-setting.entity';

describe('ListSettingsUseCase', () => {
  let useCase: ListSettingsUseCase;
  let repository: jest.Mocked<SystemSettingRepository>;
  let cacheService: jest.Mocked<AdminCacheService>;

  const mockSetting = new SystemSettingEntity({
    id: 'setting-1',
    key: 'site.name',
    value: 'My Platform',
    description: 'Сайтын нэр',
    category: 'general',
    isPublic: true,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListSettingsUseCase,
        {
          provide: SystemSettingRepository,
          useValue: { findAll: jest.fn(), findPublic: jest.fn() },
        },
        {
          provide: AdminCacheService,
          useValue: {
            getSettings: jest.fn(),
            setSettings: jest.fn(),
            getPublicSettings: jest.fn(),
            setPublicSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListSettingsUseCase>(ListSettingsUseCase);
    repository = module.get(SystemSettingRepository);
    cacheService = module.get(AdminCacheService);
  });

  it('кэшнээс тохиргоо олдвол шууд буцаана', async () => {
    const cachedData = [mockSetting.toResponse()];
    cacheService.getSettings.mockResolvedValue(cachedData);

    const result = await useCase.execute({});

    expect(result).toEqual(cachedData);
    expect(repository.findAll).not.toHaveBeenCalled();
  });

  it('кэш хоосон бол DB-ээс авч кэшлэнэ', async () => {
    cacheService.getSettings.mockResolvedValue(null);
    repository.findAll.mockResolvedValue([mockSetting]);

    const result = await useCase.execute({});

    expect(result).toHaveLength(1);
    expect(cacheService.setSettings).toHaveBeenCalled();
  });

  it('publicOnly=true бол public тохиргоонуудыг авна', async () => {
    cacheService.getPublicSettings.mockResolvedValue(null);
    repository.findPublic.mockResolvedValue([mockSetting]);

    const result = await useCase.execute({ publicOnly: true });

    expect(result).toHaveLength(1);
    expect(repository.findPublic).toHaveBeenCalled();
    expect(cacheService.setPublicSettings).toHaveBeenCalled();
  });

  it('category filter дамжуулна', async () => {
    cacheService.getSettings.mockResolvedValue(null);
    repository.findAll.mockResolvedValue([]);

    await useCase.execute({ category: 'payment' });

    expect(repository.findAll).toHaveBeenCalledWith('payment');
  });
});
