import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';

/**
 * Сургалтын ахицын нэгтгэл авах use case.
 * Бүх published хичээлүүд болон тэдгээрийн ахицыг тооцоолж буцаана.
 */
@Injectable()
export class GetCourseProgressUseCase {
  constructor(
    private readonly progressCacheService: ProgressCacheService,
    private readonly lessonRepository: LessonRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(userId: string, courseId: string) {
    /** 1. Сургалтын хичээлүүд олдох эсэх шалгах */
    const publishedLessons = await this.lessonRepository.findByCourseId(courseId, true);
    if (publishedLessons.length === 0) {
      throw new NotFoundException('Сургалт олдсонгүй эсвэл нийтлэгдсэн хичээл алга');
    }

    /** 2. Элсэлт ACTIVE эсэх шалгах */
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (!enrollment || enrollment.status !== 'active') {
      throw new ForbiddenException('Энэ сургалтад элсээгүй эсвэл элсэлт идэвхгүй байна');
    }

    /** 3. Хэрэглэгчийн тухайн сургалтын ахицууд авах */
    const progressList = await this.progressCacheService.getCourseProgress(userId, courseId);
    const progressMap = new Map(progressList.map((p) => [p.lessonId, p]));

    /** 4. Тооцоолол хийх */
    let completedCount = 0;
    let totalTimeSpent = 0;

    const lessons = publishedLessons.map((lesson) => {
      const progress = progressMap.get(lesson.id);
      if (progress?.completed) completedCount++;
      totalTimeSpent += progress?.timeSpentSeconds ?? 0;

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonType: lesson.lessonType,
        orderIndex: lesson.orderIndex,
        progressPercentage: progress?.progressPercentage ?? 0,
        completed: progress?.completed ?? false,
        timeSpentSeconds: progress?.timeSpentSeconds ?? 0,
        lastPositionSeconds: progress?.lastPositionSeconds ?? 0,
        completedAt: progress?.completedAt ?? null,
      };
    });

    const totalLessons = publishedLessons.length;
    const courseProgressPercentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      courseId,
      totalLessons,
      completedLessons: completedCount,
      courseProgressPercentage,
      courseCompleted: completedCount === totalLessons,
      totalTimeSpentSeconds: totalTimeSpent,
      lessons,
    };
  }
}
