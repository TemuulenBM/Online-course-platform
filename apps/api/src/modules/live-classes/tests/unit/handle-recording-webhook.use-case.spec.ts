import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { HandleRecordingWebhookUseCase } from '../../application/use-cases/handle-recording-webhook.use-case';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import * as crypto from 'crypto';

describe('HandleRecordingWebhookUseCase', () => {
  let useCase: HandleRecordingWebhookUseCase;
  let repository: jest.Mocked<LiveSessionRepository>;
  let mockQueue: { add: jest.Mock };

  const now = new Date();
  const webhookSecret = 'test-secret';

  const mockSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест',
    description: null,
    scheduledStart: now,
    scheduledEnd: new Date(now.getTime() + 3600000),
    actualStart: now,
    actualEnd: now,
    meetingUrl: null,
    meetingId: null,
    recordingUrl: null,
    status: 'ended',
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    mockQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleRecordingWebhookUseCase,
        {
          provide: LiveSessionRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(webhookSecret) },
        },
        { provide: getQueueToken('live-classes'), useValue: mockQueue },
      ],
    }).compile();

    useCase = module.get(HandleRecordingWebhookUseCase);
    repository = module.get(LiveSessionRepository);
  });

  it('амжилттай webhook боловсруулна', async () => {
    const dto = {
      channelName: 'ocp-live-session-1',
      recordingUrl: 'https://example.com/recording.mp4',
    };
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(dto))
      .digest('hex');

    repository.findById.mockResolvedValue(mockSession);

    await useCase.execute(dto, signature);

    expect(mockQueue.add).toHaveBeenCalledWith('recording-ready', {
      sessionId: 'session-1',
      recordingUrl: 'https://example.com/recording.mp4',
    });
  });

  it('буруу signature бол BadRequestException', async () => {
    const dto = {
      channelName: 'ocp-live-session-1',
      recordingUrl: 'https://example.com/recording.mp4',
    };

    await expect(useCase.execute(dto, 'wrong-signature')).rejects.toThrow(BadRequestException);
  });

  it('session олдоогүй бол queue-д нэмэхгүй', async () => {
    const dto = {
      channelName: 'ocp-live-nonexist',
      recordingUrl: 'https://example.com/recording.mp4',
    };
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(dto))
      .digest('hex');

    repository.findById.mockResolvedValue(null);

    await useCase.execute(dto, signature);
    expect(mockQueue.add).not.toHaveBeenCalled();
  });
});
