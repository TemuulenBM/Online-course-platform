import { Processor, Process } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { IEmailService, EMAIL_SERVICE } from './email.service';
import { ISmsService, SMS_SERVICE } from './sms.service';
import { IPushService, PUSH_SERVICE } from './push.service';

/**
 * Мэдэгдэл илгээх Bull Queue processor.
 * Background-д email, SMS, push notification илгээнэ.
 */
@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(SMS_SERVICE) private readonly smsService: ISmsService,
    @Inject(PUSH_SERVICE) private readonly pushService: IPushService,
    private readonly configService: ConfigService,
  ) {}

  /** Email илгээх process */
  @Process('send-email')
  async handleSendEmail(
    job: Job<{
      to: string;
      subject: string;
      htmlContent: string;
      notificationId: string;
    }>,
  ): Promise<void> {
    const { to, subject, htmlContent, notificationId } = job.data;
    this.logger.log(`Email илгээж эхэллээ: ${to} (notification: ${notificationId})`);

    const emailEnabled = this.configService.get<boolean>('notification.emailEnabled');
    if (!emailEnabled) {
      this.logger.debug('Email илгээлт идэвхгүй болсон (config)');
      return;
    }

    await this.emailService.sendEmail(to, subject, htmlContent);
  }

  /** SMS илгээх process */
  @Process('send-sms')
  async handleSendSms(
    job: Job<{
      to: string;
      message: string;
      notificationId: string;
    }>,
  ): Promise<void> {
    const { to, message, notificationId } = job.data;
    this.logger.log(`SMS илгээж эхэллээ: ${to} (notification: ${notificationId})`);

    const smsEnabled = this.configService.get<boolean>('notification.smsEnabled');
    if (!smsEnabled) {
      this.logger.debug('SMS илгээлт идэвхгүй болсон (config)');
      return;
    }

    await this.smsService.sendSms(to, message);
  }

  /** Push notification илгээх process */
  @Process('send-push')
  async handleSendPush(
    job: Job<{
      userId: string;
      title: string;
      body: string;
      data?: Record<string, unknown>;
      notificationId: string;
    }>,
  ): Promise<void> {
    const { userId, title, body, data, notificationId } = job.data;
    this.logger.log(`Push илгээж эхэллээ: userId=${userId} (notification: ${notificationId})`);

    const pushEnabled = this.configService.get<boolean>('notification.pushEnabled');
    if (!pushEnabled) {
      this.logger.debug('Push notification илгээлт идэвхгүй болсон (config)');
      return;
    }

    await this.pushService.sendPush(userId, title, body, data);
  }
}
