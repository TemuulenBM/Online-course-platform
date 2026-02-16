import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { ReorderLessonsDto } from '../../dto/reorder-lessons.dto';

/**
 * Хичээлүүдийн дарааллыг өөрчлөх use case.
 * Transaction-д олон хичээлийн orderIndex-г шинэчилнэ.
 */
@Injectable()
export class ReorderLessonsUseCase {
  private readonly logger = new Logger(ReorderLessonsUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly lessonCacheService: LessonCacheService,
  ) {}

  async execute(
    currentUserId: string,
    currentUserRole: string,
    dto: ReorderLessonsDto,
  ): Promise<void> {
    /** Сургалт байгаа эсэх шалгах */
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** Эрхийн шалгалт */
    if (
      course.instructorId !== currentUserId &&
      currentUserRole !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Энэ сургалтын хичээлүүдийн дарааллыг өөрчлөх эрхгүй',
      );
    }

    /** Бүх хичээлүүд энэ сургалтад хамаарах эсэх шалгах */
    const courseLessonIds = await this.lessonRepository.findIdsByCourseId(
      dto.courseId,
    );
    const courseLessonIdSet = new Set(courseLessonIds);

    for (const item of dto.items) {
      if (!courseLessonIdSet.has(item.lessonId)) {
        throw new BadRequestException(
          `Хичээл (${item.lessonId}) энэ сургалтад хамаарахгүй`,
        );
      }
    }

    /** Transaction-д reorder хийх */
    await this.lessonRepository.reorder(
      dto.items.map((item) => ({
        id: item.lessonId,
        orderIndex: item.orderIndex,
      })),
    );

    /** Кэш invalidate */
    await this.lessonCacheService.invalidateCourseLessons(dto.courseId);
    /** Дан хичээлийн кэшүүд ч invalidate хийх (orderIndex өөрчлөгдсөн) */
    await Promise.all(
      dto.items.map((item) =>
        this.lessonCacheService.invalidateLesson(item.lessonId),
      ),
    );

    this.logger.log(
      `Хичээлүүдийн дараалал өөрчлөгдлөө: сургалт ${dto.courseId}, ${dto.items.length} хичээл`,
    );
  }
}
