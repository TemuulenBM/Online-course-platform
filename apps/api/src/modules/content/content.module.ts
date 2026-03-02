import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsModule } from '../lessons/lessons.module';

// Schema
import { CourseContent, CourseContentSchema } from './infrastructure/schemas/course-content.schema';

// Controller
import { ContentController } from './interface/controllers/content.controller';

// Use Cases
import { SetContentUseCase } from './application/use-cases/set-content.use-case';
import { GetContentUseCase } from './application/use-cases/get-content.use-case';
import { UpdateContentUseCase } from './application/use-cases/update-content.use-case';
import { DeleteContentUseCase } from './application/use-cases/delete-content.use-case';
import { UploadFileUseCase } from './application/use-cases/upload-file.use-case';

// Infrastructure
import { ContentRepository } from './infrastructure/repositories/content.repository';
import { ContentCacheService } from './infrastructure/services/content-cache.service';

/**
 * Content модуль.
 * Хичээлийн контент (видео metadata, текст, хавсралт файлууд)
 * удирдах бүх функцийг хариуцна. MongoDB-г ашигладаг анхны модуль.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: CourseContent.name, schema: CourseContentSchema }]),
    LessonsModule,
  ],
  controllers: [ContentController],
  providers: [
    // Use Cases
    SetContentUseCase,
    GetContentUseCase,
    UpdateContentUseCase,
    DeleteContentUseCase,
    UploadFileUseCase,
    // Infrastructure
    ContentRepository,
    ContentCacheService,
    // STORAGE_SERVICE — StorageModule (@Global)-аас хангагдана, тусдаа provider шаардлагагүй
  ],
  exports: [ContentRepository],
})
export class ContentModule {}
