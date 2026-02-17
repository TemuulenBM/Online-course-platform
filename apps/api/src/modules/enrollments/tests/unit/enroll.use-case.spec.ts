import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EnrollUseCase } from '../../application/use-cases/enroll.use-case';
import { EnrollmentRepository } from '../../infrastructure/repositories/enrollment.repository';
import { EnrollmentCacheService } from '../../infrastructure/services/enrollment-cache.service';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';

describe('EnrollUseCase', () => {
  let useCase: EnrollUseCase;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let courseRepository: jest.Mocked<CourseRepository>;
  let enrollmentCacheService: jest.Mocked<EnrollmentCacheService>;

  const now = new Date();

  /** Тестэд ашиглах mock элсэлт */
  const mockEnrollment = new EnrollmentEntity({
    id: 'enrollment-id-1',
    userId: 'user-id-1',
    courseId: 'course-id-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    courseTitle: 'TypeScript Сургалт',
    courseSlug: 'typescript-surgalt',
  });

  /** Тестэд ашиглах mock сургалт (published) */
  const mockPublishedCourse = new CourseEntity({
    id: 'course-id-1',
    title: 'TypeScript Сургалт',
    slug: 'typescript-surgalt',
    description: 'Тайлбар',
    instructorId: 'instructor-id-1',
    categoryId: 'cat-id-1',
    price: null,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 0,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock сургалт (draft) */
  const mockDraftCourse = new CourseEntity({
    ...mockPublishedCourse,
    status: 'draft',
    publishedAt: null,
  } as any);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollUseCase,
        {
          provide: EnrollmentRepository,
          useValue: {
            create: jest.fn(),
            findByUserAndCourse: jest.fn(),
            getPrerequisiteCourseIds: jest.fn(),
            hasCompletedCourses: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EnrollmentCacheService,
          useValue: {
            invalidateAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<EnrollUseCase>(EnrollUseCase);
    enrollmentRepository = module.get(EnrollmentRepository);
    courseRepository = module.get(CourseRepository);
    enrollmentCacheService = module.get(EnrollmentCacheService);
  });

  it('амжилттай элсэх', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
    enrollmentRepository.getPrerequisiteCourseIds.mockResolvedValue([]);
    enrollmentRepository.create.mockResolvedValue(mockEnrollment);

    const result = await useCase.execute('user-id-1', { courseId: 'course-id-1' });

    expect(result).toEqual(mockEnrollment);
    expect(enrollmentRepository.create).toHaveBeenCalledWith({
      userId: 'user-id-1',
      courseId: 'course-id-1',
    });
  });

  it('сургалт олдоогүй үед NotFoundException', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id-1', { courseId: 'nonexistent' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('нийтлэгдээгүй сургалтад элсэхэд BadRequestException', async () => {
    courseRepository.findById.mockResolvedValue(mockDraftCourse);

    await expect(useCase.execute('user-id-1', { courseId: 'course-id-1' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('аль хэдийн элссэн (active) үед ConflictException', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockEnrollment);

    await expect(useCase.execute('user-id-1', { courseId: 'course-id-1' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('аль хэдийн дуусгасан (completed) үед ConflictException', async () => {
    const completedEnrollment = new EnrollmentEntity({
      ...mockEnrollment,
      status: 'completed',
      completedAt: now,
    } as any);
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(completedEnrollment);

    await expect(useCase.execute('user-id-1', { courseId: 'course-id-1' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('cancelled элсэлттэй үед дахин элсүүлэх (re-enroll)', async () => {
    const cancelledEnrollment = new EnrollmentEntity({
      ...mockEnrollment,
      status: 'cancelled',
    } as any);
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(cancelledEnrollment);
    enrollmentRepository.getPrerequisiteCourseIds.mockResolvedValue([]);
    enrollmentRepository.update.mockResolvedValue(mockEnrollment);

    const result = await useCase.execute('user-id-1', { courseId: 'course-id-1' });

    expect(result).toEqual(mockEnrollment);
    expect(enrollmentRepository.update).toHaveBeenCalledWith('enrollment-id-1', {
      status: 'active',
      completedAt: null,
    });
    expect(enrollmentCacheService.invalidateAll).toHaveBeenCalled();
  });

  it('prerequisite хангагдаагүй үед BadRequestException', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
    enrollmentRepository.getPrerequisiteCourseIds.mockResolvedValue(['prereq-course-1']);
    enrollmentRepository.hasCompletedCourses.mockResolvedValue(false);

    await expect(useCase.execute('user-id-1', { courseId: 'course-id-1' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('prerequisite хангагдсан үед амжилттай элсэх', async () => {
    courseRepository.findById.mockResolvedValue(mockPublishedCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
    enrollmentRepository.getPrerequisiteCourseIds.mockResolvedValue(['prereq-course-1']);
    enrollmentRepository.hasCompletedCourses.mockResolvedValue(true);
    enrollmentRepository.create.mockResolvedValue(mockEnrollment);

    const result = await useCase.execute('user-id-1', { courseId: 'course-id-1' });

    expect(result).toEqual(mockEnrollment);
    expect(enrollmentRepository.hasCompletedCourses).toHaveBeenCalledWith('user-id-1', [
      'prereq-course-1',
    ]);
  });
});
