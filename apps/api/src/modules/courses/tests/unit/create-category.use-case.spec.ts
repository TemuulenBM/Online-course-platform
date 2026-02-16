import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CategoryEntity } from '../../domain/entities/category.entity';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
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
        CreateCategoryUseCase,
        {
          provide: CategoryRepository,
          useValue: {
            nameExists: jest.fn(),
            findById: jest.fn(),
            slugExists: jest.fn(),
            create: jest.fn(),
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

    useCase = module.get<CreateCategoryUseCase>(CreateCategoryUseCase);
    categoryRepository = module.get(CategoryRepository);
    courseCacheService = module.get(CourseCacheService);
  });

  it('ангилал амжилттай үүсгэх', async () => {
    categoryRepository.nameExists.mockResolvedValue(false);
    categoryRepository.slugExists.mockResolvedValue(false);
    categoryRepository.create.mockResolvedValue(mockCategory);
    courseCacheService.invalidateCategoryTree.mockResolvedValue(undefined);

    const dto = { name: 'Програмчлал' };
    const result = await useCase.execute(dto);

    expect(result).toEqual(mockCategory);
    expect(categoryRepository.nameExists).toHaveBeenCalledWith('Програмчлал');
    expect(courseCacheService.invalidateCategoryTree).toHaveBeenCalled();
  });

  it('нэр давхардсан үед алдаа буцаах', async () => {
    categoryRepository.nameExists.mockResolvedValue(true);

    const dto = { name: 'Програмчлал' };
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(categoryRepository.create).not.toHaveBeenCalled();
  });

  it('эцэг ангилал олдоогүй үед алдаа буцаах', async () => {
    categoryRepository.nameExists.mockResolvedValue(false);
    categoryRepository.findById.mockResolvedValue(null);

    const dto = { name: 'Шинэ ангилал', parentId: 'nonexistent' };
    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(categoryRepository.create).not.toHaveBeenCalled();
  });
});
