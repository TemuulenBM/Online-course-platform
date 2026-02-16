import { Injectable, Logger } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

/**
 * Ангиллуудын жагсаалт авах use case.
 * Мод бүтцээр (top-level + children) буцаана.
 */
@Injectable()
export class ListCategoriesUseCase {
  private readonly logger = new Logger(ListCategoriesUseCase.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute() {
    const categories = await this.categoryRepository.findAllTree();
    return categories.map((category) => category.toResponse());
  }
}
