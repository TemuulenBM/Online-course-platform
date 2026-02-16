import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../common/redis/redis.service';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UserProfileRepository } from '../repositories/user-profile.repository';

/** Профайл кэшийн TTL — 15 минут (секундээр) */
const PROFILE_CACHE_TTL = 900;

/** Кэш түлхүүрийн загвар */
const CACHE_KEY_PREFIX = 'user:profile:';

/**
 * Хэрэглэгчийн профайлын кэш сервис.
 * Redis-д профайл кэшлэж, DB ачааллыг бууруулна.
 */
@Injectable()
export class UserCacheService {
  private readonly logger = new Logger(UserCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  /** Профайл авах — Redis кэшээс эхлээд, байхгүй бол DB-ээс */
  async getProfile(userId: string): Promise<UserProfileEntity | null> {
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;

    // Redis кэшээс хайх
    const cached = await this.redisService.get<ReturnType<UserProfileEntity['toResponse']>>(cacheKey);
    if (cached) {
      this.logger.debug(`Кэшнээс профайл олдлоо: ${userId}`);
      return new UserProfileEntity({
        ...cached,
        createdAt: new Date(cached.createdAt),
        updatedAt: new Date(cached.updatedAt),
      });
    }

    // DB-ээс хайж, кэшлэх
    const profile = await this.userProfileRepository.findByUserId(userId);
    if (profile) {
      await this.redisService.set(cacheKey, profile.toResponse(), PROFILE_CACHE_TTL);
      this.logger.debug(`Профайл кэшлэгдлээ: ${userId}`);
    }

    return profile;
  }

  /** Кэш устгах (update/delete үед дуудна) */
  async invalidate(userId: string): Promise<void> {
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
    await this.redisService.del(cacheKey);
    this.logger.debug(`Кэш устгагдлаа: ${userId}`);
  }
}
