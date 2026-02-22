import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateAgoraTokenUseCase } from '../../application/use-cases/generate-agora-token.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';
import { AGORA_SERVICE } from '../../domain/interfaces/agora-service.interface';

describe('GenerateAgoraTokenUseCase', () => {
  let useCase: GenerateAgoraTokenUseCase;
  let sessionRepo: jest.Mocked<LiveSessionRepository>;
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
        GenerateAgoraTokenUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: EnrollmentRepository,
          useValue: { findByUserAndCourse: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-app-id') },
        },
        {
          provide: AGORA_SERVICE,
          useValue: {
            generateRtcToken: jest.fn().mockReturnValue('agora-token'),
            generateChannelName: jest.fn().mockReturnValue('ocp-live-session-1'),
          },
        },
      ],
    }).compile();

    useCase = module.get(GenerateAgoraTokenUseCase);
    sessionRepo = module.get(LiveSessionRepository);
    enrollmentRepo = module.get(EnrollmentRepository);
  });

  it('enrolled оюутанд token буцаана', async () => {
    sessionRepo.findById.mockResolvedValue(mockLiveSession);
    enrollmentRepo.findByUserAndCourse.mockResolvedValue(mockEnrollment);

    const result = await useCase.execute('session-1', 'student-1', 'STUDENT');
    expect(result.token).toBe('agora-token');
    expect(result.channelName).toBe('ocp-live-session-1');
    expect(result.appId).toBe('test-app-id');
  });

  it('instructor-д enrollment шалгалтгүй token буцаана', async () => {
    sessionRepo.findById.mockResolvedValue(mockLiveSession);
    const result = await useCase.execute('session-1', 'instructor-1', 'TEACHER');
    expect(result.token).toBe('agora-token');
    expect(enrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled();
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
});
