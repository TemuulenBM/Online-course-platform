import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { ContentEntity } from '../../domain/entities/content.entity';
import { UpdateTextContentDto } from '../../dto/update-text-content.dto';
import { UpdateVideoContentDto } from '../../dto/update-video-content.dto';

/**
 * Контент шинэчлэх use case.
 * Хичээлийн байгаа контентыг хэсэгчлэн шинэчлэнэ.
 */
@Injectable()
export class UpdateContentUseCase {
  private readonly logger = new Logger(UpdateContentUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly contentRepository: ContentRepository,
    private readonly contentCacheService: ContentCacheService,
  ) {}

  async execute(
    lessonId: string,
    currentUserId: string,
    currentUserRole: string,
    dto: UpdateTextContentDto | UpdateVideoContentDto,
  ): Promise<ContentEntity> {
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
        'Зөвхөн хичээлийн эзэмшигч эсвэл админ контент шинэчлэх боломжтой',
      );
    }

    // Контент байгаа эсэх шалгах
    const existing = await this.contentRepository.findByLessonId(lessonId);
    if (!existing) {
      throw new NotFoundException('Хичээлийн контент олдсонгүй');
    }

    // Контентын төрлөөс хамааран шинэчлэх
    const updateData: any = {};

    if (existing.contentType === 'text') {
      const textDto = dto as UpdateTextContentDto;
      updateData.textContent = {
        html: textDto.html ?? existing.textContent?.html,
        markdown: textDto.markdown ?? existing.textContent?.markdown,
        readingTimeMinutes:
          textDto.readingTimeMinutes ?? existing.textContent?.readingTimeMinutes,
      };
    } else if (existing.contentType === 'video') {
      const videoDto = dto as UpdateVideoContentDto;
      updateData.videoContent = {
        videoUrl: videoDto.videoUrl ?? existing.videoContent?.videoUrl,
        thumbnailUrl:
          videoDto.thumbnailUrl ?? existing.videoContent?.thumbnailUrl,
        durationSeconds:
          videoDto.durationSeconds ?? existing.videoContent?.durationSeconds,
        transcodedVersions: existing.videoContent?.transcodedVersions ?? [],
        subtitles: existing.videoContent?.subtitles ?? [],
      };
    }

    const content = await this.contentRepository.updateByLessonId(
      lessonId,
      updateData,
    );

    await this.contentCacheService.invalidateContent(lessonId);
    this.logger.log(`Контент шинэчлэгдлээ: lessonId=${lessonId}`);

    return content!;
  }
}
