import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteLessonUseCase } from '../../application/use-cases/delete-lesson.use-case';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';

describe('DeleteLessonUseCase', () => {
  let useCase: DeleteLessonUseCase;
  let lessonRepository: jest.Mocked<LessonRepository>;
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
        DeleteLessonUseCase,
        {
          provide: LessonRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
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

    useCase = module.get<DeleteLessonUseCase>(DeleteLessonUseCase);
    lessonRepository = module.get(LessonRepository);
    lessonCacheService = module.get(LessonCacheService);
  });

  it('хичээл амжилттай устгах', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    lessonRepository.delete.mockResolvedValue(undefined);
    lessonCacheService.invalidateAll.mockResolvedValue(undefined);

    await useCase.execute('lesson-id-1', 'user-id-1', 'TEACHER');

    expect(lessonRepository.findById).toHaveBeenCalledWith('lesson-id-1');
    expect(lessonRepository.delete).toHaveBeenCalledWith('lesson-id-1');
    expect(lessonCacheService.invalidateAll).toHaveBeenCalledWith(
      'lesson-id-1',
      'course-id-1',
    );
  });

  it('хичээл олдоогүй үед NotFoundException', async () => {
    lessonRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', 'user-id-1', 'TEACHER'),
    ).rejects.toThrow(NotFoundException);
    expect(lessonRepository.delete).not.toHaveBeenCalled();
  });

  it('эрх хүрэхгүй үед ForbiddenException', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);

    await expect(
      useCase.execute('lesson-id-1', 'other-user-id', 'TEACHER'),
    ).rejects.toThrow(ForbiddenException);
    expect(lessonRepository.delete).not.toHaveBeenCalled();
  });

  it('кэш invalidate хийгдэж байгааг шалгах', async () => {
    lessonRepository.findById.mockResolvedValue(mockLesson);
    lessonRepository.delete.mockResolvedValue(undefined);
    lessonCacheService.invalidateAll.mockResolvedValue(undefined);

    await useCase.execute('lesson-id-1', 'user-id-1', 'TEACHER');

    expect(lessonCacheService.invalidateAll).toHaveBeenCalledWith(
      'lesson-id-1',
      'course-id-1',
    );
    expect(lessonCacheService.invalidateAll).toHaveBeenCalledTimes(1);
  });
});
