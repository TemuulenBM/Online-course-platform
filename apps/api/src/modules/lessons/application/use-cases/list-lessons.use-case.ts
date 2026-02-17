import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';

/**
 * Сургалтын хичээлүүдийн жагсаалт авах use case.
 * Public: зөвхөн нийтлэгдсэн хичээлүүд (кэшээс).
 * Owner/Admin: бүх хичээлүүд (DB-ээс шууд).
 */
@Injectable()
export class ListLessonsUseCase {
  private readonly logger = new Logger(ListLessonsUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly lessonCacheService: LessonCacheService,
  ) {}

  async execute(
    courseId: string,
    options: {
      currentUserId?: string;
      currentUserRole?: string;
      publishedOnly?: boolean;
    } = {},
  ) {
    /** Сургалт байгаа эсэх шалгах */
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** Эзэмшигч эсвэл админ эсэх тодорхойлох */
    const isOwnerOrAdmin =
      options.currentUserId &&
      (course.instructorId === options.currentUserId || options.currentUserRole === 'ADMIN');

    /** Public хандалтад сургалт PUBLISHED байх ёстой */
    if (!isOwnerOrAdmin && course.status !== 'published') {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** publishedOnly тодорхойлох */
    const publishedOnly =
      options.publishedOnly !== undefined ? options.publishedOnly : !isOwnerOrAdmin;

    /** Хичээлүүд авах */
    let lessons;
    if (publishedOnly) {
      /** Нийтлэгдсэн хичээлүүд — кэшээс */
      lessons = await this.lessonCacheService.getPublishedLessonsByCourse(courseId);
    } else {
      /** Бүх хичээлүүд — DB-ээс шууд */
      lessons = await this.lessonRepository.findByCourseId(courseId, false);
    }

    return lessons.map((lesson) => lesson.toResponse());
  }
}
