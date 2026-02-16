import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CourseEntity } from '../../domain/entities/course.entity';
import { CreateCourseDto } from '../../dto/create-course.dto';
import { generateSlug, generateUniqueSlug } from '../../../../common/utils/slug.util';

/**
 * Сургалт үүсгэх use case.
 * Ангилал шалгах, slug үүсгэх, шинэ сургалт DRAFT статустай үүсгэнэ.
 */
@Injectable()
export class CreateCourseUseCase {
  private readonly logger = new Logger(CreateCourseUseCase.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(instructorId: string, dto: CreateCourseDto): Promise<CourseEntity> {
    // Ангилал байгаа эсэх шалгах
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException('Ангилал олдсонгүй');
    }

    // Slug үүсгэх
    const baseSlug = generateSlug(dto.title);
    const slug = await generateUniqueSlug(baseSlug, (s) =>
      this.courseRepository.slugExists(s),
    );

    // Сургалт үүсгэх (status = DRAFT автоматаар)
    const course = await this.courseRepository.create({
      title: dto.title,
      slug,
      description: dto.description,
      instructorId,
      categoryId: dto.categoryId,
      price: dto.price,
      difficulty: dto.difficulty,
      language: dto.language ?? 'en',
      tags: dto.tags,
    });

    this.logger.log(`Сургалт үүсгэгдлээ: ${course.id} (${course.title})`);
    return course;
  }
}
