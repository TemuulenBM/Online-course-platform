import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { UpdateCategoryDto } from '../../dto/update-category.dto';
import { generateSlug, generateUniqueSlug } from '../../../../common/utils/slug.util';

/**
 * Ангилал шинэчлэх use case.
 * Зөвхөн админ шинэчилж чадна.
 */
@Injectable()
export class UpdateCategoryUseCase {
  private readonly logger = new Logger(UpdateCategoryUseCase.name);

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly courseCacheService: CourseCacheService,
  ) {}

  async execute(categoryId: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Ангилал олдсонгүй');
    }

    // Нэр давхардал шалгах (өөрчлөгдсөн бол)
    if (dto.name && dto.name !== category.name) {
      const nameExists = await this.categoryRepository.nameExists(dto.name);
      if (nameExists) {
        throw new ConflictException('Энэ нэртэй ангилал аль хэдийн байна');
      }
    }

    // Эцэг ангилал шалгах
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('Эцэг ангилал олдсонгүй');
      }
    }

    // Нэр өөрчлөгдсөн бол slug дахин үүсгэх
    let newSlug: string | undefined;
    if (dto.name && dto.name !== category.name) {
      const baseSlug = generateSlug(dto.name);
      newSlug = await generateUniqueSlug(baseSlug, (s) =>
        this.categoryRepository.slugExists(s),
      );
    }

    const updated = await this.categoryRepository.update(categoryId, {
      ...dto,
      slug: newSlug,
    });

    await this.courseCacheService.invalidateCategoryTree();
    this.logger.log(`Ангилал шинэчлэгдлээ: ${categoryId}`);
    return updated;
  }
}
