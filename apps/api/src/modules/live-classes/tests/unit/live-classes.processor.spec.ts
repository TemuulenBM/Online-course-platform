import { Test, TestingModule } from '@nestjs/testing';
import { LiveClassesProcessor } from '../../infrastructure/services/live-classes.processor';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { SessionAttendeeRepository } from '../../infrastructure/repositories/session-attendee.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { NotificationService } from '../../../notifications/application/services/notification.service';
import { LiveClassesCacheService } from '../../infrastructure/services/live-classes-cache.service';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';

describe('LiveClassesProcessor', () => {
  let processor: LiveClassesProcessor;
  let sessionRepo: jest.Mocked<LiveSessionRepository>;
  let attendeeRepo: jest.Mocked<SessionAttendeeRepository>;
  let enrollmentRepo: jest.Mocked<EnrollmentRepository>;
  let notificationService: jest.Mocked<NotificationService>;
  let cacheService: jest.Mocked<LiveClassesCacheService>;

  const now = new Date();

  const mockSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест хичээл',
    description: null,
    scheduledStart: now,
    scheduledEnd: new Date(now.getTime() + 3600000),
    actualStart: now,
    actualEnd: null,
    meetingUrl: null,
    meetingId: null,
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
        LiveClassesProcessor,
        {
          provide: LiveSessionRepository,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
        {
          provide: SessionAttendeeRepository,
          useValue: { markAllLeft: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: EnrollmentRepository,
          useValue: { findByCourseId: jest.fn() },
        },
        {
          provide: NotificationService,
          useValue: { send: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: LiveClassesCacheService,
          useValue: { invalidateSession: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    processor = module.get(LiveClassesProcessor);
    sessionRepo = module.get(LiveSessionRepository);
    attendeeRepo = module.get(SessionAttendeeRepository);
    enrollmentRepo = module.get(EnrollmentRepository);
    notificationService = module.get(NotificationService);
    cacheService = module.get(LiveClassesCacheService);
  });

  describe('handleSessionStarted', () => {
    it('enrolled оюутнуудад notification илгээнэ', async () => {
      sessionRepo.findById.mockResolvedValue(mockSession);
      enrollmentRepo.findByCourseId.mockResolvedValue({
        data: [mockEnrollment],
        total: 1,
        page: 1,
        limit: 1000,
      });

      await processor.handleSessionStarted({
        data: { sessionId: 'session-1', courseId: 'course-1' },
      } as any);

      expect(notificationService.send).toHaveBeenCalledWith(
        'student-1',
        expect.objectContaining({ type: 'IN_APP' }),
      );
    });

    it('алдаа гарсан ч exception шидэхгүй', async () => {
      sessionRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(
        processor.handleSessionStarted({
          data: { sessionId: 'session-1', courseId: 'course-1' },
        } as any),
      ).resolves.not.toThrow();
    });
  });

  describe('handleSessionEnded', () => {
    it('markAllLeft + notification дуудагдана', async () => {
      sessionRepo.findById.mockResolvedValue(mockSession);
      enrollmentRepo.findByCourseId.mockResolvedValue({
        data: [mockEnrollment],
        total: 1,
        page: 1,
        limit: 1000,
      });

      await processor.handleSessionEnded({
        data: { sessionId: 'session-1', courseId: 'course-1' },
      } as any);

      expect(attendeeRepo.markAllLeft).toHaveBeenCalledWith('session-1');
      expect(cacheService.invalidateSession).toHaveBeenCalled();
      expect(notificationService.send).toHaveBeenCalled();
    });
  });

  describe('handleSessionReminder', () => {
    it('scheduled session-д сануулга илгээнэ', async () => {
      const scheduledSession = new LiveSessionEntity({
        ...mockSession,
        status: 'scheduled',
      });
      sessionRepo.findById.mockResolvedValue(scheduledSession);
      enrollmentRepo.findByCourseId.mockResolvedValue({
        data: [mockEnrollment],
        total: 1,
        page: 1,
        limit: 1000,
      });

      await processor.handleSessionReminder({
        data: { sessionId: 'session-1', courseId: 'course-1' },
      } as any);

      expect(notificationService.send).toHaveBeenCalled();
    });

    it('цуцлагдсан session-д сануулга илгээхгүй', async () => {
      const cancelled = new LiveSessionEntity({
        ...mockSession,
        status: 'cancelled',
      });
      sessionRepo.findById.mockResolvedValue(cancelled);

      await processor.handleSessionReminder({
        data: { sessionId: 'session-1', courseId: 'course-1' },
      } as any);

      expect(enrollmentRepo.findByCourseId).not.toHaveBeenCalled();
    });
  });

  describe('handleRecordingReady', () => {
    it('recordingUrl шинэчлэх + instructor notification', async () => {
      sessionRepo.findById.mockResolvedValue(mockSession);
      sessionRepo.update.mockResolvedValue(mockSession);

      await processor.handleRecordingReady({
        data: {
          sessionId: 'session-1',
          recordingUrl: 'https://example.com/rec.mp4',
        },
      } as any);

      expect(sessionRepo.update).toHaveBeenCalledWith('session-1', {
        recordingUrl: 'https://example.com/rec.mp4',
      });
      expect(cacheService.invalidateSession).toHaveBeenCalled();
      expect(notificationService.send).toHaveBeenCalledWith(
        'instructor-1',
        expect.objectContaining({ title: 'Бичлэг бэлэн боллоо' }),
      );
    });

    it('session олдоогүй бол skip', async () => {
      sessionRepo.findById.mockResolvedValue(null);

      await processor.handleRecordingReady({
        data: {
          sessionId: 'nonexist',
          recordingUrl: 'https://example.com/rec.mp4',
        },
      } as any);

      expect(sessionRepo.update).not.toHaveBeenCalled();
    });
  });
});
