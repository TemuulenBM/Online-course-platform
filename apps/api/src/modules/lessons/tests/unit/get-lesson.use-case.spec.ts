import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetLessonUseCase } from '../../application/use-cases/get-lesson.use-case';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';

describe('GetLessonUseCase', () => {
  let useCase: GetLessonUseCase;
  let lessonCacheService: jest.Mocked<LessonCacheService>;

  /** Тестэд ашиглах mock хичээл */
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
        GetLessonUseCase,
        {
          provide: LessonCacheService,
          useValue: {
            getLesson: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetLessonUseCase>(GetLessonUseCase);
    lessonCacheService = module.get(LessonCacheService);
  });

  it('хичээл амжилттай авах', async () => {
    lessonCacheService.getLesson.mockResolvedValue(mockLesson);

    const result = await useCase.execute('lesson-id-1');

    expect(result).toEqual(mockLesson);
    expect(lessonCacheService.getLesson).toHaveBeenCalledWith('lesson-id-1');
  });

  it('хичээл олдоогүй үед NotFoundException', async () => {
    lessonCacheService.getLesson.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('нийтлэгдээгүй хичээл publishedOnly=true үед NotFoundException', async () => {
    const unpublishedLesson = new LessonEntity({
      ...mockLesson,
      isPublished: false,
    });
    lessonCacheService.getLesson.mockResolvedValue(unpublishedLesson);

    await expect(useCase.execute('lesson-id-1', true)).rejects.toThrow(NotFoundException);
  });

  it('нийтлэгдээгүй хичээл publishedOnly=false үед амжилттай буцаах', async () => {
    const unpublishedLesson = new LessonEntity({
      ...mockLesson,
      isPublished: false,
    });
    lessonCacheService.getLesson.mockResolvedValue(unpublishedLesson);

    const result = await useCase.execute('lesson-id-1', false);

    expect(result).toEqual(unpublishedLesson);
    expect(result.isPublished).toBe(false);
  });
});
