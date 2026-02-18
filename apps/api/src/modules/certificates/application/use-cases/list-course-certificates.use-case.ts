import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { CertificateEntity } from '../../domain/entities/certificate.entity';

/**
 * Сургалтын сертификатуудын жагсаалт авах use case.
 * Зөвхөн сургалтын эзэмшигч (TEACHER) эсвэл ADMIN хандах боломжтой.
 */
@Injectable()
export class ListCourseCertificatesUseCase {
  private readonly logger = new Logger(ListCourseCertificatesUseCase.name);

  constructor(
    private readonly certificateRepository: CertificateRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(
    userId: string,
    userRole: string,
    courseId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: CertificateEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    /** 1. Сургалт олдох эсэх шалгах */
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** 2. Эрхийн шалгалт — эзэмшигч эсвэл ADMIN */
    if (userRole !== 'ADMIN' && course.instructorId !== userId) {
      throw new ForbiddenException(
        'Зөвхөн сургалтын эзэмшигч эсвэл админ энэ жагсаалтыг харах боломжтой',
      );
    }

    return this.certificateRepository.findByCourseId(courseId, options);
  }
}
