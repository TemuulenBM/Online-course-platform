import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
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

    /* Sharp-ээр 400x400 JPEG болгон resize + optimize хийх */
    const resizedBuffer = await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover', position: 'top' })
      .jpeg({ quality: 85 })
      .toBuffer();

    /* Resize хийсэн buffer-г file объектод шинэчлэх */
    file.buffer = resizedBuffer;
    file.size = resizedBuffer.length;
    file.mimetype = 'image/jpeg';

    /* Шинэ файлыг хадгалах (JPEG format) */
    const filePath = `avatars/${userId}.jpg`;
    const { url } = await this.storageService.upload(file, filePath);

    /* Профайл шинэчлэх */
    const updated = await this.userProfileRepository.update(userId, { avatarUrl: url });

    /* Кэш invalidate */
    await this.userCacheService.invalidate(userId);

    return updated;
  }
}
