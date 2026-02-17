import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '../../infrastructure/services/storage/storage.interface';
import { ContentEntity } from '../../domain/entities/content.entity';

/** Зөвшөөрөгдсөн файлын төрлүүд */
export type FileType = 'video' | 'thumbnail' | 'attachment' | 'subtitle';

/**
 * Файл upload use case.
 * Файлыг хадгалалтад upload хийж, контентыг шинэчлэнэ.
 */
@Injectable()
export class UploadFileUseCase {
  private readonly logger = new Logger(UploadFileUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly contentRepository: ContentRepository,
    private readonly contentCacheService: ContentCacheService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    lessonId: string,
    currentUserId: string,
    currentUserRole: string,
    file: Express.Multer.File,
    fileType: FileType,
  ): Promise<ContentEntity> {
    if (!file) {
      throw new BadRequestException('Файл илгээгдээгүй');
    }

    // Хичээл олох + эрх шалгах
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    if (
      lesson.courseInstructorId !== currentUserId &&
      currentUserRole !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Зөвхөн хичээлийн эзэмшигч эсвэл админ файл upload хийх боломжтой',
      );
    }

    // Файлыг хадгалах
    const storagePath = `content/${lessonId}/${fileType}/${Date.now()}-${file.originalname}`;
    const { url, sizeBytes } = await this.storageService.upload(
      file,
      storagePath,
    );

    // Контент олох эсвэл үүсгэх
    let content = await this.contentRepository.findByLessonId(lessonId);

    if (!content) {
      // Контент байхгүй бол автоматаар үүсгэнэ
      content = await this.contentRepository.create({
        lessonId,
        contentType: lesson.lessonType,
      });
    }

    // Файлын төрлөөс хамааран контентыг шинэчлэх
    switch (fileType) {
      case 'video':
        await this.contentRepository.updateByLessonId(lessonId, {
          videoContent: {
            videoUrl: url,
            thumbnailUrl: content.videoContent?.thumbnailUrl,
            durationSeconds: content.videoContent?.durationSeconds,
            transcodedVersions: content.videoContent?.transcodedVersions ?? [],
            subtitles: content.videoContent?.subtitles ?? [],
          },
        });
        break;

      case 'thumbnail':
        await this.contentRepository.updateByLessonId(lessonId, {
          videoContent: {
            videoUrl: content.videoContent?.videoUrl,
            thumbnailUrl: url,
            durationSeconds: content.videoContent?.durationSeconds,
            transcodedVersions: content.videoContent?.transcodedVersions ?? [],
            subtitles: content.videoContent?.subtitles ?? [],
          },
        });
        break;

      case 'attachment':
        await this.contentRepository.addAttachment(lessonId, {
          filename: file.originalname,
          url,
          sizeBytes,
          mimeType: file.mimetype,
        });
        break;

      case 'subtitle': {
        // Хадмал хэлийг файлын нэрнээс тодорхойлно (жнь: lesson-1-mn.vtt → mn)
        const langMatch = file.originalname.match(/-(\w{2})\.\w+$/);
        const language = langMatch ? langMatch[1] : 'unknown';

        const subtitles = [
          ...(content.videoContent?.subtitles ?? []),
          { language, url },
        ];
        await this.contentRepository.updateByLessonId(lessonId, {
          videoContent: {
            videoUrl: content.videoContent?.videoUrl,
            thumbnailUrl: content.videoContent?.thumbnailUrl,
            durationSeconds: content.videoContent?.durationSeconds,
            transcodedVersions: content.videoContent?.transcodedVersions ?? [],
            subtitles,
          },
        });
        break;
      }
    }

    // Шинэчлэгдсэн контент авах
    const updated = await this.contentRepository.findByLessonId(lessonId);
    await this.contentCacheService.invalidateContent(lessonId);

    this.logger.log(
      `Файл upload хийгдлээ: lessonId=${lessonId}, fileType=${fileType}`,
    );

    return updated!;
  }
}
