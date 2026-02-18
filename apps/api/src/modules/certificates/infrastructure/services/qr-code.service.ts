import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';

/**
 * QR код үүсгэх сервис.
 * Баталгаажуулалтын URL-ийг QR код зураг болгон хөрвүүлнэ.
 */
@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  /** URL-аас PNG buffer үүсгэнэ */
  async generateQrCodeBuffer(url: string): Promise<Buffer> {
    const buffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
    this.logger.debug(`QR код үүсгэгдлээ: ${url}`);
    return buffer;
  }

  /** URL-аас base64 data URL үүсгэнэ (PDF-д embed хийхэд) */
  async generateQrCodeDataUrl(url: string): Promise<string> {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  }
}
