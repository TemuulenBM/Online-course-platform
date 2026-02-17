import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentController } from './interface/controllers/enrollment.controller';
import { EnrollUseCase } from './application/use-cases/enroll.use-case';
import { ListMyEnrollmentsUseCase } from './application/use-cases/list-my-enrollments.use-case';
import { ListCourseEnrollmentsUseCase } from './application/use-cases/list-course-enrollments.use-case';
import { CheckEnrollmentUseCase } from './application/use-cases/check-enrollment.use-case';
import { GetEnrollmentUseCase } from './application/use-cases/get-enrollment.use-case';
import { CancelEnrollmentUseCase } from './application/use-cases/cancel-enrollment.use-case';
import { CompleteEnrollmentUseCase } from './application/use-cases/complete-enrollment.use-case';
import { DeleteEnrollmentUseCase } from './application/use-cases/delete-enrollment.use-case';
import { EnrollmentRepository } from './infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from './infrastructure/services/enrollment-cache.service';

@Module({
  imports: [CoursesModule],
  controllers: [EnrollmentController],
  providers: [
    // Use Cases
    EnrollUseCase,
    ListMyEnrollmentsUseCase,
    ListCourseEnrollmentsUseCase,
    CheckEnrollmentUseCase,
    GetEnrollmentUseCase,
    CancelEnrollmentUseCase,
    CompleteEnrollmentUseCase,
    DeleteEnrollmentUseCase,
    // Infrastructure
    EnrollmentRepository,
    EnrollmentCacheService,
  ],
  exports: [EnrollmentRepository],
})
export class EnrollmentsModule {}
