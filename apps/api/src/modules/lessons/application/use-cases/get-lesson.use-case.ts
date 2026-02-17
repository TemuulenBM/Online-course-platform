import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';

/**
 * Хичээл авах use case (ID-аар).
 * Public endpoint-д зөвхөн нийтлэгдсэн хичээлийг буцаана.
 */
@Injectable()
export class GetLessonUseCase {
  private readonly logger = new Logger(GetLessonUseCase.name);

  constructor(private readonly lessonCacheService: LessonCacheService) {}

  async execute(lessonId: string, publishedOnly: boolean = true): Promise<LessonEntity> {
    const lesson = await this.lessonCacheService.getLesson(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** Public хандалтад зөвхөн нийтлэгдсэн */
    if (publishedOnly && !lesson.isPublished) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    return lesson;
  }
}
