import { Test, TestingModule } from '@nestjs/testing';
import { ListCoursesUseCase } from '../../application/use-cases/list-courses.use-case';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('ListCoursesUseCase', () => {
  let useCase: ListCoursesUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;

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
    tags: ['typescript'],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCoursesUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findMany: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListCoursesUseCase>(ListCoursesUseCase);
    courseRepository = module.get(CourseRepository);
  });

  it('сургалтуудын жагсаалт pagination-тэй авах', async () => {
    courseRepository.findMany.mockResolvedValue({
      data: [mockCourse],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    // Default status=PUBLISHED
    expect(courseRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'published' }),
    );
  });

  it('default утгууд зөв тавигдах', async () => {
    courseRepository.findMany.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await useCase.execute({});

    expect(courseRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        status: 'published',
      }),
    );
  });
});
