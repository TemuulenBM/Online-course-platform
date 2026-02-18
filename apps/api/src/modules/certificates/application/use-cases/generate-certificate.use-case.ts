import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CertificateRepository } from '../../infrastructure/repositories/certificate.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { CertificateEntity } from '../../domain/entities/certificate.entity';
import {
  generateCertificateNumber,
  generateVerificationCode,
} from '../../../../common/utils/certificate.util';

/**
 * Сертификат үүсгэх use case.
 * Хэрэглэгчийн хүсэлтээр тухайн сургалтын сертификат үүсгэнэ.
 * Enrollment COMPLETED байх ёстой.
 */
@Injectable()
export class GenerateCertificateUseCase {
  private readonly logger = new Logger(GenerateCertificateUseCase.name);

  constructor(
    private readonly certificateRepository: CertificateRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    @InjectQueue('certificates') private readonly certificateQueue: Queue,
  ) {}

  async execute(userId: string, courseId: string): Promise<CertificateEntity> {
    /** 1. Элсэлт олдох эсэх шалгах */
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (!enrollment) {
      throw new NotFoundException('Энэ сургалтад элсээгүй байна');
    }

    /** 2. Элсэлт COMPLETED эсэх шалгах */
    if (enrollment.status !== 'completed') {
      throw new BadRequestException(
        'Сургалтыг бүрэн дуусгаагүй байна. Бүх хичээлийг дуусгасны дараа сертификат авах боломжтой.',
      );
    }

    /** 3. Аль хэдийн сертификат байгаа эсэх шалгах */
    const existing = await this.certificateRepository.findByUserAndCourse(userId, courseId);
    if (existing) {
      throw new ConflictException('Энэ сургалтын сертификат аль хэдийн үүсгэгдсэн байна');
    }

    /** 4. Certificate number + verification code үүсгэх (retry 3 удаа) */
    let certificate: CertificateEntity | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        certificate = await this.certificateRepository.create({
          userId,
          courseId,
          certificateNumber: generateCertificateNumber(),
          verificationCode: generateVerificationCode(),
        });
        break;
      } catch (error: any) {
        if (error.code === 'P2002' && attempt < 2) {
          this.logger.warn(`Давхардал илэрлээ, дахин оролдож байна (${attempt + 1}/3)`);
          continue;
        }
        throw error;
      }
    }

    if (!certificate) {
      throw new ConflictException(
        'Сертификатын дугаар үүсгэхэд давхардал гарлаа. Дахин оролдоно уу.',
      );
    }

    /** 5. Bull queue-д PDF + QR үүсгэх job нэмэх */
    await this.certificateQueue.add('generate', {
      certificateId: certificate.id,
    });

    this.logger.log(
      `Сертификат үүсгэх хүсэлт хүлээн авлаа: user=${userId}, course=${courseId}, certificate=${certificate.id}`,
    );

    return certificate;
  }
}
