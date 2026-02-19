import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { TrackEventUseCase } from '../../application/use-cases/track-event.use-case';
import { TrackEventDto } from '../../dto/track-event.dto';

describe('TrackEventUseCase', () => {
  let useCase: TrackEventUseCase;
  let queue: { add: jest.Mock };

  /** Тестэд ашиглах mock DTO */
  const mockDto: TrackEventDto = {
    eventName: 'page_view',
    eventCategory: 'learning',
    properties: { courseId: 'course-1', lessonId: 'lesson-1' },
    sessionId: 'session-abc-123',
  };

  /** Тестэд ашиглах mock context — нэвтэрсэн хэрэглэгч */
  const mockContext = {
    userId: 'user-1',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
  };

  beforeEach(async () => {
    queue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackEventUseCase,
        {
          provide: getQueueToken('analytics'),
          useValue: queue,
        },
      ],
    }).compile();

    useCase = module.get<TrackEventUseCase>(TrackEventUseCase);
  });

  it('event-ийг зөв өгөгдөлтэйгээр queue-д нэмэх', async () => {
    const result = await useCase.execute(mockDto, mockContext);

    expect(result).toEqual({ queued: true });
    expect(queue.add).toHaveBeenCalledWith('track-event', {
      userId: 'user-1',
      eventName: 'page_view',
      eventCategory: 'learning',
      properties: { courseId: 'course-1', lessonId: 'lesson-1' },
      sessionId: 'session-abc-123',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });
    expect(queue.add).toHaveBeenCalledTimes(1);
  });

  it('userId null байх үед (нэвтрээгүй хэрэглэгч) queue-д null илгээх', async () => {
    const anonymousContext = {
      userId: null,
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120',
    };

    const result = await useCase.execute(mockDto, anonymousContext);

    expect(result).toEqual({ queued: true });
    expect(queue.add).toHaveBeenCalledWith('track-event', {
      userId: null,
      eventName: 'page_view',
      eventCategory: 'learning',
      properties: { courseId: 'course-1', lessonId: 'lesson-1' },
      sessionId: 'session-abc-123',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120',
    });
  });

  it('userId undefined байх үед null-р орлуулах', async () => {
    const undefinedContext = {
      userId: undefined,
      ipAddress: undefined,
      userAgent: undefined,
    };

    await useCase.execute(mockDto, undefinedContext);

    expect(queue.add).toHaveBeenCalledWith(
      'track-event',
      expect.objectContaining({
        userId: null,
        ipAddress: null,
        userAgent: null,
      }),
    );
  });

  it('properties болон sessionId байхгүй үед null илгээх', async () => {
    const minimalDto: TrackEventDto = {
      eventName: 'logout',
      eventCategory: 'user_auth',
    };

    await useCase.execute(minimalDto, mockContext);

    expect(queue.add).toHaveBeenCalledWith(
      'track-event',
      expect.objectContaining({
        properties: null,
        sessionId: null,
      }),
    );
  });
});
