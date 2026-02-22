import { Injectable, Logger } from '@nestjs/common';
import { SystemSettingRepository } from '../../infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';

/** Тохиргоо жагсаалт авах use case */
@Injectable()
export class ListSettingsUseCase {
  private readonly logger = new Logger(ListSettingsUseCase.name);

  constructor(
    private readonly settingRepository: SystemSettingRepository,
    private readonly cacheService: AdminCacheService,
  ) {}

  async execute(params: { category?: string; publicOnly?: boolean }) {
    if (params.publicOnly) {
      const cached =
        await this.cacheService.getPublicSettings<ReturnType<typeof this.formatResponse>>();
      if (cached) return cached;

      const settings = await this.settingRepository.findPublic();
      const response = settings.map((s) => s.toResponse());
      await this.cacheService.setPublicSettings(response);
      return response;
    }

    const cached = await this.cacheService.getSettings<ReturnType<typeof this.formatResponse>>(
      params.category,
    );
    if (cached) return cached;

    const settings = await this.settingRepository.findAll(params.category);
    const response = settings.map((s) => s.toResponse());
    await this.cacheService.setSettings(response, params.category);

    this.logger.debug(`Тохиргоо жагсаалт: ${response.length} олдлоо`);
    return response;
  }

  private formatResponse(_: unknown) {
    return _ as unknown;
  }
}
