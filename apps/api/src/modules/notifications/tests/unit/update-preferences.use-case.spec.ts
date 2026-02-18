import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePreferencesUseCase } from '../../application/use-cases/update-preferences.use-case';
import { NotificationPreferenceRepository } from '../../infrastructure/repositories/notification-preference.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';
import { UpdatePreferencesDto } from '../../dto/update-preferences.dto';

describe('UpdatePreferencesUseCase', () => {
  let useCase: UpdatePreferencesUseCase;
  let preferenceRepository: jest.Mocked<NotificationPreferenceRepository>;
  let cacheService: jest.Mocked<NotificationCacheService>;

  const now = new Date();

  /** Тестэд ашиглах mock тохиргоо */
  const mockPreference = new NotificationPreferenceEntity({
    id: 'pref-1',
    userId: 'user-1',
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    channelPreferences: {},
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePreferencesUseCase,
        {
          provide: NotificationPreferenceRepository,
          useValue: {
            upsert: jest.fn(),
          },
        },
        {
          provide: NotificationCacheService,
          useValue: {
            invalidatePreferences: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdatePreferencesUseCase>(UpdatePreferencesUseCase);
    preferenceRepository = module.get(NotificationPreferenceRepository);
    cacheService = module.get(NotificationCacheService);
  });

  it('тохиргоо upsert хийж кэш invalidate хийх', async () => {
    /** Repository-д upsert хийж, кэш invalidate хийгдэх */
    preferenceRepository.upsert.mockResolvedValue(mockPreference);
    cacheService.invalidatePreferences.mockResolvedValue(undefined);

    const dto: UpdatePreferencesDto = {
      emailEnabled: true,
      pushEnabled: false,
      smsEnabled: true,
      channelPreferences: { enrollment: { email: true } },
    };

    const result = await useCase.execute('user-1', dto);

    expect(result).toEqual(mockPreference);
    expect(preferenceRepository.upsert).toHaveBeenCalledWith('user-1', {
      emailEnabled: true,
      pushEnabled: false,
      smsEnabled: true,
      channelPreferences: { enrollment: { email: true } },
    });
    expect(cacheService.invalidatePreferences).toHaveBeenCalledWith('user-1');
  });
});
