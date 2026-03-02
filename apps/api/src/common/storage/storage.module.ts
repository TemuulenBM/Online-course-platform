import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from '../../modules/content/infrastructure/services/storage/local-storage.service';
import { STORAGE_SERVICE } from '../../modules/content/infrastructure/services/storage/storage.interface';
import { R2StorageService } from './r2-storage.service';

/**
 * Storage модуль — @Global() тул бүх модулиас STORAGE_SERVICE token-г ашиглах боломжтой.
 * STORAGE_PROVIDER=r2 → R2StorageService (Cloudflare R2, production)
 * STORAGE_PROVIDER=local эсвэл тохируулаагүй → LocalStorageService (хөгжүүлэлт)
 *
 * Content, Certificates, Payments модулиуд тус тусдаа provider тохируулах шаардлагагүй болно.
 */
@Global()
@Module({
  providers: [
    LocalStorageService,
    R2StorageService,
    {
      provide: STORAGE_SERVICE,
      useFactory: (configService: ConfigService): LocalStorageService | R2StorageService => {
        const provider = configService.get<string>('storage.provider');
        if (provider === 'r2') {
          return new R2StorageService(configService);
        }
        return new LocalStorageService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
