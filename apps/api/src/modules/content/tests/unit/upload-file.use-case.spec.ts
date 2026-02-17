import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UploadFileUseCase } from '../../application/use-cases/upload-file.use-case';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentRepository } from '../../infrastructure/repositories/content.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { STORAGE_SERVICE } from '../../infrastructure/services/storage/storage.interface';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { ContentEntity } from '../../domain/entities/content.entity';
import { VideoContentVO } from '../../domain/value-objects/video-content.vo';
import { AttachmentVO } from '../../domain/value-objects/attachment.vo';

describe('UploadFileUseCase', () => {
  let useCase: UploadFileUseCase;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let contentRepository: jest.Mocked<ContentRepository>;
  let contentCacheService: jest.Mocked<ContentCacheService>;
  let storageService: jest.Mocked<{ upload: jest.Mock; delete: jest.Mock }>;

  /** Тестэд ашиглах mock видео хичээл */
  const mockVideoLesson = new LessonEntity({
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'Видео хичээл',
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

  /** Тестэд ашиглах mock видео контент */
  const mockVideoContent = new ContentEntity({
    id: 'content-id-1',
    lessonId: 'lesson-id-1',
    contentType: 'video',
    videoContent: new VideoContentVO({
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      durationSeconds: 1200,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Хавсралт нэмсэн контент */
  const mockContentWithAttachment = new ContentEntity({
    id: 'content-id-1',
    lessonId: 'lesson-id-1',
    contentType: 'video',
    videoContent: new VideoContentVO({
      videoUrl: 'https://example.com/video.mp4',
    }),
    attachments: [
      new AttachmentVO({
        filename: 'test-doc.pdf',
        url: 'https://storage.example.com/content/lesson-id-1/attachment/test-doc.pdf',
        sizeBytes: 2048,
        mimeType: 'application/pdf',
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Хадмал нэмсэн контент */
  const mockContentWithSubtitle = new ContentEntity({
    id: 'content-id-1',
    lessonId: 'lesson-id-1',
    contentType: 'video',
    videoContent: new VideoContentVO({
      videoUrl: 'https://example.com/video.mp4',
      subtitles: [
        { language: 'mn', url: 'https://storage.example.com/content/lesson-id-1/subtitle/lesson-mn.vtt' },
      ],
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Тестэд ашиглах mock видео файл */
  const mockVideoFile = {
    originalname: 'test-video.mp4',
    mimetype: 'video/mp4',
    size: 1024000,
    buffer: Buffer.from('test'),
    path: '/tmp/test-video.mp4',
  } as Express.Multer.File;

  /** Тестэд ашиглах mock thumbnail файл */
  const mockThumbnailFile = {
    originalname: 'thumb.jpg',
    mimetype: 'image/jpeg',
    size: 51200,
    buffer: Buffer.from('test'),
    path: '/tmp/thumb.jpg',
  } as Express.Multer.File;

  /** Тестэд ашиглах mock attachment файл */
  const mockAttachmentFile = {
    originalname: 'test-doc.pdf',
    mimetype: 'application/pdf',
    size: 2048,
    buffer: Buffer.from('test'),
    path: '/tmp/test-doc.pdf',
  } as Express.Multer.File;

  /** Тестэд ашиглах mock subtitle файл */
  const mockSubtitleFile = {
    originalname: 'lesson-mn.vtt',
    mimetype: 'text/vtt',
    size: 1024,
    buffer: Buffer.from('test'),
    path: '/tmp/lesson-mn.vtt',
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadFileUseCase,
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
            addAttachment: jest.fn(),
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

    useCase = module.get<UploadFileUseCase>(UploadFileUseCase);
    lessonRepository = module.get(LessonRepository);
    contentRepository = module.get(ContentRepository);
    contentCacheService = module.get(ContentCacheService);
    storageService = module.get(STORAGE_SERVICE);
  });

  it('видео файл амжилттай upload', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson);
    storageService.upload.mockResolvedValue({
      url: 'https://storage.example.com/content/lesson-id-1/video/test-video.mp4',
      sizeBytes: 1024000,
    });
    contentRepository.findByLessonId.mockResolvedValue(mockVideoContent);
    contentRepository.updateByLessonId.mockResolvedValue(mockVideoContent);
    /** findByLessonId дахин дуудагдахад шинэчлэгдсэн контент буцаана */
    contentRepository.findByLessonId
      .mockResolvedValueOnce(mockVideoContent)
      .mockResolvedValueOnce(mockVideoContent);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const result = await useCase.execute(
      'lesson-id-1',
      'user-id-1',
      'TEACHER',
      mockVideoFile,
      'video',
    );

    expect(result).toBeDefined();
    expect(storageService.upload).toHaveBeenCalledWith(
      mockVideoFile,
      expect.stringContaining('content/lesson-id-1/video/'),
    );
    expect(contentRepository.updateByLessonId).toHaveBeenCalledWith(
      'lesson-id-1',
      expect.objectContaining({
        videoContent: expect.objectContaining({
          videoUrl: 'https://storage.example.com/content/lesson-id-1/video/test-video.mp4',
        }),
      }),
    );
  });

  it('thumbnail файл амжилттай upload', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson);
    storageService.upload.mockResolvedValue({
      url: 'https://storage.example.com/content/lesson-id-1/thumbnail/thumb.jpg',
      sizeBytes: 51200,
    });
    contentRepository.findByLessonId
      .mockResolvedValueOnce(mockVideoContent)
      .mockResolvedValueOnce(mockVideoContent);
    contentRepository.updateByLessonId.mockResolvedValue(mockVideoContent);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const result = await useCase.execute(
      'lesson-id-1',
      'user-id-1',
      'TEACHER',
      mockThumbnailFile,
      'thumbnail',
    );

    expect(result).toBeDefined();
    expect(storageService.upload).toHaveBeenCalledWith(
      mockThumbnailFile,
      expect.stringContaining('content/lesson-id-1/thumbnail/'),
    );
    expect(contentRepository.updateByLessonId).toHaveBeenCalledWith(
      'lesson-id-1',
      expect.objectContaining({
        videoContent: expect.objectContaining({
          thumbnailUrl: 'https://storage.example.com/content/lesson-id-1/thumbnail/thumb.jpg',
        }),
      }),
    );
  });

  it('attachment файл амжилттай нэмэх', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson);
    storageService.upload.mockResolvedValue({
      url: 'https://storage.example.com/content/lesson-id-1/attachment/test-doc.pdf',
      sizeBytes: 2048,
    });
    contentRepository.findByLessonId
      .mockResolvedValueOnce(mockVideoContent)
      .mockResolvedValueOnce(mockContentWithAttachment);
    contentRepository.addAttachment.mockResolvedValue(mockContentWithAttachment);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const result = await useCase.execute(
      'lesson-id-1',
      'user-id-1',
      'TEACHER',
      mockAttachmentFile,
      'attachment',
    );

    expect(result).toBeDefined();
    expect(contentRepository.addAttachment).toHaveBeenCalledWith(
      'lesson-id-1',
      {
        filename: 'test-doc.pdf',
        url: 'https://storage.example.com/content/lesson-id-1/attachment/test-doc.pdf',
        sizeBytes: 2048,
        mimeType: 'application/pdf',
      },
    );
  });

  it('subtitle файл амжилттай нэмэх', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson);
    storageService.upload.mockResolvedValue({
      url: 'https://storage.example.com/content/lesson-id-1/subtitle/lesson-mn.vtt',
      sizeBytes: 1024,
    });
    contentRepository.findByLessonId
      .mockResolvedValueOnce(mockVideoContent)
      .mockResolvedValueOnce(mockContentWithSubtitle);
    contentRepository.updateByLessonId.mockResolvedValue(mockContentWithSubtitle);
    contentCacheService.invalidateContent.mockResolvedValue(undefined);

    const result = await useCase.execute(
      'lesson-id-1',
      'user-id-1',
      'TEACHER',
      mockSubtitleFile,
      'subtitle',
    );

    expect(result).toBeDefined();
    expect(contentRepository.updateByLessonId).toHaveBeenCalledWith(
      'lesson-id-1',
      expect.objectContaining({
        videoContent: expect.objectContaining({
          subtitles: expect.arrayContaining([
            expect.objectContaining({ language: 'mn' }),
          ]),
        }),
      }),
    );
  });

  it('хичээл олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(
        'nonexistent-id',
        'user-id-1',
        'TEACHER',
        mockVideoFile,
        'video',
      ),
    ).rejects.toThrow(NotFoundException);
    expect(storageService.upload).not.toHaveBeenCalled();
  });

  it('эрх хүрэхгүй үед ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockVideoLesson);

    await expect(
      useCase.execute(
        'lesson-id-1',
        'other-user-id',
        'TEACHER',
        mockVideoFile,
        'video',
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(storageService.upload).not.toHaveBeenCalled();
  });

  it('файл байхгүй үед BadRequestException', async () => {
    /** null файл дамжуулна */
    await expect(
      useCase.execute(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
        null as any,
        'video',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(lessonRepository.findById).not.toHaveBeenCalled();
  });
});
