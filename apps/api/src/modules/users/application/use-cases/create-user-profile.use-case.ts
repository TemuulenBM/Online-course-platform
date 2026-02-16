import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { CreateUserProfileDto } from '../../dto/create-user-profile.dto';

/**
 * Профайл үүсгэх use case.
 * Давхардал шалгаж, шинэ профайл үүсгэнэ.
 */
@Injectable()
export class CreateUserProfileUseCase {
  private readonly logger = new Logger(CreateUserProfileUseCase.name);

  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async execute(userId: string, dto: CreateUserProfileDto): Promise<UserProfileEntity> {
    // Давхардал шалгах
    const existing = await this.userProfileRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Хэрэглэгчийн профайл аль хэдийн үүсгэгдсэн байна');
    }

    const profile = await this.userProfileRepository.create({
      userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    this.logger.log(`Профайл үүсгэгдлээ: ${userId}`);
    return profile;
  }
}
