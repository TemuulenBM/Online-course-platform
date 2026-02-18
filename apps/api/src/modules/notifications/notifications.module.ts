import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

// Controller
import { NotificationsController } from './interface/controllers/notifications.controller';

// Use Cases
import { ListNotificationsUseCase } from './application/use-cases/list-notifications.use-case';
import { GetUnreadCountUseCase } from './application/use-cases/get-unread-count.use-case';
import { MarkAsReadUseCase } from './application/use-cases/mark-as-read.use-case';
import { MarkAllReadUseCase } from './application/use-cases/mark-all-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { GetPreferencesUseCase } from './application/use-cases/get-preferences.use-case';
import { UpdatePreferencesUseCase } from './application/use-cases/update-preferences.use-case';

// Service
import { NotificationService } from './application/services/notification.service';

// Infrastructure
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { NotificationPreferenceRepository } from './infrastructure/repositories/notification-preference.repository';
import { NotificationCacheService } from './infrastructure/services/notification-cache.service';
import { NotificationProcessor } from './infrastructure/services/notification.processor';
import { EMAIL_SERVICE, SendGridEmailService } from './infrastructure/services/email.service';
import { SMS_SERVICE, PlaceholderSmsService } from './infrastructure/services/sms.service';
import { PUSH_SERVICE, PlaceholderPushService } from './infrastructure/services/push.service';

/**
 * Notifications модуль.
 * In-app мэдэгдэл хадгалах, Bull Queue-ээр email/SMS/push илгээх,
 * хэрэглэгчийн тохиргоо удирдах. NotificationService-г export хийж
 * бусад модулиуд send()/sendBulk() дуудах боломжтой.
 */
@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' }), ConfigModule],
  controllers: [NotificationsController],
  providers: [
    // Use Cases
    ListNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkAsReadUseCase,
    MarkAllReadUseCase,
    DeleteNotificationUseCase,
    GetPreferencesUseCase,
    UpdatePreferencesUseCase,
    // Service
    NotificationService,
    // Infrastructure
    NotificationRepository,
    NotificationPreferenceRepository,
    NotificationCacheService,
    NotificationProcessor,
    // DI Tokens — Channel Services
    { provide: EMAIL_SERVICE, useClass: SendGridEmailService },
    { provide: SMS_SERVICE, useClass: PlaceholderSmsService },
    { provide: PUSH_SERVICE, useClass: PlaceholderPushService },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
