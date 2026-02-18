import { Module } from '@nestjs/common';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LessonsModule } from '../lessons/lessons.module';

// Controller
import { ProgressController } from './interface/controllers/progress.controller';

// Use Cases
import { UpdateLessonProgressUseCase } from './application/use-cases/update-lesson-progress.use-case';
import { CompleteLessonUseCase } from './application/use-cases/complete-lesson.use-case';
import { GetLessonProgressUseCase } from './application/use-cases/get-lesson-progress.use-case';
import { GetCourseProgressUseCase } from './application/use-cases/get-course-progress.use-case';
import { ListMyProgressUseCase } from './application/use-cases/list-my-progress.use-case';
import { UpdateVideoPositionUseCase } from './application/use-cases/update-video-position.use-case';
import { DeleteProgressUseCase } from './application/use-cases/delete-progress.use-case';

// Infrastructure
import { ProgressRepository } from './infrastructure/repositories/progress.repository';
import { ProgressCacheService } from './infrastructure/services/progress-cache.service';

/**
 * Progress модуль.
 * Хэрэглэгчийн хичээлийн ахиц хянах, сургалтын нийт явцыг тооцоолох,
 * видео байрлал хадгалах, auto-complete enrollment зэрэг функцүүдийг удирдана.
 */
@Module({
  imports: [EnrollmentsModule, LessonsModule],
  controllers: [ProgressController],
  providers: [
    // Use Cases
    UpdateLessonProgressUseCase,
    CompleteLessonUseCase,
    GetLessonProgressUseCase,
    GetCourseProgressUseCase,
    ListMyProgressUseCase,
    UpdateVideoPositionUseCase,
    DeleteProgressUseCase,
    // Infrastructure
    ProgressRepository,
    ProgressCacheService,
  ],
  exports: [ProgressRepository, CompleteLessonUseCase],
})
export class ProgressModule {}
