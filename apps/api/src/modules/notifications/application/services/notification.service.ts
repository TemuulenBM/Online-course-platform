import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationPreferenceRepository } from '../../infrastructure/repositories/notification-preference.repository';
import { NotificationCacheService } from '../../infrastructure/services/notification-cache.service';

/**
 * Мэдэгдэл илгээх гол service.
 * Бусад модулиуд (Enrollments, Progress, Quizzes, Certificates, Discussions)
 * энэ service-ийг inject хийж send() / sendBulk() дуудна.
 *
 * Ажиллах дараалал:
 * 1. IN_APP notification DB-д бичих (заавал)
 * 2. User preference шалгах
 * 3. Channel enabled бол Bull Queue-д job нэмэх
 * 4. Unread count кэш invalidate
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly preferenceRepository: NotificationPreferenceRepository,
    private readonly notificationCacheService: NotificationCacheService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Нэг хэрэглэгчид мэдэгдэл илгээх.
   * @param userId Хэрэглэгчийн ID
   * @param payload Мэдэгдлийн мэдээлэл
   * @param payload.type Мэдэгдлийн төрөл
   * @param payload.title Гарчиг
   * @param payload.message Агуулга
   * @param payload.data Нэмэлт мэдээлэл (email, phoneNumber зэрэг)
   */
  async send(
    userId: string,
    payload: {
      type: 'EMAIL' | 'PUSH' | 'IN_APP' | 'SMS';
      title: string;
      message: string;
      data?: Record<string, unknown>;
    },
  ): Promise<void> {
    /** 1. IN_APP notification DB-д бичих */
    const notification = await this.notificationRepository.create({
      userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data || null,
    });

    /** 2. Unread count кэш invalidate */
    await this.notificationCacheService.invalidateUnreadCount(userId);

    /** 3. User preference шалгах */
    const preferences = await this.preferenceRepository.findByUserId(userId);

    /** 4. Email queue нэмэх */
    const emailEnabled = preferences?.emailEnabled ?? true;
    const configEmailEnabled = this.configService.get<boolean>('notification.emailEnabled');
    if (emailEnabled && configEmailEnabled && payload.data?.email) {
      await this.notificationQueue.add('send-email', {
        to: payload.data.email as string,
        subject: payload.title,
        htmlContent: this.wrapEmailHtml(payload.title, payload.message),
        notificationId: notification.id,
      });
    }

    /** 5. SMS queue нэмэх */
    const smsEnabled = preferences?.smsEnabled ?? false;
    const configSmsEnabled = this.configService.get<boolean>('notification.smsEnabled');
    if (smsEnabled && configSmsEnabled && payload.data?.phoneNumber) {
      await this.notificationQueue.add('send-sms', {
        to: payload.data.phoneNumber as string,
        message: payload.message,
        notificationId: notification.id,
      });
    }

    /** 6. Push queue нэмэх */
    const pushEnabled = preferences?.pushEnabled ?? true;
    const configPushEnabled = this.configService.get<boolean>('notification.pushEnabled');
    if (pushEnabled && configPushEnabled) {
      await this.notificationQueue.add('send-push', {
        userId,
        title: payload.title,
        body: payload.message,
        data: payload.data,
        notificationId: notification.id,
      });
    }

    this.logger.log(`Мэдэгдэл илгээгдлээ: userId=${userId}, type=${payload.type}`);
  }

  /**
   * Олон хэрэглэгчид мэдэгдэл илгээх.
   * @param userIds Хэрэглэгчдийн ID-ын массив
   * @param payload Мэдэгдлийн мэдээлэл
   */
  async sendBulk(
    userIds: string[],
    payload: {
      type: 'EMAIL' | 'PUSH' | 'IN_APP' | 'SMS';
      title: string;
      message: string;
      data?: Record<string, unknown>;
    },
  ): Promise<void> {
    await Promise.all(userIds.map((userId) => this.send(userId, payload)));
    this.logger.log(
      `Бөөн мэдэгдэл илгээгдлээ: ${userIds.length} хэрэглэгчид, type=${payload.type}`,
    );
  }

  /** Email HTML wrapper */
  private wrapEmailHtml(title: string, message: string): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">${title}</h2>
  <p style="color: #555; line-height: 1.6;">${message}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #999; font-size: 12px;">Энэ имэйл автоматаар илгээгдсэн болно.</p>
</body>
</html>`;
  }
}
