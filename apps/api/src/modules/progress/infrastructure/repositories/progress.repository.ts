import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserProgressEntity } from '../../domain/entities/user-progress.entity';

/**
 * Ахицын repository.
 * Мэдээллийн сантай харьцах ахицын CRUD үйлдлүүд.
 */
@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Хичээлийн ахиц upsert (байвал шинэчлэх, байхгүй бол үүсгэх) */
  async upsert(data: {
    userId: string;
    lessonId: string;
    progressPercentage?: number;
    completed?: boolean;
    timeSpentSeconds?: number;
    lastPositionSeconds?: number;
    completedAt?: Date | null;
  }): Promise<UserProgressEntity> {
    const progress = await this.prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: data.userId,
          lessonId: data.lessonId,
        },
      },
      create: {
        userId: data.userId,
        lessonId: data.lessonId,
        progressPercentage: data.progressPercentage ?? 0,
        completed: data.completed ?? false,
        timeSpentSeconds: data.timeSpentSeconds ?? 0,
        lastPositionSeconds: data.lastPositionSeconds ?? 0,
        completedAt: data.completedAt ?? null,
      },
      update: {
        ...(data.progressPercentage !== undefined && {
          progressPercentage: data.progressPercentage,
        }),
        ...(data.completed !== undefined && { completed: data.completed }),
        ...(data.timeSpentSeconds !== undefined && {
          timeSpentSeconds: data.timeSpentSeconds,
        }),
        ...(data.lastPositionSeconds !== undefined && {
          lastPositionSeconds: data.lastPositionSeconds,
        }),
        ...(data.completedAt !== undefined && {
          completedAt: data.completedAt,
        }),
      },
      include: {
        lesson: {
          select: {
            title: true,
            lessonType: true,
            courseId: true,
            orderIndex: true,
          },
        },
      },
    });

    return this.toEntity(progress);
  }

  /** userId + lessonId-аар ахиц хайна */
  async findByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<UserProgressEntity | null> {
    const progress = await this.prisma.userProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      include: {
        lesson: {
          select: {
            title: true,
            lessonType: true,
            courseId: true,
            orderIndex: true,
          },
        },
      },
    });

    return progress ? this.toEntity(progress) : null;
  }

  /** Хэрэглэгчийн тухайн сургалтын бүх ахицууд */
  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<UserProgressEntity[]> {
    const progressList = await this.prisma.userProgress.findMany({
      where: {
        userId,
        lesson: { courseId },
      },
      include: {
        lesson: {
          select: {
            title: true,
            lessonType: true,
            courseId: true,
            orderIndex: true,
          },
        },
      },
      orderBy: { lesson: { orderIndex: 'asc' } },
    });

    return progressList.map((p) => this.toEntity(p));
  }

  /** Хэрэглэгчийн тухайн сургалтын completed хичээлүүдийн тоо */
  async countCompletedLessons(
    userId: string,
    courseId: string,
  ): Promise<number> {
    return this.prisma.userProgress.count({
      where: {
        userId,
        completed: true,
        lesson: { courseId },
      },
    });
  }

  /** ID-аар ахиц хайна */
  async findById(id: string): Promise<UserProgressEntity | null> {
    const progress = await this.prisma.userProgress.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            title: true,
            lessonType: true,
            courseId: true,
            orderIndex: true,
          },
        },
      },
    });

    return progress ? this.toEntity(progress) : null;
  }

  /** Ахиц устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.userProgress.delete({ where: { id } });
  }

  /** Хэрэглэгчийн бүх ахиц (pagination-тэй) */
  async findByUserId(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: UserProgressEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (options.page - 1) * options.limit;

    const [progressList, total] = await Promise.all([
      this.prisma.userProgress.findMany({
        where: { userId },
        skip,
        take: options.limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          lesson: {
            select: {
              title: true,
              lessonType: true,
              courseId: true,
              orderIndex: true,
            },
          },
        },
      }),
      this.prisma.userProgress.count({ where: { userId } }),
    ]);

    return {
      data: progressList.map((p) => this.toEntity(p)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Prisma объектийг UserProgressEntity болгож хөрвүүлнэ */
  private toEntity(progress: any): UserProgressEntity {
    return new UserProgressEntity({
      id: progress.id,
      userId: progress.userId,
      lessonId: progress.lessonId,
      progressPercentage: progress.progressPercentage,
      completed: progress.completed,
      timeSpentSeconds: progress.timeSpentSeconds,
      lastPositionSeconds: progress.lastPositionSeconds,
      completedAt: progress.completedAt,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
      lessonTitle: progress.lesson?.title,
      lessonType: progress.lesson?.lessonType?.toLowerCase(),
      courseId: progress.lesson?.courseId,
      lessonOrderIndex: progress.lesson?.orderIndex,
    });
  }
}
