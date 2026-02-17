import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';
import { UpdateLessonDto } from '../../dto/update-lesson.dto';

/**
 * Хичээл шинэчлэх use case.
 * Зөвхөн сургалтын эзэмшигч багш эсвэл админ шинэчилж чадна.
 */
@Injectable()
export class UpdateLessonUseCase {
  private readonly logger = new Logger(UpdateLessonUseCase.name);

  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly lessonCacheService: LessonCacheService,
  ) {}

  async execute(
    lessonId: string,
    currentUserId: string,
    currentUserRole: string,
    dto: UpdateLessonDto,
  ): Promise<LessonEntity> {
    /** Хичээл олох */
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** Эрхийн шалгалт: сургалтын эзэмшигч эсвэл админ */
    if (lesson.courseInstructorId !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Энэ хичээлийг засах эрхгүй');
    }

    /** Шинэчлэх */
    const updated = await this.lessonRepository.update(lessonId, dto);

    /** Кэш invalidate */
    await this.lessonCacheService.invalidateAll(lessonId, lesson.courseId);

    this.logger.log(`Хичээл шинэчлэгдлээ: ${lessonId}`);
    return updated;
  }
}
