import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageService } from './storage.interface';

/**
 * Локал файл хадгалалтын сервис.
 * Хөгжүүлэлтийн орчинд ашиглах — файлыг дискэнд хадгалж,
 * /uploads/ prefix-тэй URL буцаана.
 */
@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('storage.localUploadDir') || './uploads';
  }

  /** Файл upload хийж локал дискэнд хадгална */
  async upload(
    file: Express.Multer.File,
    filePath: string,
  ): Promise<{ url: string; sizeBytes: number }> {
    const fullDir = path.join(this.uploadDir, path.dirname(filePath));
    await fs.mkdir(fullDir, { recursive: true });

    const fullPath = path.join(this.uploadDir, filePath);
    await fs.writeFile(fullPath, file.buffer || await fs.readFile(file.path));

    // Multer temp файлыг устгах (diskStorage ашигласан бол)
    if (file.path) {
      await fs.unlink(file.path).catch(() => {});
    }

    const url = `/uploads/${filePath}`;
    this.logger.debug(`Файл хадгалагдлаа: ${url}`);

    return { url, sizeBytes: file.size };
  }

  /** Файл устгана */
  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(
      this.uploadDir,
      filePath.replace(/^\/uploads\//, ''),
    );
    await fs.unlink(fullPath).catch((err) => {
      this.logger.warn(`Файл устгахад алдаа: ${fullPath} — ${err.message}`);
    });
  }
}
