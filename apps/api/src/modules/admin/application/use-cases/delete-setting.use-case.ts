import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SystemSettingRepository } from '../../infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';

/** Тохиргоо устгах use case */
@Injectable()
export class DeleteSettingUseCase {
  private readonly logger = new Logger(DeleteSettingUseCase.name);

  constructor(
    private readonly settingRepository: SystemSettingRepository,
    private readonly cacheService: AdminCacheService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(key: string, userId: string) {
    const existing = await this.settingRepository.findByKey(key);
    if (!existing) {
      throw new NotFoundException(`Тохиргоо олдсонгүй: ${key}`);
    }

    await this.settingRepository.delete(key);

    /** Кэш invalidate */
    await this.cacheService.invalidateSettings(key);

    /** Audit log бүртгэх */
    await this.auditLogService.log({
      userId,
      action: 'DELETE',
      entityType: 'SYSTEM_SETTING',
      entityId: existing.id,
      changes: { before: existing.toResponse(), after: null },
    });

    this.logger.debug(`Тохиргоо устгагдлаа: ${key}`);
  }
}
