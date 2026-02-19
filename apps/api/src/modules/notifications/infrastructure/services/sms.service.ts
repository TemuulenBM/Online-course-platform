import { Injectable, Logger } from '@nestjs/common';

/** SMS илгээх service-ийн interface */
export interface ISmsService {
  sendSms(to: string, message: string): Promise<void>;
}

/** DI token — SMS service inject хийхэд ашиглагдана */
export const SMS_SERVICE = 'SMS_SERVICE';

/**
 * Placeholder SMS service.
 * Phase 5-д Twilio integration хэрэгжинэ.
 */
@Injectable()
export class PlaceholderSmsService implements ISmsService {
  private readonly logger = new Logger(PlaceholderSmsService.name);

  /** SMS илгээх (placeholder — лог бичнэ) */
  async sendSms(to: string, message: string): Promise<void> {
    this.logger.warn(
      `SMS илгээх боломжгүй (placeholder): ${to} — "${message.substring(0, 50)}..."`,
    );
  }
}
