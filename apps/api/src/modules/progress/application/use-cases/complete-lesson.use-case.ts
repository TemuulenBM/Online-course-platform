import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';
import { RedisService } from '../../../../common/redis/redis.service';

/**
 * Хичээл дуусгах use case.
 * Хичээлийг completed болгож, бүх хичээл дуусвал enrollment-г автоматаар COMPLETED болгоно.
 */
@Injectable()
export class CompleteLessonUseCase {
  private readonly logger = new Logger(CompleteLessonUseCase.name);

  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly progressCacheService: ProgressCacheService,
    private readonly lessonRepository: LessonRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly redisService: RedisService,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
  ): Promise<{ progress: UserProgressEntity; courseCompleted: boolean }> {
    /** 1. Хичээл олдох эсэх шалгах */
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** 2. Хичээл нийтлэгдсэн эсэх шалгах */
    if (!lesson.isPublished) {
      throw new BadRequestException('Нийтлэгдээгүй хичээлийг дуусгах боломжгүй');
    }

    /** 3. Элсэлт ACTIVE эсэх шалгах */
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, lesson.courseId);
    if (!enrollment || enrollment.status !== 'active') {
      throw new ForbiddenException('Энэ сургалтад элсээгүй эсвэл элсэлт идэвхгүй байна');
    }

    /** 4. Аль хэдийн дуусгасан эсэх шалгах */
    const existing = await this.progressRepository.findByUserAndLesson(userId, lessonId);
    if (existing?.completed) {
      throw new ConflictException('Энэ хичээлийг аль хэдийн дуусгасан байна');
    }

    /** 5. Ахиц upsert — 100% completed */
    const progress = await this.progressRepository.upsert({
      userId,
      lessonId,
      progressPercentage: 100,
      completed: true,
      completedAt: new Date(),
    });

    /** 6. Кэш invalidate */
    await this.progressCacheService.invalidateAll(userId, lessonId, lesson.courseId);

    /** 7. Auto-complete enrollment шалгалт */
    let courseCompleted = false;
    const publishedLessons = await this.lessonRepository.findByCourseId(lesson.courseId, true);
    const completedCount = await this.progressRepository.countCompletedLessons(
      userId,
      lesson.courseId,
    );

    if (publishedLessons.length > 0 && completedCount >= publishedLessons.length) {
      await this.enrollmentRepository.update(enrollment.id, {
        status: 'completed',
        completedAt: new Date(),
      });
      /** Enrollment кэш invalidate */
      await Promise.all([
        this.redisService.del(`enrollment:${enrollment.id}`),
        this.redisService.del(`enrollment:check:${userId}:${lesson.courseId}`),
      ]);
      courseCompleted = true;
      this.logger.log(
        `Сургалт автоматаар дууслаа: хэрэглэгч ${userId}, сургалт ${lesson.courseId}`,
      );
    }

    this.logger.log(`Хичээл дууслаа: хэрэглэгч ${userId}, хичээл ${lessonId}`);
    return { progress, courseCompleted };
  }
}
