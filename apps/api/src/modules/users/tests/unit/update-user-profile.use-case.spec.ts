import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UpdateUserProfileDto } from '../../dto/update-user-profile.dto';

describe('UpdateUserProfileUseCase', () => {
  let useCase: UpdateUserProfileUseCase;
  let userProfileRepository: jest.Mocked<UserProfileRepository>;
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

  /** Шинэчлэгдсэн mock профайл */
  const updatedProfile = new UserProfileEntity({
    id: 'profile-id-1',
    userId: 'user-id-1',
    firstName: 'Батболд',
    lastName: 'Дорж',
    avatarUrl: null,
    bio: 'Програм хангамжийн инженер',
    country: null,
    timezone: null,
    preferences: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserProfileUseCase,
        {
          provide: UserProfileRepository,
          useValue: {
            findByUserId: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UserCacheService,
          useValue: {
            invalidate: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserProfileUseCase>(UpdateUserProfileUseCase);
    userProfileRepository = module.get(UserProfileRepository);
    userCacheService = module.get(UserCacheService);
  });

  it('өөрийн профайл амжилттай шинэчлэх', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(mockProfile);
    userProfileRepository.update.mockResolvedValue(updatedProfile);
    userCacheService.invalidate.mockResolvedValue(undefined);

    const dto: UpdateUserProfileDto = {
      firstName: 'Батболд',
      bio: 'Програм хангамжийн инженер',
    };

    // Өөрийн userId-аар шинэчлэх (targetUserId === currentUserId)
    const result = await useCase.execute('user-id-1', 'user-id-1', 'STUDENT', dto);

    expect(result).toEqual(updatedProfile);
    expect(result.firstName).toBe('Батболд');
    expect(userProfileRepository.findByUserId).toHaveBeenCalledWith('user-id-1');
    expect(userProfileRepository.update).toHaveBeenCalledWith('user-id-1', dto);
    expect(userCacheService.invalidate).toHaveBeenCalledWith('user-id-1');
  });

  it('admin бусдын профайл шинэчлэх', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(mockProfile);
    userProfileRepository.update.mockResolvedValue(updatedProfile);
    userCacheService.invalidate.mockResolvedValue(undefined);

    const dto: UpdateUserProfileDto = {
      firstName: 'Батболд',
    };

    // Admin өөр хэрэглэгчийн профайлыг шинэчлэх
    const result = await useCase.execute('user-id-1', 'admin-id-1', 'ADMIN', dto);

    expect(result).toEqual(updatedProfile);
    expect(userProfileRepository.findByUserId).toHaveBeenCalledWith('user-id-1');
    expect(userProfileRepository.update).toHaveBeenCalledWith('user-id-1', dto);
    expect(userCacheService.invalidate).toHaveBeenCalledWith('user-id-1');
  });

  it('бусдын профайл шинэчлэхэд эрхгүй алдаа', async () => {
    const dto: UpdateUserProfileDto = {
      firstName: 'Батболд',
    };

    // STUDENT эрхтэй хэрэглэгч бусдын профайл шинэчлэхийг оролдох
    await expect(useCase.execute('user-id-1', 'other-user-id', 'STUDENT', dto)).rejects.toThrow(
      ForbiddenException,
    );

    expect(userProfileRepository.findByUserId).not.toHaveBeenCalled();
    expect(userProfileRepository.update).not.toHaveBeenCalled();
  });

  it('профайл олдоогүй үед алдаа буцаах', async () => {
    // Профайл олдохгүй
    userProfileRepository.findByUserId.mockResolvedValue(null);

    const dto: UpdateUserProfileDto = {
      firstName: 'Батболд',
    };

    await expect(useCase.execute('user-id-1', 'user-id-1', 'STUDENT', dto)).rejects.toThrow(
      NotFoundException,
    );

    expect(userProfileRepository.update).not.toHaveBeenCalled();
    expect(userCacheService.invalidate).not.toHaveBeenCalled();
  });
});
