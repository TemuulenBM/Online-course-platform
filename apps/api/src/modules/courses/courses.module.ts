import { Module } from '@nestjs/common';

// Controllers
import { CoursesController } from './interface/controllers/courses.controller';
import { CategoriesController } from './interface/controllers/categories.controller';

// Use Cases — Courses
import { CreateCourseUseCase } from './application/use-cases/create-course.use-case';
import { GetCourseUseCase } from './application/use-cases/get-course.use-case';
import { GetCourseBySlugUseCase } from './application/use-cases/get-course-by-slug.use-case';
import { UpdateCourseUseCase } from './application/use-cases/update-course.use-case';
import { PublishCourseUseCase } from './application/use-cases/publish-course.use-case';
import { ArchiveCourseUseCase } from './application/use-cases/archive-course.use-case';
import { ListCoursesUseCase } from './application/use-cases/list-courses.use-case';
import { ListMyCoursesUseCase } from './application/use-cases/list-my-courses.use-case';
import { DeleteCourseUseCase } from './application/use-cases/delete-course.use-case';

// Use Cases — Categories
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { GetCategoryUseCase } from './application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';

// Infrastructure
import { CourseRepository } from './infrastructure/repositories/course.repository';
import { CategoryRepository } from './infrastructure/repositories/category.repository';
import { CourseCacheService } from './infrastructure/services/course-cache.service';

/**
 * Courses модуль.
 * Сургалтын CRUD, ангилал удирдлага, нийтлэх/архивлах,
 * кэшлэлт зэрэг бүх сургалтын функцийг удирдана.
 */
@Module({
  controllers: [CoursesController, CategoriesController],
  providers: [
    // Use Cases — Courses
    CreateCourseUseCase,
    GetCourseUseCase,
    GetCourseBySlugUseCase,
    UpdateCourseUseCase,
    PublishCourseUseCase,
    ArchiveCourseUseCase,
    ListCoursesUseCase,
    ListMyCoursesUseCase,
    DeleteCourseUseCase,
    // Use Cases — Categories
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    GetCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    // Infrastructure
    CourseRepository,
    CategoryRepository,
    CourseCacheService,
  ],
  exports: [CourseRepository, CategoryRepository],
})
export class CoursesModule {}
