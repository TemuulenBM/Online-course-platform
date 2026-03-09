import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { extname } from 'path';

/**
 * Upload хийсэн статик файлуудын аюулгүй байдлын middleware.
 * - Зөвшөөрөгдсөн extension-уудыг whitelist-ээр шалгана
 * - Content-Disposition: attachment тавина — browser файлыг дуусгавар биш татаж авна
 *   (XSS, MIME sniffing халдлагаас хамгаалах)
 */
@Injectable()
export class StaticFilesMiddleware implements NestMiddleware {
  /** Зөвшөөрөгдсөн файлын өргөтгөлүүд */
  private readonly allowedExtensions = new Set([
    // Зураг
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.svg',
    // Видео
    '.mp4',
    '.webm',
    '.ogg',
    '.mov',
    // Баримт бичиг
    '.pdf',
    // Subtitle/caption
    '.vtt',
    '.srt',
  ]);

  use(req: Request, res: Response, next: NextFunction): void {
    const ext = extname(req.path).toLowerCase();

    // Extension байхгүй эсвэл whitelist-д байхгүй бол 403 буцаана
    if (!ext || !this.allowedExtensions.has(ext)) {
      res.status(403).json({
        statusCode: 403,
        message: 'Зөвшөөрөгдөхгүй файлын төрөл',
      });
      return;
    }

    // Бүх статик файлд Content-Disposition: attachment тавина
    // Ингэснээр browser дуусгавар хийхгүй, татаж авна → XSS хамгаалалт
    res.setHeader('Content-Disposition', 'attachment');

    // SVG файлд тусгай MIME type тавина — browser-т script ажиллуулахаас хамгаалах
    if (ext === '.svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    next();
  }
}
