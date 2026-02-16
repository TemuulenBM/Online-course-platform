import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UpdateUserProfileDto } from '../../dto/update-user-profile.dto';

/**
 * Профайл шинэчлэх use case.
 * Өөрийн профайл эсвэл admin шинэчилж болно. Кэш invalidate хийнэ.
 */
@Injectable()
export class UpdateUserProfileUseCase {
  private readonly logger = new Logger(UpdateUserProfileUseCase.name);

  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userCacheService: UserCacheService,
  ) {}

  async execute(
    targetUserId: string,
    currentUserId: string,
    currentUserRole: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileEntity> {
    // Эрхийн шалгалт: өөрөө эсвэл admin
    if (targetUserId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Бусдын профайл шинэчлэх эрхгүй');
    }

    // Профайл байгаа эсэх шалгах
    const existing = await this.userProfileRepository.findByUserId(targetUserId);
    if (!existing) {
      throw new NotFoundException('Хэрэглэгчийн профайл олдсонгүй');
    }

    const updated = await this.userProfileRepository.update(targetUserId, dto);

    // Кэш invalidate
    await this.userCacheService.invalidate(targetUserId);

    this.logger.log(`Профайл шинэчлэгдлээ: ${targetUserId}`);
    return updated;
  }
}
