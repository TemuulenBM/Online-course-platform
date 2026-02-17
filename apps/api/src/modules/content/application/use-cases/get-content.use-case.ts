import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { ContentEntity } from '../../domain/entities/content.entity';

/**
 * Контент авах use case.
 * Хичээлийн контентыг кэшээс эсвэл MongoDB-ээс авна.
 */
@Injectable()
export class GetContentUseCase {
  private readonly logger = new Logger(GetContentUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly contentCacheService: ContentCacheService,
  ) {}

  async execute(
    lessonId: string,
    options?: {
      currentUserId?: string;
      currentUserRole?: string;
    },
  ): Promise<ContentEntity> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    // Public хандалтад зөвхөн нийтлэгдсэн хичээлийн контент
    const isOwnerOrAdmin =
      options?.currentUserId &&
      (lesson.courseInstructorId === options.currentUserId || options.currentUserRole === 'ADMIN');

    if (!lesson.isPublished && !isOwnerOrAdmin) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    const content = await this.contentCacheService.getContent(lessonId);
    if (!content) {
      throw new NotFoundException('Хичээлийн контент олдсонгүй');
    }

    this.logger.debug(`Контент авлаа: lessonId=${lessonId}`);
    return content;
  }
}
