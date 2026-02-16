import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CourseEntity } from '../../domain/entities/course.entity';
import { CourseDifficulty, CourseStatus, Prisma } from '@prisma/client';

/**
 * Сургалтын repository.
 * Мэдээллийн сантай харьцах сургалтын CRUD үйлдлүүд.
 */
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ сургалт үүсгэнэ */
  async create(data: {
    title: string;
    slug: string;
    description: string;
    instructorId: string;
    categoryId: string;
    price?: number;
    difficulty: string;
    language: string;
    tags?: string[];
  }): Promise<CourseEntity> {
    const course = await this.prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        instructorId: data.instructorId,
        categoryId: data.categoryId,
        price: data.price,
        difficulty: data.difficulty.toUpperCase() as CourseDifficulty,
        language: data.language,
        tags: data.tags?.length
          ? { create: data.tags.map((tagName) => ({ tagName })) }
          : undefined,
      },
      include: {
        tags: true,
        category: true,
        instructor: { include: { profile: true } },
      },
    });

    return this.toEntity(course);
  }

  /** ID-аар сургалт хайна */
  async findById(id: string): Promise<CourseEntity | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        tags: true,
        category: true,
        instructor: { include: { profile: true } },
      },
    });

    return course ? this.toEntity(course) : null;
  }

  /** Slug-аар сургалт хайна */
  async findBySlug(slug: string): Promise<CourseEntity | null> {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        tags: true,
        category: true,
        instructor: { include: { profile: true } },
      },
    });

    return course ? this.toEntity(course) : null;
  }

  /** Slug байгаа эсэхийг шалгана */
  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.course.count({ where: { slug } });
    return count > 0;
  }

  /** Сургалт шинэчлэнэ */
  async update(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      description: string;
      categoryId: string;
      price: number | null;
      discountPrice: number | null;
      difficulty: string;
      language: string;
      thumbnailUrl: string | null;
      status: string;
      publishedAt: Date;
    }>,
  ): Promise<CourseEntity> {
    const updateData: Prisma.CourseUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty.toUpperCase() as CourseDifficulty;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as CourseStatus;
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;

    const course = await this.prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        tags: true,
        category: true,
        instructor: { include: { profile: true } },
      },
    });

    return this.toEntity(course);
  }

  /** Сургалт устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({ where: { id } });
  }

  /** Сургалтуудын жагсаалт (pagination + filter) */
  async findMany(options: {
    page: number;
    limit: number;
    status?: string;
    difficulty?: string;
    categoryId?: string;
    instructorId?: string;
    search?: string;
  }): Promise<{
    data: CourseEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Prisma.CourseWhereInput = {};

    if (options.status) where.status = options.status.toUpperCase() as CourseStatus;
    if (options.difficulty) where.difficulty = options.difficulty.toUpperCase() as CourseDifficulty;
    if (options.categoryId) where.categoryId = options.categoryId;
    if (options.instructorId) where.instructorId = options.instructorId;
    if (options.search) {
      where.title = { contains: options.search, mode: 'insensitive' };
    }

    const skip = (options.page - 1) * options.limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
          category: true,
          instructor: { include: { profile: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses.map((course) => this.toEntity(course)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Багшийн сургалтууд */
  async findByInstructorId(
    instructorId: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<{
    data: CourseEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Prisma.CourseWhereInput = { instructorId };
    if (options.status) where.status = options.status.toUpperCase() as CourseStatus;

    const skip = (options.page - 1) * options.limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
          category: true,
          instructor: { include: { profile: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses.map((course) => this.toEntity(course)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Tag-ууд шинэчлэх (хуучныг устгаж шинийг нэмнэ) */
  async updateTags(courseId: string, tags: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.courseTag.deleteMany({ where: { courseId } }),
      this.prisma.courseTag.createMany({
        data: tags.map((tagName) => ({ courseId, tagName })),
      }),
    ]);
  }

  /** Prisma объектийг CourseEntity болгож хөрвүүлнэ */
  private toEntity(course: any): CourseEntity {
    const instructorProfile = course.instructor?.profile;
    const instructorName = instructorProfile
      ? `${instructorProfile.firstName ?? ''} ${instructorProfile.lastName ?? ''}`.trim()
      : undefined;

    return new CourseEntity({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      instructorId: course.instructorId,
      categoryId: course.categoryId,
      price: course.price,
      discountPrice: course.discountPrice,
      difficulty: course.difficulty.toLowerCase(),
      language: course.language,
      status: course.status.toLowerCase(),
      thumbnailUrl: course.thumbnailUrl,
      durationMinutes: course.durationMinutes,
      publishedAt: course.publishedAt,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      tags: course.tags?.map((t: any) => t.tagName),
      instructorName: instructorName || undefined,
      categoryName: course.category?.name,
    });
  }
}
