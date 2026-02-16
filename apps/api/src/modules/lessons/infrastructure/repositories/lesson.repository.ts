import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { LessonEntity } from '../../domain/entities/lesson.entity';
import { LessonType, Prisma } from '@prisma/client';

/**
 * Хичээлийн repository.
 * Мэдээллийн сантай харьцах хичээлийн CRUD үйлдлүүд.
 */
@Injectable()
export class LessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ хичээл үүсгэнэ */
  async create(data: {
    courseId: string;
    title: string;
    orderIndex: number;
    lessonType: string;
    durationMinutes?: number;
    isPreview?: boolean;
    isPublished?: boolean;
  }): Promise<LessonEntity> {
    const lesson = await this.prisma.lesson.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        orderIndex: data.orderIndex,
        lessonType: data.lessonType.toUpperCase() as LessonType,
        durationMinutes: data.durationMinutes ?? 0,
        isPreview: data.isPreview ?? false,
        isPublished: data.isPublished ?? true,
      },
      include: {
        course: { select: { title: true, instructorId: true } },
      },
    });

    return this.toEntity(lesson);
  }

  /** ID-аар хичээл хайна */
  async findById(id: string): Promise<LessonEntity | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        course: { select: { title: true, instructorId: true } },
      },
    });

    return lesson ? this.toEntity(lesson) : null;
  }

  /** Сургалтын хичээлүүдийг orderIndex-ээр эрэмбэлж авна */
  async findByCourseId(
    courseId: string,
    publishedOnly?: boolean,
  ): Promise<LessonEntity[]> {
    const where: Prisma.LessonWhereInput = { courseId };
    if (publishedOnly) {
      where.isPublished = true;
    }

    const lessons = await this.prisma.lesson.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      include: {
        course: { select: { title: true, instructorId: true } },
      },
    });

    return lessons.map((lesson) => this.toEntity(lesson));
  }

  /** Хичээл шинэчлэнэ */
  async update(
    id: string,
    data: Partial<{
      title: string;
      lessonType: string;
      durationMinutes: number;
      isPreview: boolean;
      isPublished: boolean;
    }>,
  ): Promise<LessonEntity> {
    const updateData: Prisma.LessonUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.lessonType !== undefined)
      updateData.lessonType = data.lessonType.toUpperCase() as LessonType;
    if (data.durationMinutes !== undefined)
      updateData.durationMinutes = data.durationMinutes;
    if (data.isPreview !== undefined) updateData.isPreview = data.isPreview;
    if (data.isPublished !== undefined)
      updateData.isPublished = data.isPublished;

    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { title: true, instructorId: true } },
      },
    });

    return this.toEntity(lesson);
  }

  /** Хичээл устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({ where: { id } });
  }

  /** Сургалтын дараагийн orderIndex авна (max + 1) */
  async getNextOrderIndex(courseId: string): Promise<number> {
    const result = await this.prisma.lesson.aggregate({
      where: { courseId },
      _max: { orderIndex: true },
    });

    return (result._max.orderIndex ?? -1) + 1;
  }

  /** Олон хичээлийн orderIndex-г шинэчлэх (transaction) */
  async reorder(items: { id: string; orderIndex: number }[]): Promise<void> {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.lesson.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        }),
      ),
    );
  }

  /** Сургалтын хичээлүүдийн тоог авна */
  async countByCourseId(courseId: string): Promise<number> {
    return this.prisma.lesson.count({ where: { courseId } });
  }

  /** Хичээлүүдийн ID жагсаалтыг сургалтаар авна (reorder шалгалтад) */
  async findIdsByCourseId(courseId: string): Promise<string[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      select: { id: true },
    });
    return lessons.map((l) => l.id);
  }

  /** Prisma объектийг LessonEntity болгож хөрвүүлнэ */
  private toEntity(lesson: any): LessonEntity {
    return new LessonEntity({
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      orderIndex: lesson.orderIndex,
      lessonType: lesson.lessonType.toLowerCase(),
      durationMinutes: lesson.durationMinutes,
      isPreview: lesson.isPreview,
      isPublished: lesson.isPublished,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      courseTitle: lesson.course?.title,
      courseInstructorId: lesson.course?.instructorId,
    });
  }
}
