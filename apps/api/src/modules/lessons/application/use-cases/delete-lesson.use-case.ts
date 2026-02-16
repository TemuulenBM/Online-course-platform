import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';

/**
 * Хичээл устгах use case.
 * Сургалтын эзэмшигч эсвэл админ устгаж чадна.
 */
@Injectable()
export class DeleteLessonUseCase {
  private readonly logger = new Logger(DeleteLessonUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly lessonCacheService: LessonCacheService,
  ) {}

  async execute(
    lessonId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<void> {
    /** Хичээл олох */
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** Эрхийн шалгалт */
    if (
      lesson.courseInstructorId !== currentUserId &&
      currentUserRole !== 'ADMIN'
    ) {
      throw new ForbiddenException('Энэ хичээлийг устгах эрхгүй');
    }

    /** Устгах */
    await this.lessonRepository.delete(lessonId);

    /** Кэш invalidate */
    await this.lessonCacheService.invalidateAll(lessonId, lesson.courseId);

    this.logger.log(
      `Хичээл устгагдлаа: ${lessonId} (${lesson.title}) — сургалт: ${lesson.courseId}`,
    );
  }
}
