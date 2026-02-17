import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsModule } from '../lessons/lessons.module';

// Schema
import {
  CourseContent,
  CourseContentSchema,
} from './infrastructure/schemas/course-content.schema';

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
import { LocalStorageService } from './infrastructure/services/storage/local-storage.service';
import { STORAGE_SERVICE } from './infrastructure/services/storage/storage.interface';

/**
 * Content модуль.
 * Хичээлийн контент (видео metadata, текст, хавсралт файлууд)
 * удирдах бүх функцийг хариуцна. MongoDB-г ашигладаг анхны модуль.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseContent.name, schema: CourseContentSchema },
    ]),
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
    // Storage — interface-based DI, ирээдүйд S3/R2 руу солих боломжтой
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
  ],
  exports: [ContentRepository],
})
export class ContentModule {}
