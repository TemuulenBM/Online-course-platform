import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateCourseUseCase } from '../../application/use-cases/update-course.use-case';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('UpdateCourseUseCase', () => {
  let useCase: UpdateCourseUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let courseCacheService: jest.Mocked<CourseCacheService>;

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
    status: 'draft',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['typescript'],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCourseUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            updateTags: jest.fn(),
            slugExists: jest.fn(),
          },
        },
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: CourseCacheService,
          useValue: {
            invalidateCourse: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateCourseUseCase>(UpdateCourseUseCase);
    courseRepository = module.get(CourseRepository);
    categoryRepository = module.get(CategoryRepository);
    courseCacheService = module.get(CourseCacheService);
  });

  it('эзэмшигч багш амжилттай шинэчлэх', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    courseRepository.update.mockResolvedValue(mockCourse);
    courseCacheService.invalidateCourse.mockResolvedValue(undefined);

    const dto = { description: 'Шинэ тайлбар' };
    const result = await useCase.execute('course-id-1', 'user-id-1', 'TEACHER', dto);

    expect(result).toEqual(mockCourse);
    expect(courseCacheService.invalidateCourse).toHaveBeenCalledWith('course-id-1');
  });

  it('админ амжилттай шинэчлэх', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    courseRepository.update.mockResolvedValue(mockCourse);
    courseCacheService.invalidateCourse.mockResolvedValue(undefined);

    const dto = { description: 'Админ засвар' };
    const result = await useCase.execute('course-id-1', 'admin-id', 'ADMIN', dto);

    expect(result).toEqual(mockCourse);
  });

  it('эрхгүй хэрэглэгч шинэчлэх оролдлого', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);

    const dto = { description: 'Хууль бусаар засах' };
    await expect(useCase.execute('course-id-1', 'other-user', 'TEACHER', dto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('сургалт олдоогүй', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-id-1', 'TEACHER', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('ангилал олдоогүй үед алдаа', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    categoryRepository.findById.mockResolvedValue(null);

    const dto = { categoryId: 'nonexistent-cat' };
    await expect(useCase.execute('course-id-1', 'user-id-1', 'TEACHER', dto)).rejects.toThrow(
      NotFoundException,
    );
  });
});
