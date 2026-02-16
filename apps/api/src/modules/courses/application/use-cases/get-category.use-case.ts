import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CategoryEntity } from '../../domain/entities/category.entity';

/**
 * Ангилал авах use case (ID-аар).
 * Сургалтуудын тоотой хамт буцаана.
 */
@Injectable()
export class GetCategoryUseCase {
  private readonly logger = new Logger(GetCategoryUseCase.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(categoryId: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Ангилал олдсонгүй');
    }

    // Сургалтуудын тоо нэмэх
    const coursesCount = await this.categoryRepository.countCourses(categoryId);

    return new CategoryEntity({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      children: category.children,
      coursesCount,
    });
  }
}
