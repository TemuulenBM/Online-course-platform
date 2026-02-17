/**
 * Файл хадгалалтын interface.
 * Local, S3/R2 гэсэн хэрэгжүүлэлтүүд энэ interface-г дагана.
 * Ирээдүйд Cloudflare R2 руу шилжихэд зөвхөн шинэ class нэмэхэд хангалттай.
 */
export interface IStorageService {
  /** Файл upload хийж, URL болон хэмжээ буцаана */
  upload(file: Express.Multer.File, path: string): Promise<{ url: string; sizeBytes: number }>;

  /** Файл устгана */
  delete(path: string): Promise<void>;
}

/** NestJS DI token */
export const STORAGE_SERVICE = 'STORAGE_SERVICE';
