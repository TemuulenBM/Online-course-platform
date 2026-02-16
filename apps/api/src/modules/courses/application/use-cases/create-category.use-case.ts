import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { CreateCategoryDto } from '../../dto/create-category.dto';
import { generateSlug, generateUniqueSlug } from '../../../../common/utils/slug.util';

/**
 * Ангилал үүсгэх use case.
 * Нэр давхардал шалгаж, slug үүсгэж, шинэ ангилал үүсгэнэ.
 */
@Injectable()
export class CreateCategoryUseCase {
  private readonly logger = new Logger(CreateCategoryUseCase.name);

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly courseCacheService: CourseCacheService,
  ) {}

  async execute(dto: CreateCategoryDto): Promise<CategoryEntity> {
    // Нэр давхардал шалгах
    const nameExists = await this.categoryRepository.nameExists(dto.name);
    if (nameExists) {
      throw new ConflictException('Энэ нэртэй ангилал аль хэдийн байна');
    }

    // Эцэг ангилал байгаа эсэх шалгах
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('Эцэг ангилал олдсонгүй');
      }
    }

    // Slug үүсгэх
    const baseSlug = generateSlug(dto.name);
    const slug = await generateUniqueSlug(baseSlug, (s) =>
      this.categoryRepository.slugExists(s),
    );

    const category = await this.categoryRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      parentId: dto.parentId,
      displayOrder: dto.displayOrder,
    });

    await this.courseCacheService.invalidateCategoryTree();
    this.logger.log(`Ангилал үүсгэгдлээ: ${category.id} (${category.name})`);
    return category;
  }
}
