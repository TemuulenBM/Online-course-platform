import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ProgressRepository } from '../../infrastructure/repositories/progress.repository';
import { ProgressCacheService } from '../../infrastructure/services/progress-cache.service';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';
import { UpdateProgressDto } from '../../dto/update-progress.dto';

/**
 * Хичээлийн ахиц шинэчлэх use case.
 * Элсэлт, хичээлийн байдлыг шалгаж ахицыг upsert хийнэ.
 */
@Injectable()
export class UpdateLessonProgressUseCase {
  private readonly logger = new Logger(UpdateLessonProgressUseCase.name);

  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly progressCacheService: ProgressCacheService,
    private readonly lessonRepository: LessonRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
    dto: UpdateProgressDto,
  ): Promise<UserProgressEntity> {
    /** 1. Хичээл олдох эсэх шалгах */
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    /** 2. Хичээл нийтлэгдсэн эсэх шалгах */
    if (!lesson.isPublished) {
      throw new BadRequestException('Нийтлэгдээгүй хичээлд ахиц бүртгэх боломжгүй');
    }

    /** 3. Элсэлт ACTIVE эсэх шалгах */
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, lesson.courseId);
    if (!enrollment || enrollment.status !== 'active') {
      throw new ForbiddenException('Энэ сургалтад элсээгүй эсвэл элсэлт идэвхгүй байна');
    }

    /** 4. Одоо байгаа ахиц авч timeSpentSeconds нэмэгдүүлэх */
    const existing = await this.progressRepository.findByUserAndLesson(userId, lessonId);
    const newTimeSpent = (existing?.timeSpentSeconds ?? 0) + (dto.timeSpentSeconds ?? 0);

    /** 5. Ахиц upsert хийх */
    const progress = await this.progressRepository.upsert({
      userId,
      lessonId,
      progressPercentage: dto.progressPercentage,
      timeSpentSeconds: newTimeSpent,
      lastPositionSeconds: dto.lastPositionSeconds,
    });

    /** 6. Кэш invalidate */
    await this.progressCacheService.invalidateAll(userId, lessonId, lesson.courseId);

    this.logger.log(`Ахиц шинэчлэгдлээ: хэрэглэгч ${userId}, хичээл ${lessonId}`);
    return progress;
  }
}
