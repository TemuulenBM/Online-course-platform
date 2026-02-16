import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CategoryEntity } from '../../domain/entities/category.entity';

/**
 * Ангиллын repository.
 * Мэдээллийн сантай харьцах ангиллын CRUD үйлдлүүд.
 */
@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Ангилал үүсгэнэ */
  async create(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    displayOrder?: number;
  }): Promise<CategoryEntity> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        displayOrder: data.displayOrder ?? 0,
      },
    });

    return new CategoryEntity(category);
  }

  /** ID-аар ангилал хайна */
  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: { orderBy: { displayOrder: 'asc' } } },
    });

    if (!category) return null;

    return new CategoryEntity({
      ...category,
      children: category.children.map((child) => new CategoryEntity(child)),
    });
  }

  /** Slug-аар ангилал хайна */
  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: { orderBy: { displayOrder: 'asc' } } },
    });

    if (!category) return null;

    return new CategoryEntity({
      ...category,
      children: category.children.map((child) => new CategoryEntity(child)),
    });
  }

  /** Slug байгаа эсэхийг шалгана */
  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.category.count({ where: { slug } });
    return count > 0;
  }

  /** Нэр байгаа эсэхийг шалгана */
  async nameExists(name: string): Promise<boolean> {
    const count = await this.prisma.category.count({ where: { name } });
    return count > 0;
  }

  /** Бүх ангиллуудыг мод бүтцээр авах (top-level + children) */
  async findAllTree(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { displayOrder: 'asc' },
    });

    return categories.map(
      (cat) =>
        new CategoryEntity({
          ...cat,
          children: cat.children.map((child) => new CategoryEntity(child)),
        }),
    );
  }

  /** Ангилал шинэчлэнэ */
  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      parentId: string | null;
      displayOrder: number;
    }>,
  ): Promise<CategoryEntity> {
    const category = await this.prisma.category.update({
      where: { id },
      data,
      include: { children: { orderBy: { displayOrder: 'asc' } } },
    });

    return new CategoryEntity({
      ...category,
      children: category.children.map((child) => new CategoryEntity(child)),
    });
  }

  /** Ангилал устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  /** Ангилалд хамаарах сургалтуудын тоо */
  async countCourses(categoryId: string): Promise<number> {
    return this.prisma.course.count({ where: { categoryId } });
  }
}
