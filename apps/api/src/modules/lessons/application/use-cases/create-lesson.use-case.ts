import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';
import { CreateLessonDto } from '../../dto/create-lesson.dto';

/**
 * Хичээл үүсгэх use case.
 * Сургалт шалгах, orderIndex авах, шинэ хичээл үүсгэнэ.
 */
@Injectable()
export class CreateLessonUseCase {
  private readonly logger = new Logger(CreateLessonUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly lessonCacheService: LessonCacheService,
  ) {}

  async execute(
    currentUserId: string,
    currentUserRole: string,
    dto: CreateLessonDto,
  ): Promise<LessonEntity> {
    /** Сургалт байгаа эсэх шалгах */
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** Эрхийн шалгалт: сургалтын эзэмшигч эсвэл админ */
    if (
      course.instructorId !== currentUserId &&
      currentUserRole !== 'ADMIN'
    ) {
      throw new ForbiddenException('Энэ сургалтад хичээл нэмэх эрхгүй');
    }

    /** Дараагийн orderIndex авах */
    const orderIndex = await this.lessonRepository.getNextOrderIndex(
      dto.courseId,
    );

    /** Хичээл үүсгэх */
    const lesson = await this.lessonRepository.create({
      courseId: dto.courseId,
      title: dto.title,
      orderIndex,
      lessonType: dto.lessonType,
      durationMinutes: dto.durationMinutes,
      isPreview: dto.isPreview,
      isPublished: dto.isPublished,
    });

    /** Кэш invalidate */
    await this.lessonCacheService.invalidateCourseLessons(dto.courseId);

    this.logger.log(
      `Хичээл үүсгэгдлээ: ${lesson.id} (${lesson.title}) — сургалт: ${dto.courseId}`,
    );
    return lesson;
  }
}
