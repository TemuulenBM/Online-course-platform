import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SystemSettingRepository } from '../../infrastructure/repositories/system-setting.repository';
import { AdminCacheService } from '../../infrastructure/services/admin-cache.service';

/** Нэг тохиргоо key-аар авах use case */
@Injectable()
export class GetSettingUseCase {
  private readonly logger = new Logger(GetSettingUseCase.name);

  constructor(
    private readonly settingRepository: SystemSettingRepository,
    private readonly cacheService: AdminCacheService,
  ) {}

  async execute(key: string) {
    const cached = await this.cacheService.getSetting(key);
    if (cached) return cached;

    const setting = await this.settingRepository.findByKey(key);
    if (!setting) {
      throw new NotFoundException(`Тохиргоо олдсонгүй: ${key}`);
    }

    const response = setting.toResponse();
    await this.cacheService.setSetting(key, response);
    return response;
  }
}
