import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CategoryEntity } from '../../domain/entities/category.entity';

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let courseCacheService: jest.Mocked<CourseCacheService>;

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
        DeleteCategoryUseCase,
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
            countCourses: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CourseCacheService,
          useValue: {
            invalidateCategoryTree: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteCategoryUseCase>(DeleteCategoryUseCase);
    categoryRepository = module.get(CategoryRepository);
    courseCacheService = module.get(CourseCacheService);
  });

  it('ангилал амжилттай устгах', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    categoryRepository.countCourses.mockResolvedValue(0);
    categoryRepository.delete.mockResolvedValue(undefined);
    courseCacheService.invalidateCategoryTree.mockResolvedValue(undefined);

    await useCase.execute('cat-id-1');

    expect(categoryRepository.delete).toHaveBeenCalledWith('cat-id-1');
    expect(courseCacheService.invalidateCategoryTree).toHaveBeenCalled();
  });

  it('ангилал олдоогүй үед алдаа буцаах', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(NotFoundException);
    expect(categoryRepository.delete).not.toHaveBeenCalled();
  });

  it('сургалт хамааруулсан ангилал устгах боломжгүй', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    categoryRepository.countCourses.mockResolvedValue(5);

    await expect(useCase.execute('cat-id-1')).rejects.toThrow(ConflictException);
    expect(categoryRepository.delete).not.toHaveBeenCalled();
  });
});
