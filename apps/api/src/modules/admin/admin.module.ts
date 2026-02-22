import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { AuditLogController } from './interface/controllers/audit-log.controller';
import { SystemSettingsController } from './interface/controllers/system-settings.controller';
import { AdminDashboardController } from './interface/controllers/admin-dashboard.controller';

// Use Cases — Audit Log
import { CreateAuditLogUseCase } from './application/use-cases/create-audit-log.use-case';
import { ListAuditLogsUseCase } from './application/use-cases/list-audit-logs.use-case';
import { GetAuditLogUseCase } from './application/use-cases/get-audit-log.use-case';
import { GetEntityAuditTrailUseCase } from './application/use-cases/get-entity-audit-trail.use-case';

// Use Cases — System Settings
import { ListSettingsUseCase } from './application/use-cases/list-settings.use-case';
import { GetSettingUseCase } from './application/use-cases/get-setting.use-case';
import { UpsertSettingUseCase } from './application/use-cases/upsert-setting.use-case';
import { DeleteSettingUseCase } from './application/use-cases/delete-setting.use-case';

// Use Cases — Moderation
import { ListFlaggedContentUseCase } from './application/use-cases/list-flagged-content.use-case';
import { ReviewFlaggedContentUseCase } from './application/use-cases/review-flagged-content.use-case';
import { GetModerationStatsUseCase } from './application/use-cases/get-moderation-stats.use-case';

// Use Cases — Dashboard
import { GetSystemHealthUseCase } from './application/use-cases/get-system-health.use-case';
import { GetPlatformStatsUseCase } from './application/use-cases/get-platform-stats.use-case';
import { GetPendingItemsUseCase } from './application/use-cases/get-pending-items.use-case';
import { GetRecentActivityUseCase } from './application/use-cases/get-recent-activity.use-case';

// Infrastructure
import { AuditLogRepository } from './infrastructure/repositories/audit-log.repository';
import { SystemSettingRepository } from './infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from './infrastructure/services/admin-cache.service';
import { AuditLogService } from './infrastructure/services/audit-log.service';
import { AdminProcessor } from './infrastructure/services/admin.processor';

// Бусад модулиудын repository/service-ийг авахын тулд import
import { DiscussionsModule } from '../discussions/discussions.module';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * Admin модуль.
 * Audit logging, системийн тохиргоо, контент moderation,
 * admin dashboard функционалуудыг хангана.
 * AuditLogService-г export хийж бусад модулиуд ашиглах боломжтой.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: 'admin' }),
    ConfigModule,
    DiscussionsModule,
    NotificationsModule,
  ],
  controllers: [AuditLogController, SystemSettingsController, AdminDashboardController],
  providers: [
    // Use Cases — Audit Log
    CreateAuditLogUseCase,
    ListAuditLogsUseCase,
    GetAuditLogUseCase,
    GetEntityAuditTrailUseCase,
    // Use Cases — System Settings
    ListSettingsUseCase,
    GetSettingUseCase,
    UpsertSettingUseCase,
    DeleteSettingUseCase,
    // Use Cases — Moderation
    ListFlaggedContentUseCase,
    ReviewFlaggedContentUseCase,
    GetModerationStatsUseCase,
    // Use Cases — Dashboard
    GetSystemHealthUseCase,
    GetPlatformStatsUseCase,
    GetPendingItemsUseCase,
    GetRecentActivityUseCase,
    // Infrastructure
    AuditLogRepository,
    SystemSettingRepository,
    AdminCacheService,
    AuditLogService,
    AdminProcessor,
  ],
  exports: [AuditLogService],
})
export class AdminModule {}
