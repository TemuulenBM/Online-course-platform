import { Injectable, Logger } from '@nestjs/common';
import { SystemSettingRepository } from '../../infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';

/** Тохиргоо upsert (үүсгэх/шинэчлэх) use case */
@Injectable()
export class UpsertSettingUseCase {
  private readonly logger = new Logger(UpsertSettingUseCase.name);

  constructor(
    private readonly settingRepository: SystemSettingRepository,
    private readonly cacheService: AdminCacheService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(
    key: string,
    data: {
      value: unknown;
      description?: string;
      category?: string;
      isPublic?: boolean;
    },
    userId: string,
  ) {
    /** Хуучин утга авах (audit log-д before/after хадгалахад) */
    const existing = await this.settingRepository.findByKey(key);

    const setting = await this.settingRepository.upsert(key, {
      ...data,
      updatedBy: userId,
    });

    /** Кэш invalidate */
    await this.cacheService.invalidateSettings(key);

    /** Audit log бүртгэх */
    await this.auditLogService.log({
      userId,
      action: existing ? 'UPDATE' : 'CREATE',
      entityType: 'SYSTEM_SETTING',
      entityId: setting.id,
      changes: {
        before: existing ? existing.toResponse() : null,
        after: setting.toResponse(),
      },
    });

    this.logger.debug(`Тохиргоо ${existing ? 'шинэчлэгдлээ' : 'үүсгэгдлээ'}: ${key}`);
    return setting.toResponse();
  }
}
