import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import { EnrollDto } from '../../dto/enroll.dto';

/**
 * Сургалтад элсэх use case.
 * Сургалтын байдал, давхар элсэлт, prerequisite зэргийг шалгана.
 */
@Injectable()
export class EnrollUseCase {
  private readonly logger = new Logger(EnrollUseCase.name);

  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentCacheService: EnrollmentCacheService,
  ) {}

  async execute(userId: string, dto: EnrollDto): Promise<EnrollmentEntity> {
    /** 1. Сургалт олдох эсэх шалгах */
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** 2. Сургалт PUBLISHED эсэх шалгах */
    if (course.status !== 'published') {
      throw new BadRequestException('Зөвхөн нийтлэгдсэн сургалтад элсэх боломжтой');
    }

    /** 3. Аль хэдийн элссэн эсэх шалгах */
    const existing = await this.enrollmentRepository.findByUserAndCourse(userId, dto.courseId);
    if (existing && (existing.status === 'active' || existing.status === 'completed')) {
      throw new ConflictException('Та энэ сургалтад аль хэдийн элссэн байна');
    }

    /** 4. Prerequisites шалгах */
    const prerequisiteIds = await this.enrollmentRepository.getPrerequisiteCourseIds(dto.courseId);
    if (prerequisiteIds.length > 0) {
      const hasCompleted = await this.enrollmentRepository.hasCompletedCourses(userId, prerequisiteIds);
      if (!hasCompleted) {
        throw new BadRequestException('Урьдчилсан шаардлага хангагдаагүй байна. Шаардлагатай сургалтуудыг дуусгана уу');
      }
    }

    /** 5. Cancelled/expired элсэлт байвал дахин элсүүлэх */
    if (existing && (existing.status === 'cancelled' || existing.status === 'expired')) {
      const reEnrolled = await this.enrollmentRepository.update(existing.id, {
        status: 'active',
        completedAt: null,
      });
      await this.enrollmentCacheService.invalidateAll(existing.id, userId, dto.courseId);
      this.logger.log(`Дахин элсэлт: ${existing.id} — хэрэглэгч: ${userId}, сургалт: ${dto.courseId}`);
      return reEnrolled;
    }

    /** 6. Шинэ элсэлт үүсгэх */
    const enrollment = await this.enrollmentRepository.create({
      userId,
      courseId: dto.courseId,
    });

    this.logger.log(`Элсэлт үүсгэгдлээ: ${enrollment.id} — хэрэглэгч: ${userId}, сургалт: ${dto.courseId}`);
    return enrollment;
  }
}
