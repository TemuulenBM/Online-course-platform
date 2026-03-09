import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { DlqListenerService } from '../dlq.listener';
import { DlqService } from '../dlq.service';

describe('DlqListenerService', () => {
  let listener: DlqListenerService;
  let dlqService: jest.Mocked<DlqService>;

  const queueNames = [
    'payments',
    'certificates',
    'notifications',
    'analytics',
    'admin',
    'live-classes',
  ];

  /** Queue mock — on() callback хадгалж, дараа нь дуудна */
  const mockQueues: Record<
    string,
    { on: jest.Mock; handlers: Record<string, (...args: unknown[]) => void> }
  > = {};

  beforeEach(async () => {
    for (const name of queueNames) {
      const handlers: Record<string, (...args: unknown[]) => void> = {};
      mockQueues[name] = {
        on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
          handlers[event] = handler;
        }),
        handlers,
      };
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DlqListenerService,
        {
          provide: DlqService,
          useValue: { handleDeadLetter: jest.fn().mockResolvedValue(undefined) },
        },
        ...queueNames.map((name) => ({
          provide: getQueueToken(name),
          useValue: mockQueues[name],
        })),
      ],
    }).compile();

    listener = module.get<DlqListenerService>(DlqListenerService);
    dlqService = module.get(DlqService);
  });

  it('onModuleInit — бүх queue-д failed listener бүртгэнэ', () => {
    listener.onModuleInit();

    for (const name of queueNames) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      expect(mockQueues[name].on).toHaveBeenCalledWith('failed', expect.any(Function));
    }
  });

  it('бүх retry дууссан job-г DLQ-д дамжуулна', () => {
    listener.onModuleInit();

    const mockJob = {
      id: '1',
      name: 'payment-approved',
      attemptsMade: 3,
      opts: { attempts: 3 },
    };
    const mockError = new Error('timeout');

    // payments queue-ийн failed handler дуудна
    const handler = mockQueues['payments'].handlers['failed'];
    handler(mockJob, mockError);

    expect(dlqService.handleDeadLetter).toHaveBeenCalledWith('payments', mockJob, mockError);
  });

  it('retry дуусаагүй job-г DLQ-д дамжуулахгүй', () => {
    listener.onModuleInit();

    const mockJob = {
      id: '1',
      name: 'payment-approved',
      attemptsMade: 1,
      opts: { attempts: 3 },
    };
    const mockError = new Error('timeout');

    const handler = mockQueues['payments'].handlers['failed'];
    handler(mockJob, mockError);

    expect(dlqService.handleDeadLetter).not.toHaveBeenCalled();
  });
});
