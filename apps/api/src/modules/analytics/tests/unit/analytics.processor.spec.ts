import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsProcessor } from '../../infrastructure/services/analytics.processor';
import { AnalyticsEventRepository } from '../../infrastructure/repositories/analytics-event.repository';
import { Job } from 'bull';
import { AnalyticsEventEntity } from '../../domain/entities/analytics-event.entity';

describe('AnalyticsProcessor', () => {
  let processor: AnalyticsProcessor;
  let repository: jest.Mocked<AnalyticsEventRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsProcessor,
        {
          provide: AnalyticsEventRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<AnalyticsProcessor>(AnalyticsProcessor);
    repository = module.get(AnalyticsEventRepository);
  });

  it('track-event job-ийг зөв боловсруулж event үүсгэнэ', async () => {
    const mockJob = {
      data: {
        userId: 'user-1',
        eventName: 'page_view',
        eventCategory: 'navigation',
        properties: { path: '/courses' },
        sessionId: 'sess-123',
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
      },
    } as Job;

    repository.create.mockResolvedValue(
      new AnalyticsEventEntity({
        id: 'event-1',
        userId: 'user-1',
        eventName: 'page_view',
        eventCategory: 'navigation',
        properties: { path: '/courses' },
        sessionId: 'sess-123',
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
        createdAt: new Date(),
      }),
    );

    await processor.handleTrackEvent(mockJob);

    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      eventName: 'page_view',
      eventCategory: 'navigation',
      properties: { path: '/courses' },
      sessionId: 'sess-123',
      ipAddress: '127.0.0.1',
      userAgent: 'Chrome',
    });
  });

  it('алдаа гарсан ч exception шидэхгүй (graceful handling)', async () => {
    const mockJob = {
      data: {
        eventName: 'error_test',
        eventCategory: 'test',
      },
    } as Job;

    repository.create.mockRejectedValue(new Error('DB connection failed'));

    /** Exception шидэхгүй — processor алдааг log хийж алгасна */
    await expect(processor.handleTrackEvent(mockJob)).resolves.not.toThrow();
  });

  it('userId null байх үед (anonymous event) зөв боловсруулна', async () => {
    const mockJob = {
      data: {
        userId: null,
        eventName: 'page_view',
        eventCategory: 'navigation',
        properties: null,
        sessionId: null,
        ipAddress: null,
        userAgent: null,
      },
    } as Job;

    repository.create.mockResolvedValue(
      new AnalyticsEventEntity({
        id: 'event-2',
        userId: null,
        eventName: 'page_view',
        eventCategory: 'navigation',
        properties: null,
        sessionId: null,
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
      }),
    );

    await processor.handleTrackEvent(mockJob);

    expect(repository.create).toHaveBeenCalledWith({
      userId: null,
      eventName: 'page_view',
      eventCategory: 'navigation',
      properties: null,
      sessionId: null,
      ipAddress: null,
      userAgent: null,
    });
  });
});
