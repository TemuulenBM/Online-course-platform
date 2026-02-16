import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCourseUseCase } from '../../application/use-cases/get-course.use-case';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('GetCourseUseCase', () => {
  let useCase: GetCourseUseCase;
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
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['typescript'],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCourseUseCase,
        {
          provide: CourseCacheService,
          useValue: {
            getCourse: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetCourseUseCase>(GetCourseUseCase);
    courseCacheService = module.get(CourseCacheService);
  });

  it('PUBLISHED сургалт амжилттай авах', async () => {
    courseCacheService.getCourse.mockResolvedValue(mockCourse);

    const result = await useCase.execute('course-id-1');

    expect(result).toEqual(mockCourse);
    expect(courseCacheService.getCourse).toHaveBeenCalledWith('course-id-1');
  });

  it('сургалт олдоогүй үед алдаа буцаах', async () => {
    courseCacheService.getCourse.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('publishedOnly=true үед DRAFT сургалт буцаахгүй', async () => {
    const draftCourse = new CourseEntity({ ...mockCourse, status: 'draft', publishedAt: null });
    courseCacheService.getCourse.mockResolvedValue(draftCourse);

    await expect(useCase.execute('course-id-1', true)).rejects.toThrow(NotFoundException);
  });

  it('publishedOnly=false үед DRAFT сургалт буцаана', async () => {
    const draftCourse = new CourseEntity({ ...mockCourse, status: 'draft', publishedAt: null });
    courseCacheService.getCourse.mockResolvedValue(draftCourse);

    const result = await useCase.execute('course-id-1', false);
    expect(result.status).toBe('draft');
  });
});
