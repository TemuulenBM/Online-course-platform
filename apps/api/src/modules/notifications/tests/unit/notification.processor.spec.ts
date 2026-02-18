import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { NotificationProcessor } from '../../infrastructure/services/notification.processor';
import { IEmailService, EMAIL_SERVICE } from '../../infrastructure/services/email.service';
import { ISmsService, SMS_SERVICE } from '../../infrastructure/services/sms.service';
import { IPushService, PUSH_SERVICE } from '../../infrastructure/services/push.service';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let emailService: jest.Mocked<IEmailService>;
  let smsService: jest.Mocked<ISmsService>;
  let pushService: jest.Mocked<IPushService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        {
          provide: EMAIL_SERVICE,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: SMS_SERVICE,
          useValue: {
            sendSms: jest.fn(),
          },
        },
        {
          provide: PUSH_SERVICE,
          useValue: {
            sendPush: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    emailService = module.get(EMAIL_SERVICE);
    smsService = module.get(SMS_SERVICE);
    pushService = module.get(PUSH_SERVICE);
    configService = module.get(ConfigService);
  });

  /** Mock Job үүсгэх helper */
  function createMockJob<T>(data: T): Job<T> {
    return { data } as Job<T>;
  }

  describe('handleSendEmail', () => {
    const emailJobData = {
      to: 'test@test.com',
      subject: 'Test subject',
      htmlContent: '<h1>Test</h1>',
      notificationId: 'notif-1',
    };

    it('config идэвхтэй бол email илгээх', async () => {
      configService.get.mockReturnValue(true);

      await processor.handleSendEmail(createMockJob(emailJobData));

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        'test@test.com',
        'Test subject',
        '<h1>Test</h1>',
      );
    });

    it('config идэвхгүй бол email илгээхгүй', async () => {
      configService.get.mockReturnValue(false);

      await processor.handleSendEmail(createMockJob(emailJobData));

      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('handleSendSms', () => {
    const smsJobData = {
      to: '+97699999999',
      message: 'Test SMS',
      notificationId: 'notif-2',
    };

    it('config идэвхтэй бол SMS илгээх', async () => {
      configService.get.mockReturnValue(true);

      await processor.handleSendSms(createMockJob(smsJobData));

      expect(smsService.sendSms).toHaveBeenCalledWith('+97699999999', 'Test SMS');
    });

    it('config идэвхгүй бол SMS илгээхгүй', async () => {
      configService.get.mockReturnValue(false);

      await processor.handleSendSms(createMockJob(smsJobData));

      expect(smsService.sendSms).not.toHaveBeenCalled();
    });
  });

  describe('handleSendPush', () => {
    const pushJobData = {
      userId: 'user-1',
      title: 'Push title',
      body: 'Push body',
      data: { courseId: 'course-1' },
      notificationId: 'notif-3',
    };

    it('config идэвхтэй бол push илгээх', async () => {
      configService.get.mockReturnValue(true);

      await processor.handleSendPush(createMockJob(pushJobData));

      expect(pushService.sendPush).toHaveBeenCalledWith('user-1', 'Push title', 'Push body', {
        courseId: 'course-1',
      });
    });

    it('config идэвхгүй бол push илгээхгүй', async () => {
      configService.get.mockReturnValue(false);

      await processor.handleSendPush(createMockJob(pushJobData));

      expect(pushService.sendPush).not.toHaveBeenCalled();
    });

    it('data байхгүй бол undefined дамжуулах', async () => {
      configService.get.mockReturnValue(true);
      const jobWithoutData = {
        userId: 'user-1',
        title: 'Push title',
        body: 'Push body',
        notificationId: 'notif-4',
      };

      await processor.handleSendPush(createMockJob(jobWithoutData));

      expect(pushService.sendPush).toHaveBeenCalledWith(
        'user-1',
        'Push title',
        'Push body',
        undefined,
      );
    });
  });
});
