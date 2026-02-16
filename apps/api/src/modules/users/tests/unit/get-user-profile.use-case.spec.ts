import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userCacheService: jest.Mocked<UserCacheService>;

  /** Тестэд ашиглах mock профайл */
  const mockProfile = new UserProfileEntity({
    id: 'profile-id-1',
    userId: 'user-id-1',
    firstName: 'Бат',
    lastName: 'Дорж',
    avatarUrl: null,
    bio: null,
    country: null,
    timezone: null,
    preferences: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        {
          provide: UserCacheService,
          useValue: {
            getProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase);
    userCacheService = module.get(UserCacheService);
  });

  it('кэшнээс профайл амжилттай авах', async () => {
    userCacheService.getProfile.mockResolvedValue(mockProfile);

    const result = await useCase.execute('user-id-1');

    expect(result).toEqual(mockProfile);
    expect(result.userId).toBe('user-id-1');
    expect(result.firstName).toBe('Бат');
    expect(userCacheService.getProfile).toHaveBeenCalledWith('user-id-1');
  });

  it('профайл олдоогүй үед алдаа буцаах', async () => {
    userCacheService.getProfile.mockResolvedValue(null);

    await expect(useCase.execute('user-id-1')).rejects.toThrow(NotFoundException);
    expect(userCacheService.getProfile).toHaveBeenCalledWith('user-id-1');
  });
});
