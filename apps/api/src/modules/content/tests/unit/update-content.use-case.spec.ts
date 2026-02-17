import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateContentUseCase } from '../../application/use-cases/update-content.use-case';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { ContentEntity } from '../../domain/entities/content.entity';
import { TextContentVO } from '../../domain/value-objects/text-content.vo';
import { VideoContentVO } from '../../domain/value-objects/video-content.vo';

describe('UpdateContentUseCase', () => {
  let useCase: UpdateContentUseCase;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let contentRepository: jest.Mocked<ContentRepository>;
  let contentCacheService: jest.Mocked<ContentCacheService>;

  /** Тестэд ашиглах mock текст хичээл */
  const mockTextLesson = new LessonEntity({
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'Тест хичээл',
    orderIndex: 0,
    lessonType: 'text',
    durationMinutes: 0,
    isPreview: false,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    courseTitle: 'Тест сургалт',
    courseInstructorId: 'user-id-1',
  });

  /** Тестэд ашиглах mock видео хичээл */
  const mockVideoLesson = new LessonEntity({
    id: 'lesson-id-2',
    courseId: 'course-id-1',
    title: 'Видео хичээл',
    orderIndex: 1,
    lessonType: 'video',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    courseTitle: 'Тест сургалт',
    courseInstructorId: 'user-id-1',
  });

  /** Тестэд ашиглах mock текст контент */
  const mockTextContent = new ContentEntity({
    id: 'content-id-1',
    lessonId: 'lesson-id-1',
    contentType: 'text',
    textContent: new TextContentVO({
      html: '<p>Original</p>',
      markdown: '# Original',
      readingTimeMinutes: 5,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Тестэд ашиглах mock видео контент */
  const mockVideoContent = new ContentEntity({
    id: 'content-id-2',
    lessonId: 'lesson-id-2',
    contentType: 'video',
    videoContent: new VideoContentVO({
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      durationSeconds: 1200,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Шинэчлэгдсэн текст контент */
  const updatedTextContent = new ContentEntity({
    id: 'content-id-1',
    lessonId: 'lesson-id-1',
    contentType: 'text',
    textContent: new TextContentVO({
      html: '<p>Updated</p>',
      markdown: '# Updated',
      readingTimeMinutes: 10,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Шинэчлэгдсэн видео контент */
  const updatedVideoContent = new ContentEntity({
    id: 'content-id-2',
    lessonId: 'lesson-id-2',
    contentType: 'video',
    videoContent: new VideoContentVO({
      videoUrl: 'https://example.com/video-updated.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      durationSeconds: 1500,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateContentUseCase,
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
            updateByLessonId: jest.fn(),
          },
        },
        {
          provide: ContentCacheService,
          useValue: {
            invalidateContent: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateContentUseCase>(UpdateContentUseCase);
    lessonRepository = module.get(LessonRepository);
    contentRepository = module.get(ContentRepository);
    contentCacheService = module.get(ContentCacheService);
  });

  it('текст контент амжилттай шинэчлэх', async () => {
    lessonRepository.findById.mockResolvedValue(mockTextLesson);
    contentRepository.findByLessonId.mockResolvedValue(mockTextContent);
    contentRepository.updateByLessonId.mockResolvedValue(updatedTextContent);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const dto = {
      html: '<p>Updated</p>',
      markdown: '# Updated',
      readingTimeMinutes: 10,
    };

    const result = await useCase.execute(
      'lesson-id-1',
      'user-id-1',
      'TEACHER',
      dto,
    );

    expect(result).toEqual(updatedTextContent);
    expect(lessonRepository.findById).toHaveBeenCalledWith('lesson-id-1');
    expect(contentRepository.findByLessonId).toHaveBeenCalledWith('lesson-id-1');
    expect(contentRepository.updateByLessonId).toHaveBeenCalledWith(
      'lesson-id-1',
      {
        textContent: {
          html: '<p>Updated</p>',
          markdown: '# Updated',
          readingTimeMinutes: 10,
        },
      },
    );
    expect(contentCacheService.invalidateContent).toHaveBeenCalledWith(
      'lesson-id-1',
    );
  });

  it('видео контент амжилттай шинэчлэх', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson);
    contentRepository.findByLessonId.mockResolvedValue(mockVideoContent);
    contentRepository.updateByLessonId.mockResolvedValue(updatedVideoContent);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const dto = {
      videoUrl: 'https://example.com/video-updated.mp4',
      durationSeconds: 1500,
    };

    const result = await useCase.execute(
      'lesson-id-2',
      'user-id-1',
      'TEACHER',
      dto,
    );

    expect(result).toEqual(updatedVideoContent);
    expect(contentRepository.updateByLessonId).toHaveBeenCalledWith(
      'lesson-id-2',
      {
        videoContent: {
          videoUrl: 'https://example.com/video-updated.mp4',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          durationSeconds: 1500,
          transcodedVersions: [],
          subtitles: [],
        },
      },
    );
  });

  it('хичээл олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    const dto = { html: '<p>Updated</p>' };

    await expect(
      useCase.execute('nonexistent-id', 'user-id-1', 'TEACHER', dto),
    ).rejects.toThrow(NotFoundException);
    expect(contentRepository.findByLessonId).not.toHaveBeenCalled();
  });

  it('контент олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(mockTextLesson);
    contentRepository.findByLessonId.mockResolvedValue(null);

    const dto = { html: '<p>Updated</p>' };

    await expect(
      useCase.execute('lesson-id-1', 'user-id-1', 'TEACHER', dto),
    ).rejects.toThrow(NotFoundException);
    expect(contentRepository.updateByLessonId).not.toHaveBeenCalled();
  });

  it('эрх хүрэхгүй үед ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockTextLesson);

    const dto = { html: '<p>Updated</p>' };

    await expect(
      useCase.execute('lesson-id-1', 'other-user-id', 'TEACHER', dto),
    ).rejects.toThrow(ForbiddenException);
    expect(contentRepository.findByLessonId).not.toHaveBeenCalled();
  });
});
