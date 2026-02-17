import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';

/**
 * Хичээлийн нийтлэлтийг солих use case.
 * isPublished: true ↔ false toggle хийнэ.
 */
@Injectable()
export class TogglePublishLessonUseCase {
  private readonly logger = new Logger(TogglePublishLessonUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly lessonCacheService: LessonCacheService,
  ) {}

  async execute(
    lessonId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<LessonEntity> {
    /** Хичээл олох */
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** Эрхийн шалгалт */
    if (lesson.courseInstructorId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ хичээлийн нийтлэлтийг өөрчлөх эрхгүй');
    }

    /** Toggle: true → false, false → true */
    const updated = await this.lessonRepository.update(lessonId, {
      isPublished: !lesson.isPublished,
    });

    /** Кэш invalidate */
    await this.lessonCacheService.invalidateAll(lessonId, lesson.courseId);

    this.logger.log(`Хичээлийн нийтлэлт солигдлоо: ${lessonId} → ${!lesson.isPublished}`);
    return updated;
  }
}
