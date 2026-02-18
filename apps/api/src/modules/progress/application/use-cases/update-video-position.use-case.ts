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
import { UpdateVideoPositionDto } from '../../dto/update-video-position.dto';

/**
 * Видеоны байрлал шинэчлэх use case.
 * Зөвхөн VIDEO төрлийн хичээлд ажиллана. Ахицын хувийг автоматаар тооцоолно.
 */
@Injectable()
export class UpdateVideoPositionUseCase {
  private readonly logger = new Logger(UpdateVideoPositionUseCase.name);

  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly progressCacheService: ProgressCacheService,
    private readonly lessonRepository: LessonRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(
    userId: string,
    lessonId: string,
    dto: UpdateVideoPositionDto,
  ): Promise<UserProgressEntity> {
    /** 1. Хичээл олдох + VIDEO төрөл шалгах */
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Хичээл олдсонгүй');
    }

    if (lesson.lessonType !== 'video') {
      throw new BadRequestException(
        'Видеоны байрлал зөвхөн VIDEO төрлийн хичээлд ажиллана',
      );
    }

    if (!lesson.isPublished) {
      throw new BadRequestException(
        'Нийтлэгдээгүй хичээлд ахиц бүртгэх боломжгүй',
      );
    }

    /** 2. Элсэлт ACTIVE эсэх шалгах */
    const enrollment =
      await this.enrollmentRepository.findByUserAndCourse(
        userId,
        lesson.courseId,
      );
    if (!enrollment || enrollment.status !== 'active') {
      throw new ForbiddenException(
        'Энэ сургалтад элсээгүй эсвэл элсэлт идэвхгүй байна',
      );
    }

    /** 3. Ахицын хувийг автоматаар тооцоолох */
    const durationSeconds = lesson.durationMinutes * 60;
    const progressPercentage =
      durationSeconds > 0
        ? Math.min(
            100,
            Math.round(
              (dto.lastPositionSeconds / durationSeconds) * 100,
            ),
          )
        : 0;

    /** 4. timeSpentSeconds нэмэгдүүлэх */
    const existing = await this.progressRepository.findByUserAndLesson(
      userId,
      lessonId,
    );
    const newTimeSpent =
      (existing?.timeSpentSeconds ?? 0) + (dto.timeSpentSeconds ?? 0);

    /** 5. Ахиц upsert */
    const progress = await this.progressRepository.upsert({
      userId,
      lessonId,
      lastPositionSeconds: dto.lastPositionSeconds,
      progressPercentage,
      timeSpentSeconds: newTimeSpent,
    });

    /** 6. Кэш invalidate */
    await this.progressCacheService.invalidateAll(
      userId,
      lessonId,
      lesson.courseId,
    );

    this.logger.log(
      `Видео байрлал шинэчлэгдлээ: хэрэглэгч ${userId}, хичээл ${lessonId}, байрлал ${dto.lastPositionSeconds}с`,
    );
    return progress;
  }
}
