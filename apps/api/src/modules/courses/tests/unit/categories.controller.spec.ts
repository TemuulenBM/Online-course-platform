import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../../interface/controllers/categories.controller';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { GetCategoryUseCase } from '../../application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { CategoryEntity } from '../../domain/entities/category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let createCategoryUseCase: jest.Mocked<CreateCategoryUseCase>;
  let listCategoriesUseCase: jest.Mocked<ListCategoriesUseCase>;
  let getCategoryUseCase: jest.Mocked<GetCategoryUseCase>;
  let updateCategoryUseCase: jest.Mocked<UpdateCategoryUseCase>;
  let deleteCategoryUseCase: jest.Mocked<DeleteCategoryUseCase>;

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
    coursesCount: 5,
  });

  /** Ангиллын response хэлбэр */
  const mockCategoryResponse = mockCategory.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CreateCategoryUseCase, useValue: { execute: jest.fn() } },
        { provide: ListCategoriesUseCase, useValue: { execute: jest.fn() } },
        { provide: GetCategoryUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateCategoryUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteCategoryUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    createCategoryUseCase = module.get(CreateCategoryUseCase);
    listCategoriesUseCase = module.get(ListCategoriesUseCase);
    getCategoryUseCase = module.get(GetCategoryUseCase);
    updateCategoryUseCase = module.get(UpdateCategoryUseCase);
    deleteCategoryUseCase = module.get(DeleteCategoryUseCase);
  });

  describe('create', () => {
    it('POST /categories — ангилал үүсгэх', async () => {
      createCategoryUseCase.execute.mockResolvedValue(mockCategory);

      const dto = { name: 'Програмчлал' };
      const result = await controller.create(dto);

      expect(result).toEqual(mockCategoryResponse);
      expect(createCategoryUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('list', () => {
    it('GET /categories — жагсаалт авах', async () => {
      listCategoriesUseCase.execute.mockResolvedValue([mockCategoryResponse]);

      const result = await controller.list();

      expect(result).toEqual([mockCategoryResponse]);
      expect(listCategoriesUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('GET /categories/:id — ангилал авах', async () => {
      getCategoryUseCase.execute.mockResolvedValue(mockCategory);

      const result = await controller.getById('cat-id-1');

      expect(result).toEqual(mockCategoryResponse);
      expect(getCategoryUseCase.execute).toHaveBeenCalledWith('cat-id-1');
    });
  });

  describe('update', () => {
    it('PATCH /categories/:id — ангилал шинэчлэх', async () => {
      updateCategoryUseCase.execute.mockResolvedValue(mockCategory);

      const dto = { name: 'Шинэ нэр' };
      const result = await controller.update('cat-id-1', dto);

      expect(result).toEqual(mockCategoryResponse);
      expect(updateCategoryUseCase.execute).toHaveBeenCalledWith('cat-id-1', dto);
    });
  });

  describe('delete', () => {
    it('DELETE /categories/:id — ангилал устгах', async () => {
      deleteCategoryUseCase.execute.mockResolvedValue(undefined);

      await controller.delete('cat-id-1');

      expect(deleteCategoryUseCase.execute).toHaveBeenCalledWith('cat-id-1');
    });
  });
});
