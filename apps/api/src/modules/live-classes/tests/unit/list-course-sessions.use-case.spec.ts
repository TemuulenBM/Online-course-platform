import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListCourseSessionsUseCase } from '../../application/use-cases/list-course-sessions.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

describe('ListCourseSessionsUseCase', () => {
  let useCase: ListCourseSessionsUseCase;
  let sessionRepo: jest.Mocked<LiveSessionRepository>;
  let courseRepo: jest.Mocked<CourseRepository>;
  let enrollmentRepo: jest.Mocked<EnrollmentRepository>;

  const now = new Date();

  const mockCourse = new CourseEntity({
    id: 'course-1',
    title: 'Тест',
    slug: 'test',
    description: '',
    instructorId: 'instructor-1',
    categoryId: 'cat-1',
    price: 50000,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 120,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const mockEnrollment = new EnrollmentEntity({
    id: 'enr-1',
    userId: 'student-1',
    courseId: 'course-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const mockSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест',
    description: null,
    scheduledStart: now,
    scheduledEnd: new Date(now.getTime() + 3600000),
    actualStart: null,
    actualEnd: null,
    meetingUrl: null,
    meetingId: null,
    recordingUrl: null,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  });

  const opts = { page: 1, limit: 20, status: undefined, timeFilter: 'all' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCourseSessionsUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findByCourseId: jest.fn() },
        },
        {
          provide: CourseRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: EnrollmentRepository,
          useValue: { findByUserAndCourse: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(ListCourseSessionsUseCase);
    sessionRepo = module.get(LiveSessionRepository);
    courseRepo = module.get(CourseRepository);
    enrollmentRepo = module.get(EnrollmentRepository);
  });

  it('instructor жагсаалт авна — enrollment шалгалтгүй', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);
    sessionRepo.findByCourseId.mockResolvedValue({
      data: [mockSession],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('course-1', 'instructor-1', 'TEACHER', opts);
    expect(result.data).toHaveLength(1);
    expect(enrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled();
  });

  it('ADMIN enrollment шалгалтгүй', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);
    sessionRepo.findByCourseId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await useCase.execute('course-1', 'admin-1', 'ADMIN', opts);
    expect(enrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled();
  });

  it('enrolled оюутан хандах боломжтой', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);
    enrollmentRepo.findByUserAndCourse.mockResolvedValue(mockEnrollment);
    sessionRepo.findByCourseId.mockResolvedValue({
      data: [mockSession],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('course-1', 'student-1', 'STUDENT', opts);
    expect(result.data).toHaveLength(1);
  });

  it('сургалт олдоогүй бол NotFoundException', async () => {
    courseRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('x', 'user-1', 'STUDENT', opts)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('элсэлтгүй оюутан ForbiddenException', async () => {
    courseRepo.findById.mockResolvedValue(mockCourse);
    enrollmentRepo.findByUserAndCourse.mockResolvedValue(null);
    await expect(useCase.execute('course-1', 'random', 'STUDENT', opts)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
