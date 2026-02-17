import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { ContentEntity } from '../../domain/entities/content.entity';
import { SetTextContentDto } from '../../dto/set-text-content.dto';
import { SetVideoContentDto } from '../../dto/set-video-content.dto';

/**
 * Контент тавих use case (upsert).
 * Хичээлд контент байвал шинэчлэнэ, байхгүй бол шинээр үүсгэнэ.
 */
@Injectable()
export class SetContentUseCase {
  private readonly logger = new Logger(SetContentUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly contentRepository: ContentRepository,
    private readonly contentCacheService: ContentCacheService,
  ) {}

  /** Текст контент тавих */
  async executeText(
    currentUserId: string,
    currentUserRole: string,
    dto: SetTextContentDto,
  ): Promise<ContentEntity> {
    const lesson = await this.validateAndAuthorize(
      dto.lessonId,
      currentUserId,
      currentUserRole,
    );

    // Хичээлийн төрөл шалгах — text хичээлд л текст контент тавих боломжтой
    if (lesson.lessonType !== 'text') {
      throw new BadRequestException(
        `Энэ хичээл "${lesson.lessonType}" төрлийн тул текст контент тавих боломжгүй`,
      );
    }

    const existing = await this.contentRepository.findByLessonId(dto.lessonId);

    let content: ContentEntity;
    if (existing) {
      content = (await this.contentRepository.updateByLessonId(dto.lessonId, {
        contentType: 'text',
        textContent: {
          html: dto.html,
          markdown: dto.markdown,
          readingTimeMinutes: dto.readingTimeMinutes,
        },
      }))!;
      this.logger.log(`Текст контент шинэчлэгдлээ: lessonId=${dto.lessonId}`);
    } else {
      content = await this.contentRepository.create({
        lessonId: dto.lessonId,
        contentType: 'text',
        textContent: {
          html: dto.html,
          markdown: dto.markdown,
          readingTimeMinutes: dto.readingTimeMinutes,
        },
      });
      this.logger.log(`Текст контент үүсгэгдлээ: lessonId=${dto.lessonId}`);
    }

    await this.contentCacheService.invalidateContent(dto.lessonId);
    return content;
  }

  /** Видео контент тавих */
  async executeVideo(
    currentUserId: string,
    currentUserRole: string,
    dto: SetVideoContentDto,
  ): Promise<ContentEntity> {
    const lesson = await this.validateAndAuthorize(
      dto.lessonId,
      currentUserId,
      currentUserRole,
    );

    if (lesson.lessonType !== 'video') {
      throw new BadRequestException(
        `Энэ хичээл "${lesson.lessonType}" төрлийн тул видео контент тавих боломжгүй`,
      );
    }

    const existing = await this.contentRepository.findByLessonId(dto.lessonId);

    let content: ContentEntity;
    if (existing) {
      content = (await this.contentRepository.updateByLessonId(dto.lessonId, {
        contentType: 'video',
        videoContent: {
          videoUrl: dto.videoUrl,
          thumbnailUrl: dto.thumbnailUrl,
          durationSeconds: dto.durationSeconds,
        },
      }))!;
      this.logger.log(`Видео контент шинэчлэгдлээ: lessonId=${dto.lessonId}`);
    } else {
      content = await this.contentRepository.create({
        lessonId: dto.lessonId,
        contentType: 'video',
        videoContent: {
          videoUrl: dto.videoUrl,
          thumbnailUrl: dto.thumbnailUrl,
          durationSeconds: dto.durationSeconds,
        },
      });
      this.logger.log(`Видео контент үүсгэгдлээ: lessonId=${dto.lessonId}`);
    }

    await this.contentCacheService.invalidateContent(dto.lessonId);
    return content;
  }

  /** Хичээл олох, эрхийн шалгалт хийх */
  private async validateAndAuthorize(
    lessonId: string,
    currentUserId: string,
    currentUserRole: string,
  ) {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    if (
      lesson.courseInstructorId !== currentUserId &&
      currentUserRole !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Зөвхөн хичээлийн эзэмшигч эсвэл админ контент тавих боломжтой',
      );
    }

    return lesson;
  }
}
