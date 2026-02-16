import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';

// Controller
import { LessonsController } from './interface/controllers/lessons.controller';

// Use Cases
import { CreateLessonUseCase } from './application/use-cases/create-lesson.use-case';
import { GetLessonUseCase } from './application/use-cases/get-lesson.use-case';
import { ListLessonsUseCase } from './application/use-cases/list-lessons.use-case';
import { UpdateLessonUseCase } from './application/use-cases/update-lesson.use-case';
import { TogglePublishLessonUseCase } from './application/use-cases/toggle-publish-lesson.use-case';
import { ReorderLessonsUseCase } from './application/use-cases/reorder-lessons.use-case';
import { DeleteLessonUseCase } from './application/use-cases/delete-lesson.use-case';

// Infrastructure
import { LessonRepository } from './infrastructure/repositories/lesson.repository';
import { LessonCacheService } from './infrastructure/services/lesson-cache.service';

/**
 * Lessons модуль.
 * Хичээлийн CRUD, нийтлэлт toggle, дараалал өөрчлөх,
 * кэшлэлт зэрэг бүх хичээлийн функцийг удирдана.
 */
@Module({
  imports: [CoursesModule],
  controllers: [LessonsController],
  providers: [
    // Use Cases
    CreateLessonUseCase,
    GetLessonUseCase,
    ListLessonsUseCase,
    UpdateLessonUseCase,
    TogglePublishLessonUseCase,
    ReorderLessonsUseCase,
    DeleteLessonUseCase,
    // Infrastructure
    LessonRepository,
    LessonCacheService,
  ],
  exports: [LessonRepository],
})
export class LessonsModule {}
