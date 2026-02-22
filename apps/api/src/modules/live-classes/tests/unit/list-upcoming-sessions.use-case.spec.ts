import { Test, TestingModule } from '@nestjs/testing';
import { ListUpcomingSessionsUseCase } from '../../application/use-cases/list-upcoming-sessions.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';

describe('ListUpcomingSessionsUseCase', () => {
  let useCase: ListUpcomingSessionsUseCase;
  let repository: jest.Mocked<LiveSessionRepository>;

  const now = new Date();

  const mockSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест',
    description: null,
    scheduledStart: new Date(Date.now() + 3600000),
    scheduledEnd: new Date(Date.now() + 7200000),
    actualStart: null,
    actualEnd: null,
    meetingUrl: null,
    meetingId: null,
    recordingUrl: null,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUpcomingSessionsUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findUpcoming: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(ListUpcomingSessionsUseCase);
    repository = module.get(LiveSessionRepository);
  });

  it('upcoming sessions жагсаалт буцаана', async () => {
    repository.findUpcoming.mockResolvedValue({
      data: [mockSession],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(repository.findUpcoming).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });

  it('хоосон жагсаалт буцаана', async () => {
    repository.findUpcoming.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
