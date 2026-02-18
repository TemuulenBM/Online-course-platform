import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

/**
 * Сертификатын repository.
 * Мэдээллийн сантай харьцах сертификатын CRUD үйлдлүүд.
 */
@Injectable()
export class CertificateRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ сертификат үүсгэнэ */
  async create(data: {
    userId: string;
    courseId: string;
    certificateNumber: string;
    verificationCode: string;
  }): Promise<CertificateEntity> {
    const certificate = await this.prisma.certificate.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        certificateNumber: data.certificateNumber,
        verificationCode: data.verificationCode,
      },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        course: { select: { title: true, slug: true, instructorId: true } },
      },
    });

    return this.toEntity(certificate);
  }

  /** ID-аар сертификат хайна */
  async findById(id: string): Promise<CertificateEntity | null> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        course: { select: { title: true, slug: true, instructorId: true } },
      },
    });

    return certificate ? this.toEntity(certificate) : null;
  }

  /** Хэрэглэгч + сургалт-аар сертификат хайна (unique index) */
  async findByUserAndCourse(userId: string, courseId: string): Promise<CertificateEntity | null> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        course: { select: { title: true, slug: true, instructorId: true } },
      },
    });

    return certificate ? this.toEntity(certificate) : null;
  }

  /** Баталгаажуулалтын кодоор сертификат хайна */
  async findByVerificationCode(verificationCode: string): Promise<CertificateEntity | null> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { verificationCode },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        course: { select: { title: true, slug: true, instructorId: true } },
      },
    });

    return certificate ? this.toEntity(certificate) : null;
  }

  /** Хэрэглэгчийн сертификатуудын жагсаалт (pagination) */
  async findByUserId(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: CertificateEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (options.page - 1) * options.limit;

    const [certificates, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where: { userId },
        skip,
        take: options.limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          course: { select: { title: true, slug: true, instructorId: true } },
        },
      }),
      this.prisma.certificate.count({ where: { userId } }),
    ]);

    return {
      data: certificates.map((c) => this.toEntity(c)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Сургалтын сертификатуудын жагсаалт (pagination) */
  async findByCourseId(
    courseId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: CertificateEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (options.page - 1) * options.limit;

    const [certificates, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where: { courseId },
        skip,
        take: options.limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          course: { select: { title: true, slug: true, instructorId: true } },
        },
      }),
      this.prisma.certificate.count({ where: { courseId } }),
    ]);

    return {
      data: certificates.map((c) => this.toEntity(c)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Сертификатын pdfUrl, qrCodeUrl шинэчлэнэ */
  async update(
    id: string,
    data: { pdfUrl?: string; qrCodeUrl?: string },
  ): Promise<CertificateEntity> {
    const certificate = await this.prisma.certificate.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        course: { select: { title: true, slug: true, instructorId: true } },
      },
    });

    return this.toEntity(certificate);
  }

  /** Сертификат устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.certificate.delete({ where: { id } });
  }

  /** Prisma объектийг CertificateEntity болгож хөрвүүлнэ */
  private toEntity(data: any): CertificateEntity {
    const profile = data.user?.profile;
    const userName = profile
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : undefined;

    return new CertificateEntity({
      id: data.id,
      userId: data.userId,
      courseId: data.courseId,
      certificateNumber: data.certificateNumber,
      pdfUrl: data.pdfUrl,
      qrCodeUrl: data.qrCodeUrl,
      verificationCode: data.verificationCode,
      issuedAt: data.issuedAt,
      createdAt: data.createdAt,
      userName: userName || undefined,
      userEmail: data.user?.email,
      courseTitle: data.course?.title,
      courseSlug: data.course?.slug,
      courseInstructorId: data.course?.instructorId,
    });
  }
}
