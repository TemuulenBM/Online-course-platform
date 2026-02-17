import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SetContentUseCase } from '../../application/use-cases/set-content.use-case';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { ContentEntity } from '../../domain/entities/content.entity';
import { TextContentVO } from '../../domain/value-objects/text-content.vo';
import { VideoContentVO } from '../../domain/value-objects/video-content.vo';

describe('SetContentUseCase', () => {
  let useCase: SetContentUseCase;
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
      html: '<p>Test</p>',
      markdown: '# Test',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetContentUseCase,
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
            create: jest.fn(),
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

    useCase = module.get<SetContentUseCase>(SetContentUseCase);
    lessonRepository = module.get(LessonRepository);
    contentRepository = module.get(ContentRepository);
    contentCacheService = module.get(ContentCacheService);
  });

  it('текст контент амжилттай тавих', async () => {
    lessonRepository.findById.mockResolvedValue(mockTextLesson);
    contentRepository.findByLessonId.mockResolvedValue(null);
    contentRepository.create.mockResolvedValue(mockTextContent);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const dto = {
      lessonId: 'lesson-id-1',
      html: '<p>Test</p>',
      markdown: '# Test',
      readingTimeMinutes: 5,
    };

    const result = await useCase.executeText('user-id-1', 'TEACHER', dto);

    expect(result).toEqual(mockTextContent);
    expect(lessonRepository.findById).toHaveBeenCalledWith('lesson-id-1');
    expect(contentRepository.findByLessonId).toHaveBeenCalledWith('lesson-id-1');
    expect(contentRepository.create).toHaveBeenCalledWith({
      lessonId: 'lesson-id-1',
      contentType: 'text',
      textContent: {
        html: '<p>Test</p>',
        markdown: '# Test',
        readingTimeMinutes: 5,
      },
    });
    expect(contentCacheService.invalidateContent).toHaveBeenCalledWith('lesson-id-1');
  });

  it('видео контент амжилттай тавих', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson);
    contentRepository.findByLessonId.mockResolvedValue(null);
    contentRepository.create.mockResolvedValue(mockVideoContent);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const dto = {
      lessonId: 'lesson-id-2',
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      durationSeconds: 1200,
    };

    const result = await useCase.executeVideo('user-id-1', 'TEACHER', dto);

    expect(result).toEqual(mockVideoContent);
    expect(lessonRepository.findById).toHaveBeenCalledWith('lesson-id-2');
    expect(contentRepository.create).toHaveBeenCalledWith({
      lessonId: 'lesson-id-2',
      contentType: 'video',
      videoContent: {
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        durationSeconds: 1200,
      },
    });
  });

  it('хичээл олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    const dto = {
      lessonId: 'nonexistent-id',
      html: '<p>Test</p>',
    };

    await expect(useCase.executeText('user-id-1', 'TEACHER', dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(contentRepository.create).not.toHaveBeenCalled();
  });

  it('эрх хүрэхгүй үед ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockTextLesson);

    const dto = {
      lessonId: 'lesson-id-1',
      html: '<p>Test</p>',
    };

    await expect(useCase.executeText('other-user-id', 'TEACHER', dto)).rejects.toThrow(
      ForbiddenException,
    );
    expect(contentRepository.create).not.toHaveBeenCalled();
  });

  it('хичээлийн төрөл таарахгүй үед BadRequestException (video хичээлд text контент)', async () => {
    /** video төрлийн хичээлд text контент тавихыг оролдоно */
    lessonRepository.findById.mockResolvedValue(mockVideoLesson);

    const dto = {
      lessonId: 'lesson-id-2',
      html: '<p>Test</p>',
    };

    await expect(useCase.executeText('user-id-1', 'TEACHER', dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(contentRepository.create).not.toHaveBeenCalled();
  });

  it('хуучин контент байвал шинэчлэх (upsert)', async () => {
    lessonRepository.findById.mockResolvedValue(mockTextLesson);
    /** Хуучин контент байгаа */
    contentRepository.findByLessonId.mockResolvedValue(mockTextContent);
    contentRepository.updateByLessonId.mockResolvedValue(mockTextContent);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const dto = {
      lessonId: 'lesson-id-1',
      html: '<p>Updated</p>',
      markdown: '# Updated',
      readingTimeMinutes: 10,
    };

    const result = await useCase.executeText('user-id-1', 'TEACHER', dto);

    expect(result).toEqual(mockTextContent);
    /** create биш updateByLessonId дуудагдсан */
    expect(contentRepository.create).not.toHaveBeenCalled();
    expect(contentRepository.updateByLessonId).toHaveBeenCalledWith('lesson-id-1', {
      contentType: 'text',
      textContent: {
        html: '<p>Updated</p>',
        markdown: '# Updated',
        readingTimeMinutes: 10,
      },
    });
  });

  it('кэш invalidate дуудагдсан эсэх', async () => {
    lessonRepository.findById.mockResolvedValue(mockTextLesson);
    contentRepository.findByLessonId.mockResolvedValue(null);
    contentRepository.create.mockResolvedValue(mockTextContent);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const dto = {
      lessonId: 'lesson-id-1',
      html: '<p>Test</p>',
    };

    await useCase.executeText('user-id-1', 'TEACHER', dto);

    /** Контент тавигдсаны дараа кэш invalidate хийгдсэн */
    expect(contentCacheService.invalidateContent).toHaveBeenCalledWith('lesson-id-1');
    expect(contentCacheService.invalidateContent).toHaveBeenCalledTimes(1);
  });
});
