import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeleteContentUseCase } from '../../application/use-cases/delete-content.use-case';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { STORAGE_SERVICE } from '../../infrastructure/services/storage/storage.interface';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { ContentEntity } from '../../domain/entities/content.entity';
import { VideoContentVO } from '../../domain/value-objects/video-content.vo';
import { AttachmentVO } from '../../domain/value-objects/attachment.vo';

describe('DeleteContentUseCase', () => {
  let useCase: DeleteContentUseCase;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let contentRepository: jest.Mocked<ContentRepository>;
  let contentCacheService: jest.Mocked<ContentCacheService>;
  let storageService: jest.Mocked<{ upload: jest.Mock; delete: jest.Mock }>;

  /** Тестэд ашиглах mock хичээл */
  const mockLesson = new LessonEntity({
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'Тест хичээл',
    orderIndex: 0,
    lessonType: 'video',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    courseTitle: 'Тест сургалт',
    courseInstructorId: 'user-id-1',
  });

  /** Тестэд ашиглах mock видео контент (файлуудтай) */
  const mockContentWithFiles = new ContentEntity({
    id: 'content-id-1',
    lessonId: 'lesson-id-1',
    contentType: 'video',
    videoContent: new VideoContentVO({
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      durationSeconds: 1200,
      subtitles: [
        { language: 'mn', url: 'https://example.com/sub-mn.vtt' },
      ],
    }),
    attachments: [
      new AttachmentVO({
        filename: 'notes.pdf',
        url: 'https://example.com/notes.pdf',
        sizeBytes: 2048,
        mimeType: 'application/pdf',
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Файлгүй энгийн контент */
  const mockSimpleContent = new ContentEntity({
    id: 'content-id-2',
    lessonId: 'lesson-id-1',
    contentType: 'video',
    videoContent: new VideoContentVO({
      videoUrl: 'https://example.com/video.mp4',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteContentUseCase,
        {
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ContentRepository,
          useValue: {
            findByLessonId: jest.fn(),
            deleteByLessonId: jest.fn(),
          },
        },
        {
          provide: ContentCacheService,
          useValue: {
            invalidateContent: jest.fn(),
          },
        },
        {
          provide: STORAGE_SERVICE,
          useValue: {
            upload: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteContentUseCase>(DeleteContentUseCase);
    lessonRepository = module.get(LessonRepository);
    contentRepository = module.get(ContentRepository);
    contentCacheService = module.get(ContentCacheService);
    storageService = module.get(STORAGE_SERVICE);
  });

  it('контент амжилттай устгах', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    contentRepository.findByLessonId.mockResolvedValue(mockSimpleContent);
    storageService.delete.mockResolvedValue(undefined);
    contentRepository.deleteByLessonId.mockResolvedValue(undefined);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    await useCase.execute('lesson-id-1', 'user-id-1', 'TEACHER');

    expect(lessonRepository.findById).toHaveBeenCalledWith('lesson-id-1');
    expect(contentRepository.findByLessonId).toHaveBeenCalledWith('lesson-id-1');
    expect(contentRepository.deleteByLessonId).toHaveBeenCalledWith(
      'lesson-id-1',
    );
    expect(contentCacheService.invalidateContent).toHaveBeenCalledWith(
      'lesson-id-1',
    );
  });

  it('файл устгалт дуудагдсан (storageService.delete)', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    contentRepository.findByLessonId.mockResolvedValue(mockContentWithFiles);
    storageService.delete.mockResolvedValue(undefined);
    contentRepository.deleteByLessonId.mockResolvedValue(undefined);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    await useCase.execute('lesson-id-1', 'user-id-1', 'TEACHER');

    /** Видео файл устгагдсан */
    expect(storageService.delete).toHaveBeenCalledWith(
      'https://example.com/video.mp4',
    );
    /** Thumbnail устгагдсан */
    expect(storageService.delete).toHaveBeenCalledWith(
      'https://example.com/thumb.jpg',
    );
    /** Хадмал файл устгагдсан */
    expect(storageService.delete).toHaveBeenCalledWith(
      'https://example.com/sub-mn.vtt',
    );
    /** Хавсралт файл устгагдсан */
    expect(storageService.delete).toHaveBeenCalledWith(
      'https://example.com/notes.pdf',
    );
    /** Нийт 4 файл устгагдсан */
    expect(storageService.delete).toHaveBeenCalledTimes(4);
  });

  it('хичээл олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent-id', 'user-id-1', 'TEACHER'),
    ).rejects.toThrow(NotFoundException);
    expect(contentRepository.findByLessonId).not.toHaveBeenCalled();
  });

  it('контент олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    contentRepository.findByLessonId.mockResolvedValue(null);

    await expect(
      useCase.execute('lesson-id-1', 'user-id-1', 'TEACHER'),
    ).rejects.toThrow(NotFoundException);
    expect(contentRepository.deleteByLessonId).not.toHaveBeenCalled();
  });

  it('эрх хүрэхгүй үед ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);

    await expect(
      useCase.execute('lesson-id-1', 'other-user-id', 'TEACHER'),
    ).rejects.toThrow(ForbiddenException);
    expect(contentRepository.findByLessonId).not.toHaveBeenCalled();
  });
});
