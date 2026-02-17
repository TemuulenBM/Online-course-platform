import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseCacheService } from '../../infrastructure/services/course-cache.service';

/**
 * Ангилал устгах use case.
 * Зөвхөн админ устгаж чадна. Сургалт хамааруулсан бол устгах боломжгүй.
 */
@Injectable()
export class DeleteCategoryUseCase {
  private readonly logger = new Logger(DeleteCategoryUseCase.name);

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly courseCacheService: CourseCacheService,
  ) {}

  async execute(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Ангилал олдсонгүй');
    }

    // Сургалт хамааруулсан бол устгах боломжгүй
    const coursesCount = await this.categoryRepository.countCourses(categoryId);
    if (coursesCount > 0) {
      throw new ConflictException('Энэ ангилалд сургалтууд хамааруулсан тул устгах боломжгүй');
    }

    await this.categoryRepository.delete(categoryId);
    await this.courseCacheService.invalidateCategoryTree();

    this.logger.log(`Ангилал устгагдлаа: ${categoryId} (${category.name})`);
  }
}
