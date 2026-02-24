import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserProfileRepository } from '../../infrastructure/repositories/user-profile.repository';
import { UserCacheService } from '../../infrastructure/services/user-cache.service';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '../../../content/infrastructure/services/storage/storage.interface';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';

/** Зөвшөөрөгдсөн зургийн MIME типүүд */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Хамгийн их файлын хэмжээ (5MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Аватар зураг upload хийх use case.
 * Файлыг storage-д хадгалаад, профайлын avatarUrl-г шинэчилнэ.
 */
@Injectable()
export class UploadAvatarUseCase {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userCacheService: UserCacheService,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  async execute(userId: string, file: Express.Multer.File): Promise<UserProfileEntity> {
    /* Файл validation */
    if (!file) {
      throw new BadRequestException('Зураг илгээнэ үү');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Зөвхөн JPEG, PNG, WebP формат зөвшөөрөгдөнө');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Файлын хэмжээ 5MB-аас хэтрэхгүй байх ёстой');
    }

    /* Профайл байгаа эсэхийг шалгах */
    const existing = await this.userProfileRepository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundException('Профайл олдсонгүй');
    }

    /* Хуучин аватар байвал устгах */
    if (existing.avatarUrl) {
      await this.storageService.delete(existing.avatarUrl).catch(() => {});
    }

    /* Шинэ файлыг хадгалах */
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const filePath = `avatars/${userId}.${ext}`;
    const { url } = await this.storageService.upload(file, filePath);

    /* Профайл шинэчлэх */
    const updated = await this.userProfileRepository.update(userId, { avatarUrl: url });

    /* Кэш invalidate */
    await this.userCacheService.invalidate(userId);

    return updated;
  }
}
