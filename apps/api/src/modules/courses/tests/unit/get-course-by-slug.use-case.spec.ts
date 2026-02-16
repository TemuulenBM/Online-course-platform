import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCourseBySlugUseCase } from '../../application/use-cases/get-course-by-slug.use-case';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('GetCourseBySlugUseCase', () => {
  let useCase: GetCourseBySlugUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;

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
        GetCourseBySlugUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetCourseBySlugUseCase>(GetCourseBySlugUseCase);
    courseRepository = module.get(CourseRepository);
  });

  it('slug-аар PUBLISHED сургалт амжилттай авах', async () => {
    courseRepository.findBySlug.mockResolvedValue(mockCourse);

    const result = await useCase.execute('typescript-surgalt');

    expect(result).toEqual(mockCourse);
    expect(courseRepository.findBySlug).toHaveBeenCalledWith('typescript-surgalt');
  });

  it('сургалт олдоогүй үед алдаа буцаах', async () => {
    courseRepository.findBySlug.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('DRAFT сургалт буцаахгүй', async () => {
    const draftCourse = new CourseEntity({ ...mockCourse, status: 'draft', publishedAt: null });
    courseRepository.findBySlug.mockResolvedValue(draftCourse);

    await expect(useCase.execute('typescript-surgalt')).rejects.toThrow(NotFoundException);
  });
});
