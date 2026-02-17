import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetContentUseCase } from '../../application/use-cases/get-content.use-case';
import { LessonRepository } from '../../../lessons/infrastructure/repositories/lesson.repository';
import { ContentCacheService } from '../../infrastructure/services/content-cache.service';
import { LessonEntity } from '../../../lessons/domain/entities/lesson.entity';
import { ContentEntity } from '../../domain/entities/content.entity';
import { TextContentVO } from '../../domain/value-objects/text-content.vo';

describe('GetContentUseCase', () => {
  let useCase: GetContentUseCase;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let contentCacheService: jest.Mocked<ContentCacheService>;

  /** Тестэд ашиглах mock нийтлэгдсэн хичээл */
  const mockPublishedLesson = new LessonEntity({
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

  /** Тестэд ашиглах mock нийтлэгдээгүй хичээл */
  const mockUnpublishedLesson = new LessonEntity({
    id: 'lesson-id-2',
    courseId: 'course-id-1',
    title: 'Ноорог хичээл',
    orderIndex: 1,
    lessonType: 'text',
    durationMinutes: 0,
    isPreview: false,
    isPublished: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    courseTitle: 'Тест сургалт',
    courseInstructorId: 'user-id-1',
  });

  /** Тестэд ашиглах mock контент */
  const mockContent = new ContentEntity({
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

  /** Нийтлэгдээгүй хичээлийн mock контент */
  const mockUnpublishedContent = new ContentEntity({
    id: 'content-id-2',
    lessonId: 'lesson-id-2',
    contentType: 'text',
    textContent: new TextContentVO({
      html: '<p>Draft</p>',
      markdown: '# Draft',
      readingTimeMinutes: 3,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetContentUseCase,
        {
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ContentCacheService,
          useValue: {
            getContent: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetContentUseCase>(GetContentUseCase);
    lessonRepository = module.get(LessonRepository);
    contentCacheService = module.get(ContentCacheService);
  });

  it('контент амжилттай авах', async () => {
    lessonRepository.findById.mockResolvedValue(mockPublishedLesson);
    contentCacheService.getContent.mockResolvedValue(mockContent);

    const result = await useCase.execute('lesson-id-1');

    expect(result).toEqual(mockContent);
    expect(lessonRepository.findById).toHaveBeenCalledWith('lesson-id-1');
    expect(contentCacheService.getContent).toHaveBeenCalledWith('lesson-id-1');
  });

  it('хичээл олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(NotFoundException);
    /** Контент хайгаагүй байх ёстой */
    expect(contentCacheService.getContent).not.toHaveBeenCalled();
  });

  it('нийтлэгдээгүй хичээлийн контент (public хандалт) — NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(mockUnpublishedLesson);

    /** currentUserId, currentUserRole өгөөгүй — public хандалт */
    await expect(useCase.execute('lesson-id-2')).rejects.toThrow(NotFoundException);
    /** Контент хайгаагүй байх ёстой */
    expect(contentCacheService.getContent).not.toHaveBeenCalled();
  });

  it('нийтлэгдээгүй хичээлийн контент (owner хандалт) — амжилттай', async () => {
    lessonRepository.findById.mockResolvedValue(mockUnpublishedLesson);
    contentCacheService.getContent.mockResolvedValue(mockUnpublishedContent);

    /** Эзэмшигчийн хандалт — нийтлэгдээгүй ч авах боломжтой */
    const result = await useCase.execute('lesson-id-2', {
      currentUserId: 'user-id-1',
      currentUserRole: 'TEACHER',
    });

    expect(result).toEqual(mockUnpublishedContent);
    expect(contentCacheService.getContent).toHaveBeenCalledWith('lesson-id-2');
  });
});
