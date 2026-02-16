import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReorderLessonsUseCase } from '../../application/use-cases/reorder-lessons.use-case';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { ReorderLessonsDto } from '../../dto/reorder-lessons.dto';

describe('ReorderLessonsUseCase', () => {
  let useCase: ReorderLessonsUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;
  let lessonRepository: jest.Mocked<LessonRepository>;
  let lessonCacheService: jest.Mocked<LessonCacheService>;

  /** Тестэд ашиглах mock сургалт */
  const mockCourse = new CourseEntity({
    id: 'course-id-1',
    title: 'TypeScript Сургалт',
    slug: 'typescript-surgalt',
    description: 'TypeScript суралцах сургалт',
    instructorId: 'user-id-1',
    categoryId: 'cat-id-1',
    price: 29900,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Тестэд ашиглах reorder DTO */
  const reorderDto: ReorderLessonsDto = {
    courseId: 'course-id-1',
    items: [
      { lessonId: 'lesson-id-1', orderIndex: 1 },
      { lessonId: 'lesson-id-2', orderIndex: 0 },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReorderLessonsUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: LessonRepository,
          useValue: {
            findIdsByCourseId: jest.fn(),
            reorder: jest.fn(),
          },
        },
        {
          provide: LessonCacheService,
          useValue: {
            invalidateCourseLessons: jest.fn(),
            invalidateLesson: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ReorderLessonsUseCase>(ReorderLessonsUseCase);
    courseRepository = module.get(CourseRepository);
    lessonRepository = module.get(LessonRepository);
    lessonCacheService = module.get(LessonCacheService);
  });

  it('хичээлүүдийн дараалал амжилттай өөрчлөх', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    lessonRepository.findIdsByCourseId.mockResolvedValue([
      'lesson-id-1',
      'lesson-id-2',
    ]);
    lessonRepository.reorder.mockResolvedValue(undefined);
    lessonCacheService.invalidateCourseLessons.mockResolvedValue(undefined);
    lessonCacheService.invalidateLesson.mockResolvedValue(undefined);

    await useCase.execute('user-id-1', 'TEACHER', reorderDto);

    /** Reorder дуудагдсан байх ёстой */
    expect(lessonRepository.reorder).toHaveBeenCalledWith([
      { id: 'lesson-id-1', orderIndex: 1 },
      { id: 'lesson-id-2', orderIndex: 0 },
    ]);
  });

  it('сургалт олдоогүй үед NotFoundException', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id-1', 'TEACHER', reorderDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('эрх хүрэхгүй үед ForbiddenException', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);

    /** Өөр хэрэглэгч, STUDENT эрхтэй */
    await expect(
      useCase.execute('other-user-id', 'STUDENT', reorderDto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('бусад сургалтын хичээл оруулсан үед BadRequestException', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    /** Зөвхөн lesson-id-1 энэ сургалтад хамаарна, lesson-id-2 хамаарахгүй */
    lessonRepository.findIdsByCourseId.mockResolvedValue(['lesson-id-1']);

    await expect(
      useCase.execute('user-id-1', 'TEACHER', reorderDto),
    ).rejects.toThrow(BadRequestException);
  });

  it('кэш invalidate шалгалт — сургалтын болон дан хичээлийн кэшүүд устгагдах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    lessonRepository.findIdsByCourseId.mockResolvedValue([
      'lesson-id-1',
      'lesson-id-2',
    ]);
    lessonRepository.reorder.mockResolvedValue(undefined);
    lessonCacheService.invalidateCourseLessons.mockResolvedValue(undefined);
    lessonCacheService.invalidateLesson.mockResolvedValue(undefined);

    await useCase.execute('user-id-1', 'TEACHER', reorderDto);

    /** Сургалтын хичээлүүдийн кэш устгагдсан байх ёстой */
    expect(lessonCacheService.invalidateCourseLessons).toHaveBeenCalledWith(
      'course-id-1',
    );
    /** Дан хичээл бүрийн кэш устгагдсан байх ёстой */
    expect(lessonCacheService.invalidateLesson).toHaveBeenCalledWith(
      'lesson-id-1',
    );
    expect(lessonCacheService.invalidateLesson).toHaveBeenCalledWith(
      'lesson-id-2',
    );
    expect(lessonCacheService.invalidateLesson).toHaveBeenCalledTimes(2);
  });
});
