import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';

/**
 * Профайл авах use case.
 * Redis кэшээс эхлээд, байхгүй бол DB-ээс авна.
 */
@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userCacheService: UserCacheService) {}

  async execute(userId: string): Promise<UserProfileEntity> {
    const profile = await this.userCacheService.getProfile(userId);
    if (!profile) {
      throw new NotFoundException('Хэрэглэгчийн профайл олдсонгүй');
    }
    return profile;
  }
}
