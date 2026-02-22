import { Test, TestingModule } from '@nestjs/testing';
import { LeaveLiveSessionUseCase } from '../../application/use-cases/leave-live-session.use-case';
import { SessionAttendeeRepository } from '../../infrastructure/repositories/session-attendee.repository';
import { SessionAttendeeEntity } from '../../domain/entities/session-attendee.entity';

describe('LeaveLiveSessionUseCase', () => {
  let useCase: LeaveLiveSessionUseCase;
  let attendeeRepo: jest.Mocked<SessionAttendeeRepository>;

  const now = new Date();

  const mockAttendee = new SessionAttendeeEntity({
    id: 'att-1',
    liveSessionId: 'session-1',
    userId: 'user-1',
    joinedAt: now,
    leftAt: now,
    durationMinutes: 30,
    createdAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveLiveSessionUseCase,
        {
          provide: SessionAttendeeRepository,
          useValue: { markLeft: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(LeaveLiveSessionUseCase);
    attendeeRepo = module.get(SessionAttendeeRepository);
  });

  it('амжилттай гарах — durationMinutes буцаана', async () => {
    attendeeRepo.markLeft.mockResolvedValue(mockAttendee);
    const result = await useCase.execute('session-1', 'user-1');
    expect(result.durationMinutes).toBe(30);
  });

  it('олдоогүй бол 0 буцаана', async () => {
    attendeeRepo.markLeft.mockResolvedValue(null);
    const result = await useCase.execute('session-1', 'unknown');
    expect(result.durationMinutes).toBe(0);
  });
});
