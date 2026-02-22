import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetAttendeesUseCase } from '../../application/use-cases/get-attendees.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { SessionAttendeeRepository } from '../../infrastructure/repositories/session-attendee.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { SessionAttendeeEntity } from '../../domain/entities/session-attendee.entity';

describe('GetAttendeesUseCase', () => {
  let useCase: GetAttendeesUseCase;
  let sessionRepo: jest.Mocked<LiveSessionRepository>;
  let attendeeRepo: jest.Mocked<SessionAttendeeRepository>;

  const now = new Date();

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
    status: 'live',
    createdAt: now,
    updatedAt: now,
  });

  const mockAttendee = new SessionAttendeeEntity({
    id: 'att-1',
    liveSessionId: 'session-1',
    userId: 'user-1',
    joinedAt: now,
    leftAt: null,
    durationMinutes: 0,
    createdAt: now,
    userName: 'Test',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAttendeesUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: SessionAttendeeRepository,
          useValue: { findBySessionId: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(GetAttendeesUseCase);
    sessionRepo = module.get(LiveSessionRepository);
    attendeeRepo = module.get(SessionAttendeeRepository);
  });

  it('instructor жагсаалт амжилттай авна', async () => {
    sessionRepo.findById.mockResolvedValue(mockSession);
    attendeeRepo.findBySessionId.mockResolvedValue({
      data: [mockAttendee],
      total: 1,
      page: 1,
      limit: 50,
    });

    const result = await useCase.execute('session-1', 'instructor-1', 'TEACHER', {
      page: 1,
      limit: 50,
    });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('ADMIN мөн адил хандах боломжтой', async () => {
    sessionRepo.findById.mockResolvedValue(mockSession);
    attendeeRepo.findBySessionId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
    });

    const result = await useCase.execute('session-1', 'admin-1', 'ADMIN', {
      page: 1,
      limit: 50,
    });
    expect(result.data).toHaveLength(0);
  });

  it('олдоогүй бол NotFoundException', async () => {
    sessionRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute('x', 'instructor-1', 'TEACHER', { page: 1, limit: 50 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('эрхгүй бол ForbiddenException', async () => {
    sessionRepo.findById.mockResolvedValue(mockSession);
    await expect(
      useCase.execute('session-1', 'other-user', 'STUDENT', {
        page: 1,
        limit: 50,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
