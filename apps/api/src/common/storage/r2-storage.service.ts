import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import { IStorageService } from '../../modules/content/infrastructure/services/storage/storage.interface';

/**
 * Cloudflare R2 файл хадгалалтын сервис.
 * AWS S3-тэй compatible тул @aws-sdk/client-s3 ашиглана.
 * Production орчинд LocalStorageService-ийн оронд ашиглагдана.
 */
@Injectable()
export class R2StorageService implements IStorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('storage.r2AccountId') ?? '';
    this.bucketName = this.configService.get<string>('storage.r2BucketName') ?? '';
    this.publicUrl = (this.configService.get<string>('storage.r2PublicUrl') ?? '').replace(
      /\/$/,
      '',
    );

    // R2 endpoint: https://<accountId>.r2.cloudflarestorage.com
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>('storage.r2AccessKeyId') ?? '',
        secretAccessKey: this.configService.get<string>('storage.r2SecretAccessKey') ?? '',
      },
    });
  }

  /** Файлыг R2-д upload хийж public URL болон хэмжээ буцаана */
  async upload(
    file: Express.Multer.File,
    filePath: string,
  ): Promise<{ url: string; sizeBytes: number }> {
    // Key-ийн эхний '/' тэмдэгтийг хасна
    const key = filePath.startsWith('/') ? filePath.slice(1) : filePath;

    // Multer memoryStorage бол buffer, diskStorage бол file.path-аас уншина
    const body: Buffer = file.buffer ?? (await fs.readFile(file.path));

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: file.mimetype,
    });

    await this.client.send(command);

    // Multer diskStorage temp файлыг устгана
    if (file.path) {
      await fs.unlink(file.path).catch(() => {});
    }

    const url = `${this.publicUrl}/${key}`;
    this.logger.debug(`R2-д хадгалагдлаа: ${url}`);

    return { url, sizeBytes: file.size };
  }

  /** R2-аас файл устгана */
  async delete(filePath: string): Promise<void> {
    const key = filePath.startsWith('/') ? filePath.slice(1) : filePath;

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command).catch((err: Error) => {
      this.logger.warn(`R2-аас устгахад алдаа: ${key} — ${err.message}`);
    });
  }
}
