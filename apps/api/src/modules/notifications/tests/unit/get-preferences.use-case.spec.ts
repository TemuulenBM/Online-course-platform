import { Test, TestingModule } from '@nestjs/testing';
import { GetPreferencesUseCase } from '../../application/use-cases/get-preferences.use-case';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';
import { NotificationPreferenceEntity } from '../../domain/entities/notification-preference.entity';

describe('GetPreferencesUseCase', () => {
  let useCase: GetPreferencesUseCase;
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
        GetPreferencesUseCase,
        {
          provide: NotificationCacheService,
          useValue: {
            getPreferences: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetPreferencesUseCase>(GetPreferencesUseCase);
    cacheService = module.get(NotificationCacheService);
  });

  it('тохиргоо олдвол буцаах', async () => {
    /** CacheService-ээс тохиргоо олдвол шууд буцаана */
    cacheService.getPreferences.mockResolvedValue(mockPreference);

    const result = await useCase.execute('user-1');

    expect(result).toEqual(mockPreference);
    expect(cacheService.getPreferences).toHaveBeenCalledWith('user-1');
  });

  it('тохиргоо байхгүй бол default утга буцаах', async () => {
    /** Тохиргоо DB-д байхгүй бол default утга буцаана */
    cacheService.getPreferences.mockResolvedValue(null);

    const result = await useCase.execute('user-1');

    /** Default утгууд шалгах */
    expect(result.emailEnabled).toBe(true);
    expect(result.pushEnabled).toBe(true);
    expect(result.smsEnabled).toBe(false);
    expect(result.userId).toBe('user-1');
    expect(result.id).toBe('');
    expect(result.channelPreferences).toEqual({});
  });
});
