import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserProfileUseCase } from '../../application/use-cases/create-user-profile.use-case';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { CreateUserProfileDto } from '../../dto/create-user-profile.dto';

describe('CreateUserProfileUseCase', () => {
  let useCase: CreateUserProfileUseCase;
  let userProfileRepository: jest.Mocked<UserProfileRepository>;

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
        CreateUserProfileUseCase,
        {
          provide: UserProfileRepository,
          useValue: {
            findByUserId: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateUserProfileUseCase>(CreateUserProfileUseCase);
    userProfileRepository = module.get(UserProfileRepository);
  });

  it('амжилттай профайл үүсгэх', async () => {
    // Давхардсан профайл байхгүй
    userProfileRepository.findByUserId.mockResolvedValue(null);
    userProfileRepository.create.mockResolvedValue(mockProfile);

    const dto: CreateUserProfileDto = {
      firstName: 'Бат',
      lastName: 'Дорж',
    };

    const result = await useCase.execute('user-id-1', dto);

    expect(result).toEqual(mockProfile);
    expect(result.userId).toBe('user-id-1');
    expect(result.firstName).toBe('Бат');
    expect(result.lastName).toBe('Дорж');
    expect(userProfileRepository.findByUserId).toHaveBeenCalledWith('user-id-1');
    expect(userProfileRepository.create).toHaveBeenCalledWith({
      userId: 'user-id-1',
      firstName: 'Бат',
      lastName: 'Дорж',
    });
  });

  it('давхардсан профайл үүсгэхэд алдаа буцаах', async () => {
    // Профайл аль хэдийн байгаа
    userProfileRepository.findByUserId.mockResolvedValue(mockProfile);

    const dto: CreateUserProfileDto = {
      firstName: 'Бат',
      lastName: 'Дорж',
    };

    await expect(useCase.execute('user-id-1', dto)).rejects.toThrow(ConflictException);
    expect(userProfileRepository.create).not.toHaveBeenCalled();
  });
});
