import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import { EnrollmentStatus, Prisma } from '@prisma/client';

/**
 * Элсэлтийн repository.
 * Мэдээллийн сантай харьцах элсэлтийн CRUD үйлдлүүд.
 */
@Injectable()
export class EnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ элсэлт үүсгэнэ */
  async create(data: {
    userId: string;
    courseId: string;
    expiresAt?: Date;
  }): Promise<EnrollmentEntity> {
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        expiresAt: data.expiresAt,
      },
      include: {
        course: { select: { title: true, slug: true, thumbnailUrl: true, instructorId: true } },
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });

    return this.toEntity(enrollment);
  }

  /** ID-аар элсэлт хайна */
  async findById(id: string): Promise<EnrollmentEntity | null> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: { select: { title: true, slug: true, thumbnailUrl: true, instructorId: true } },
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });

    return enrollment ? this.toEntity(enrollment) : null;
  }

  /** Хэрэглэгч + сургалт-аар элсэлт хайна (unique index) */
  async findByUserAndCourse(userId: string, courseId: string): Promise<EnrollmentEntity | null> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: { select: { title: true, slug: true, thumbnailUrl: true, instructorId: true } },
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });

    return enrollment ? this.toEntity(enrollment) : null;
  }

  /** Хэрэглэгчийн элсэлтүүд (pagination + status шүүлтүүр) */
  async findByUserId(
    userId: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<{
    data: EnrollmentEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Prisma.EnrollmentWhereInput = { userId };
    if (options.status) where.status = options.status.toUpperCase() as EnrollmentStatus;

    const skip = (options.page - 1) * options.limit;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          course: {
            select: {
              title: true,
              slug: true,
              thumbnailUrl: true,
              instructorId: true,
              instructor: {
                select: {
                  profile: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      data: enrollments.map((e) => this.toEntity(e)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Сургалтын оюутнуудын жагсаалт (pagination + status шүүлтүүр) */
  async findByCourseId(
    courseId: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<{
    data: EnrollmentEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Prisma.EnrollmentWhereInput = { courseId };
    if (options.status) where.status = options.status.toUpperCase() as EnrollmentStatus;

    const skip = (options.page - 1) * options.limit;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: {
            select: { email: true, profile: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      data: enrollments.map((e) => this.toEntity(e)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Сургалтын prerequisite-ийн course ID-уудыг авна */
  async getPrerequisiteCourseIds(courseId: string): Promise<string[]> {
    const prerequisites = await this.prisma.prerequisite.findMany({
      where: { courseId },
      select: { requiredCourseId: true },
    });
    return prerequisites.map((p) => p.requiredCourseId);
  }

  /** Хэрэглэгч бүх required course-уудыг COMPLETED болсон эсэхийг шалгана */
  async hasCompletedCourses(userId: string, courseIds: string[]): Promise<boolean> {
    if (courseIds.length === 0) return true;

    const completedCount = await this.prisma.enrollment.count({
      where: {
        userId,
        courseId: { in: courseIds },
        status: EnrollmentStatus.COMPLETED,
      },
    });

    return completedCount === courseIds.length;
  }

  /** Элсэлт шинэчлэнэ */
  async update(
    id: string,
    data: Partial<{
      status: string;
      completedAt: Date | null;
    }>,
  ): Promise<EnrollmentEntity> {
    const updateData: Prisma.EnrollmentUpdateInput = {};

    if (data.status !== undefined)
      updateData.status = data.status.toUpperCase() as EnrollmentStatus;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;

    const enrollment = await this.prisma.enrollment.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { title: true, slug: true, thumbnailUrl: true, instructorId: true } },
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });

    return this.toEntity(enrollment);
  }

  /** Элсэлт устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.enrollment.delete({ where: { id } });
  }

  /** Prisma объектийг EnrollmentEntity болгож хөрвүүлнэ */
  private toEntity(enrollment: any): EnrollmentEntity {
    const profile = enrollment.user?.profile;
    const userName = profile
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : undefined;

    /** Багшийн нэрийг instructor relation-аас авах */
    const instructorProfile = enrollment.course?.instructor?.profile;
    const courseInstructorName = instructorProfile
      ? `${instructorProfile.firstName ?? ''} ${instructorProfile.lastName ?? ''}`.trim()
      : undefined;

    return new EnrollmentEntity({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      status: enrollment.status.toLowerCase(),
      enrolledAt: enrollment.enrolledAt,
      expiresAt: enrollment.expiresAt,
      completedAt: enrollment.completedAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      courseTitle: enrollment.course?.title,
      courseSlug: enrollment.course?.slug,
      courseThumbnailUrl: enrollment.course?.thumbnailUrl,
      courseInstructorId: enrollment.course?.instructorId,
      courseInstructorName: courseInstructorName || undefined,
      userName: userName || undefined,
      userEmail: enrollment.user?.email,
    });
  }
}
