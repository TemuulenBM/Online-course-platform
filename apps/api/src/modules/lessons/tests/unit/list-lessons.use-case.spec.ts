import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListLessonsUseCase } from '../../application/use-cases/list-lessons.use-case';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';

describe('ListLessonsUseCase', () => {
  let useCase: ListLessonsUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListLessonsUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: LessonRepository,
          useValue: {
            findByCourseId: jest.fn(),
          },
        },
        {
          provide: LessonCacheService,
          useValue: {
            getPublishedLessonsByCourse: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListLessonsUseCase>(ListLessonsUseCase);
    courseRepository = module.get(CourseRepository);
    lessonRepository = module.get(LessonRepository);
    lessonCacheService = module.get(LessonCacheService);
  });

  it('нийтлэгдсэн хичээлүүдийн жагсаалт (public request) — кэшээс авах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    lessonCacheService.getPublishedLessonsByCourse.mockResolvedValue([mockLesson]);

    const result = await useCase.execute('course-id-1', {});

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockLesson.toResponse());
    /** Кэш сервис дуудагдсан байх ёстой */
    expect(lessonCacheService.getPublishedLessonsByCourse).toHaveBeenCalledWith('course-id-1');
    /** Repository шууд дуудагдаагүй байх ёстой */
    expect(lessonRepository.findByCourseId).not.toHaveBeenCalled();
  });

  it('бүх хичээлүүдийн жагсаалт (owner request) — DB-ээс шууд авах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    lessonRepository.findByCourseId.mockResolvedValue([mockLesson]);

    const result = await useCase.execute('course-id-1', {
      currentUserId: 'user-id-1',
      currentUserRole: 'TEACHER',
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockLesson.toResponse());
    /** DB-ээс шууд авсан байх ёстой (publishedOnly=false) */
    expect(lessonRepository.findByCourseId).toHaveBeenCalledWith('course-id-1', false);
    /** Кэш сервис дуудагдаагүй байх ёстой */
    expect(lessonCacheService.getPublishedLessonsByCourse).not.toHaveBeenCalled();
  });

  it('сургалт олдоогүй үед NotFoundException', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id', {})).rejects.toThrow(NotFoundException);
  });

  it('хоосон жагсаалт — хоосон массив буцаах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    lessonCacheService.getPublishedLessonsByCourse.mockResolvedValue([]);

    const result = await useCase.execute('course-id-1', {});

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
