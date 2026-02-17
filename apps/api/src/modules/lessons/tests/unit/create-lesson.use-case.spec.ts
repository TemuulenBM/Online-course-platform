import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateLessonUseCase } from '../../application/use-cases/create-lesson.use-case';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { LessonRepository } from '../../infrastructure/repositories/lesson.repository';
import { LessonCacheService } from '../../infrastructure/services/lesson-cache.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';

describe('CreateLessonUseCase', () => {
  let useCase: CreateLessonUseCase;
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
        CreateLessonUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: LessonRepository,
          useValue: {
            getNextOrderIndex: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: LessonCacheService,
          useValue: {
            invalidateCourseLessons: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateLessonUseCase>(CreateLessonUseCase);
    courseRepository = module.get(CourseRepository);
    lessonRepository = module.get(LessonRepository);
    lessonCacheService = module.get(LessonCacheService);
  });

  it('хичээл амжилттай үүсгэх', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    lessonRepository.getNextOrderIndex.mockResolvedValue(0);
    lessonRepository.create.mockResolvedValue(mockLesson);
    lessonCacheService.invalidateCourseLessons.mockResolvedValue(undefined);

    const dto = {
      courseId: 'course-id-1',
      title: 'React-ийн суурь ойлголтууд',
      lessonType: 'video',
      durationMinutes: 30,
      isPreview: false,
      isPublished: true,
    };

    const result = await useCase.execute('user-id-1', 'TEACHER', dto);

    expect(result).toEqual(mockLesson);
    expect(courseRepository.findById).toHaveBeenCalledWith('course-id-1');
    expect(lessonRepository.getNextOrderIndex).toHaveBeenCalledWith('course-id-1');
    expect(lessonRepository.create).toHaveBeenCalledWith({
      courseId: 'course-id-1',
      title: 'React-ийн суурь ойлголтууд',
      orderIndex: 0,
      lessonType: 'video',
      durationMinutes: 30,
      isPreview: false,
      isPublished: true,
    });
    expect(lessonCacheService.invalidateCourseLessons).toHaveBeenCalledWith('course-id-1');
  });

  it('сургалт олдоогүй үед NotFoundException', async () => {
    courseRepository.findById.mockResolvedValue(null);

    const dto = {
      courseId: 'nonexistent-id',
      title: 'React-ийн суурь ойлголтууд',
      lessonType: 'video',
    };

    await expect(useCase.execute('user-id-1', 'TEACHER', dto)).rejects.toThrow(NotFoundException);
    expect(lessonRepository.create).not.toHaveBeenCalled();
  });

  it('эрх хүрэхгүй үед ForbiddenException', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);

    const dto = {
      courseId: 'course-id-1',
      title: 'React-ийн суурь ойлголтууд',
      lessonType: 'video',
    };

    await expect(useCase.execute('other-user-id', 'TEACHER', dto)).rejects.toThrow(
      ForbiddenException,
    );
    expect(lessonRepository.create).not.toHaveBeenCalled();
  });

  it('default утгууд зөв тавигдах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    lessonRepository.getNextOrderIndex.mockResolvedValue(0);
    lessonRepository.create.mockResolvedValue(mockLesson);
    lessonCacheService.invalidateCourseLessons.mockResolvedValue(undefined);

    /** durationMinutes, isPreview, isPublished өгөхгүй — default утга ашиглагдана */
    const dto = {
      courseId: 'course-id-1',
      title: 'React-ийн суурь ойлголтууд',
      lessonType: 'video',
    };

    await useCase.execute('user-id-1', 'TEACHER', dto);

    expect(lessonRepository.create).toHaveBeenCalledWith({
      courseId: 'course-id-1',
      title: 'React-ийн суурь ойлголтууд',
      orderIndex: 0,
      lessonType: 'video',
      durationMinutes: undefined,
      isPreview: undefined,
      isPublished: undefined,
    });
  });
});
