import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

/**
 * Хичээлийн ахиц авах use case.
 * Кэшнээс эхлээд DB-ээс хайна, олдоогүй бол default утга буцаана.
 */
@Injectable()
export class GetLessonProgressUseCase {
  constructor(
    private readonly progressCacheService: ProgressCacheService,
    private readonly lessonRepository: LessonRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
  ): Promise<ReturnType<UserProgressEntity['toResponse']>> {
    /** 1. Хичээл олдох эсэх шалгах */
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** 2. Элсэлт ACTIVE эсэх шалгах */
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, lesson.courseId);
    if (!enrollment || enrollment.status !== 'active') {
      throw new ForbiddenException('Энэ сургалтад элсээгүй эсвэл элсэлт идэвхгүй байна');
    }

    /** 3. Кэшнээс авах, байхгүй бол DB-ээс */
    const progress = await this.progressCacheService.getLessonProgress(userId, lessonId);

    /** 4. Олдоогүй бол default утга буцаана */
    if (!progress) {
      return {
        id: '',
        userId,
        lessonId,
        progressPercentage: 0,
        completed: false,
        timeSpentSeconds: 0,
        lastPositionSeconds: 0,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonTitle: lesson.title,
        lessonType: lesson.lessonType,
        courseId: lesson.courseId,
        lessonOrderIndex: lesson.orderIndex,
      };
    }

    return progress.toResponse();
  }
}
