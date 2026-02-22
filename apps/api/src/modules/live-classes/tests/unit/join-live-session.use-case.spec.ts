import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JoinLiveSessionUseCase } from '../../application/use-cases/join-live-session.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { SessionAttendeeRepository } from '../../infrastructure/repositories/session-attendee.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';
import { AGORA_SERVICE } from '../../domain/interfaces/agora-service.interface';

describe('JoinLiveSessionUseCase', () => {
  let useCase: JoinLiveSessionUseCase;
  let sessionRepo: jest.Mocked<LiveSessionRepository>;
  let attendeeRepo: jest.Mocked<SessionAttendeeRepository>;
  let enrollmentRepo: jest.Mocked<EnrollmentRepository>;

  const now = new Date();

  const mockLiveSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест',
    description: null,
    scheduledStart: now,
    scheduledEnd: new Date(now.getTime() + 3600000),
    actualStart: now,
    actualEnd: null,
    meetingUrl: 'ocp-live-session-1',
    meetingId: 'ocp-live-session-1',
    recordingUrl: null,
    status: 'live',
    createdAt: now,
    updatedAt: now,
    courseId: 'course-1',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JoinLiveSessionUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: SessionAttendeeRepository,
          useValue: { upsert: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: EnrollmentRepository,
          useValue: { findByUserAndCourse: jest.fn() },
        },
        {
          provide: AGORA_SERVICE,
          useValue: {
            generateRtcToken: jest.fn().mockReturnValue('mock-token'),
            generateChannelName: jest.fn().mockReturnValue('ocp-live-session-1'),
          },
        },
      ],
    }).compile();

    useCase = module.get(JoinLiveSessionUseCase);
    sessionRepo = module.get(LiveSessionRepository);
    attendeeRepo = module.get(SessionAttendeeRepository);
    enrollmentRepo = module.get(EnrollmentRepository);
  });

  it('enrolled оюутан амжилттай нэгдэнэ', async () => {
    sessionRepo.findById.mockResolvedValue(mockLiveSession);
    enrollmentRepo.findByUserAndCourse.mockResolvedValue(mockEnrollment);

    const result = await useCase.execute('session-1', 'student-1', 'STUDENT');
    expect(result.token).toBe('mock-token');
    expect(result.channelName).toBe('ocp-live-session-1');
    expect(attendeeRepo.upsert).toHaveBeenCalled();
  });

  it('instructor subscriber биш publisher role-оор нэгдэнэ', async () => {
    sessionRepo.findById.mockResolvedValue(mockLiveSession);
    const agoraService = (useCase as any).agoraService;

    await useCase.execute('session-1', 'instructor-1', 'TEACHER');

    expect(agoraService.generateRtcToken).toHaveBeenCalledWith(
      'ocp-live-session-1',
      expect.any(Number),
      'publisher',
    );
  });

  it('олдоогүй бол NotFoundException', async () => {
    sessionRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('x', 'student-1', 'STUDENT')).rejects.toThrow(NotFoundException);
  });

  it('LIVE биш бол BadRequestException', async () => {
    const scheduled = new LiveSessionEntity({
      ...mockLiveSession,
      status: 'scheduled',
    });
    sessionRepo.findById.mockResolvedValue(scheduled);
    await expect(useCase.execute('session-1', 'student-1', 'STUDENT')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('элсэлтгүй бол ForbiddenException', async () => {
    sessionRepo.findById.mockResolvedValue(mockLiveSession);
    enrollmentRepo.findByUserAndCourse.mockResolvedValue(null);
    await expect(useCase.execute('session-1', 'random-user', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('ADMIN enrollment шалгалтгүй нэгдэнэ', async () => {
    sessionRepo.findById.mockResolvedValue(mockLiveSession);
    const result = await useCase.execute('session-1', 'admin-1', 'ADMIN');
    expect(result.token).toBe('mock-token');
    expect(enrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled();
  });
});
