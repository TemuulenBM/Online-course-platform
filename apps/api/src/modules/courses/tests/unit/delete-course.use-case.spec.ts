import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteCourseUseCase } from '../../application/use-cases/delete-course.use-case';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('DeleteCourseUseCase', () => {
  let useCase: DeleteCourseUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;
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
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCourseUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
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

    useCase = module.get<DeleteCourseUseCase>(DeleteCourseUseCase);
    courseRepository = module.get(CourseRepository);
    courseCacheService = module.get(CourseCacheService);
  });

  it('сургалт амжилттай устгах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    courseRepository.delete.mockResolvedValue(undefined);
    courseCacheService.invalidateCourse.mockResolvedValue(undefined);

    await useCase.execute('course-id-1');

    expect(courseRepository.findById).toHaveBeenCalledWith('course-id-1');
    expect(courseRepository.delete).toHaveBeenCalledWith('course-id-1');
    expect(courseCacheService.invalidateCourse).toHaveBeenCalledWith('course-id-1');
  });

  it('сургалт олдоогүй үед алдаа буцаах', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
    expect(courseRepository.delete).not.toHaveBeenCalled();
  });
});
