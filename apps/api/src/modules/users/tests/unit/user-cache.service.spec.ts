import { Test, TestingModule } from '@nestjs/testing';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';
import { RedisService } from '../../../../common/redis/redis.service';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';

describe('UserCacheService', () => {
  let service: UserCacheService;
  let redisService: jest.Mocked<RedisService>;
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

  /** Кэшэд хадгалагдсан профайлын мэдээлэл */
  const cachedProfileData = mockProfile.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: UserProfileRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserCacheService>(UserCacheService);
    redisService = module.get(RedisService);
    userProfileRepository = module.get(UserProfileRepository);
  });

  describe('getProfile', () => {
    it('кэшнээс профайл авах', async () => {
      // Redis-д кэшлэгдсэн мэдээлэл байгаа
      redisService.get.mockResolvedValue(cachedProfileData);

      const result = await service.getProfile('user-id-1');

      expect(result).toBeDefined();
      expect(result!.userId).toBe('user-id-1');
      expect(result!.firstName).toBe('Бат');
      expect(redisService.get).toHaveBeenCalledWith('user:profile:user-id-1');
      // DB руу хандаагүй байх ёстой
      expect(userProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('DB-ээс профайл аваад кэшлэх', async () => {
      // Redis-д кэш байхгүй
      redisService.get.mockResolvedValue(null);
      // DB-ээс профайл олдоно
      userProfileRepository.findByUserId.mockResolvedValue(mockProfile);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getProfile('user-id-1');

      expect(result).toBeDefined();
      expect(result!.userId).toBe('user-id-1');
      expect(redisService.get).toHaveBeenCalledWith('user:profile:user-id-1');
      expect(userProfileRepository.findByUserId).toHaveBeenCalledWith('user-id-1');
      // Кэшлэгдсэн байх ёстой (TTL: 900 секунд)
      expect(redisService.set).toHaveBeenCalledWith(
        'user:profile:user-id-1',
        mockProfile.toResponse(),
        900,
      );
    });

    it('профайл олдоогүй', async () => {
      // Redis-д кэш байхгүй
      redisService.get.mockResolvedValue(null);
      // DB-ээс ч олдохгүй
      userProfileRepository.findByUserId.mockResolvedValue(null);

      const result = await service.getProfile('user-id-1');

      expect(result).toBeNull();
      expect(redisService.get).toHaveBeenCalledWith('user:profile:user-id-1');
      expect(userProfileRepository.findByUserId).toHaveBeenCalledWith('user-id-1');
      // Кэшлэхгүй байх ёстой
      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('invalidate', () => {
    it('кэш амжилттай устгах', async () => {
      redisService.del.mockResolvedValue(undefined);

      await service.invalidate('user-id-1');

      expect(redisService.del).toHaveBeenCalledWith('user:profile:user-id-1');
    });
  });
});
