import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TogglePublishLessonUseCase } from '../../application/use-cases/toggle-publish-lesson.use-case';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';

describe('TogglePublishLessonUseCase', () => {
  let useCase: TogglePublishLessonUseCase;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let lessonCacheService: jest.Mocked<LessonCacheService>;

  /** Тестэд ашиглах mock хичээл (нийтлэгдсэн) */
  const mockLesson = new LessonEntity({
    id: 'lesson-id-1',
    courseId: 'course-id-1',
    title: 'React-ийн суурь ойлголтууд',
    orderIndex: 0,
    lessonType: 'video',
    durationMinutes: 30,
    isPreview: false,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    courseTitle: 'TypeScript Сургалт',
    courseInstructorId: 'user-id-1',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TogglePublishLessonUseCase,
        {
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: LessonCacheService,
          useValue: {
            invalidateAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<TogglePublishLessonUseCase>(
      TogglePublishLessonUseCase,
    );
    lessonRepository = module.get(LessonRepository);
    lessonCacheService = module.get(LessonCacheService);
  });

  it('нийтлэгдсэн хичээлийг нийтлэлтээс буцаах (true → false)', async () => {
    const unpublishedLesson = new LessonEntity({
      ...mockLesson,
      isPublished: false,
    });
    lessonRepository.findById.mockResolvedValue(mockLesson);
    lessonRepository.update.mockResolvedValue(unpublishedLesson);
    lessonCacheService.invalidateAll.mockResolvedValue(undefined);

    const result = await useCase.execute('lesson-id-1', 'user-id-1', 'TEACHER');

    expect(result.isPublished).toBe(false);
    expect(lessonRepository.update).toHaveBeenCalledWith('lesson-id-1', {
      isPublished: false,
    });
    expect(lessonCacheService.invalidateAll).toHaveBeenCalledWith(
      'lesson-id-1',
      'course-id-1',
    );
  });

  it('нийтлэгдээгүй хичээлийг нийтлэх (false → true)', async () => {
    const unpublishedLesson = new LessonEntity({
      ...mockLesson,
      isPublished: false,
    });
    const publishedLesson = new LessonEntity({
      ...mockLesson,
      isPublished: true,
    });
    lessonRepository.findById.mockResolvedValue(unpublishedLesson);
    lessonRepository.update.mockResolvedValue(publishedLesson);
    lessonCacheService.invalidateAll.mockResolvedValue(undefined);

    const result = await useCase.execute('lesson-id-1', 'user-id-1', 'TEACHER');

    expect(result.isPublished).toBe(true);
    expect(lessonRepository.update).toHaveBeenCalledWith('lesson-id-1', {
      isPublished: true,
    });
  });

  it('хичээл олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'user-id-1', 'TEACHER'),
    ).rejects.toThrow(NotFoundException);
    expect(lessonRepository.update).not.toHaveBeenCalled();
  });

  it('эрх хүрэхгүй үед ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);

    await expect(
      useCase.execute('lesson-id-1', 'other-user-id', 'TEACHER'),
    ).rejects.toThrow(ForbiddenException);
    expect(lessonRepository.update).not.toHaveBeenCalled();
  });
});
