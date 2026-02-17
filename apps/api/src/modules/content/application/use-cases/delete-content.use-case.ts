import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '../../infrastructure/services/storage/storage.interface';

/**
 * Контент устгах use case.
 * Хичээлийн контент болон холбогдох файлуудыг устгана.
 */
@Injectable()
export class DeleteContentUseCase {
  private readonly logger = new Logger(DeleteContentUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly contentRepository: ContentRepository,
    private readonly contentCacheService: ContentCacheService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async execute(lessonId: string, currentUserId: string, currentUserRole: string): Promise<void> {
    // Хичээл олох + эрх шалгах
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    if (lesson.courseInstructorId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Зөвхөн хичээлийн эзэмшигч эсвэл админ контент устгах боломжтой',
      );
    }

    // Контент олох
    const content = await this.contentRepository.findByLessonId(lessonId);
    if (!content) {
      throw new NotFoundException('Хичээлийн контент олдсонгүй');
    }

    // Хадгалагдсан файлуудыг устгах
    const deletePromises: Promise<void>[] = [];

    if (content.videoContent?.videoUrl) {
      deletePromises.push(this.storageService.delete(content.videoContent.videoUrl));
    }
    if (content.videoContent?.thumbnailUrl) {
      deletePromises.push(this.storageService.delete(content.videoContent.thumbnailUrl));
    }
    for (const subtitle of content.videoContent?.subtitles ?? []) {
      deletePromises.push(this.storageService.delete(subtitle.url));
    }
    for (const attachment of content.attachments) {
      deletePromises.push(this.storageService.delete(attachment.url));
    }

    await Promise.allSettled(deletePromises);

    // MongoDB document устгах
    await this.contentRepository.deleteByLessonId(lessonId);

    // Кэш invalidate
    await this.contentCacheService.invalidateContent(lessonId);

    this.logger.log(`Контент устгагдлаа: lessonId=${lessonId}`);
  }
}
