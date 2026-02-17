import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateCourseUseCase } from '../../application/use-cases/create-course.use-case';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseEntity } from '../../domain/entities/course.entity';
import { CategoryEntity } from '../../domain/entities/category.entity';

describe('CreateCourseUseCase', () => {
  let useCase: CreateCourseUseCase;
  let courseRepository: jest.Mocked<CourseRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;

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
    tags: ['typescript', 'programming'],
    instructorName: 'Бат Дорж',
    categoryName: 'Програмчлал',
  });

  /** Тестэд ашиглах mock ангилал */
  const mockCategory = new CategoryEntity({
    id: 'cat-id-1',
    name: 'Програмчлал',
    slug: 'programchlal',
    description: null,
    parentId: null,
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCourseUseCase,
        {
          provide: CourseRepository,
          useValue: {
            create: jest.fn(),
            slugExists: jest.fn(),
          },
        },
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateCourseUseCase>(CreateCourseUseCase);
    courseRepository = module.get(CourseRepository);
    categoryRepository = module.get(CategoryRepository);
  });

  it('сургалт амжилттай үүсгэх', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    courseRepository.slugExists.mockResolvedValue(false);
    courseRepository.create.mockResolvedValue(mockCourse);

    const dto = {
      title: 'TypeScript Сургалт',
      description: 'TypeScript суралцах сургалт',
      categoryId: 'cat-id-1',
      difficulty: 'BEGINNER' as const,
      tags: ['typescript', 'programming'],
    };

    const result = await useCase.execute('user-id-1', dto);

    expect(result).toEqual(mockCourse);
    expect(categoryRepository.findById).toHaveBeenCalledWith('cat-id-1');
    expect(courseRepository.create).toHaveBeenCalled();
  });

  it('ангилал олдоогүй үед алдаа буцаах', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    const dto = {
      title: 'TypeScript Сургалт',
      description: 'TypeScript суралцах сургалт',
      categoryId: 'nonexistent-id',
      difficulty: 'BEGINNER' as const,
    };

    await expect(useCase.execute('user-id-1', dto)).rejects.toThrow(NotFoundException);
    expect(courseRepository.create).not.toHaveBeenCalled();
  });

  it('slug давхардсан үед дугаар нэмэх', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    courseRepository.slugExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    courseRepository.create.mockResolvedValue(mockCourse);

    const dto = {
      title: 'TypeScript Сургалт',
      description: 'TypeScript суралцах сургалт',
      categoryId: 'cat-id-1',
      difficulty: 'BEGINNER' as const,
    };

    await useCase.execute('user-id-1', dto);

    expect(courseRepository.slugExists).toHaveBeenCalledTimes(2);
    expect(courseRepository.create).toHaveBeenCalled();
  });
});
