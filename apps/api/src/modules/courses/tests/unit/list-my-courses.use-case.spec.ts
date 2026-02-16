import { Test, TestingModule } from '@nestjs/testing';
import { ListMyCoursesUseCase } from '../../application/use-cases/list-my-courses.use-case';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseEntity } from '../../domain/entities/course.entity';

describe('ListMyCoursesUseCase', () => {
  let useCase: ListMyCoursesUseCase;
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
        ListMyCoursesUseCase,
        {
          provide: CourseRepository,
          useValue: {
            findByInstructorId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListMyCoursesUseCase>(ListMyCoursesUseCase);
    courseRepository = module.get(CourseRepository);
  });

  it('багшийн сургалтуудын жагсаалт авах', async () => {
    courseRepository.findByInstructorId.mockResolvedValue({
      data: [mockCourse],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-id-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(courseRepository.findByInstructorId).toHaveBeenCalledWith(
      'user-id-1',
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });
});
