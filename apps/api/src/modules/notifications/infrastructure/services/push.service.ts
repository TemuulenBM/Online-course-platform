import { Injectable, Logger } from '@nestjs/common';

/** Push notification илгээх service-ийн interface */
export interface IPushService {
  sendPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
}

/** DI token — Push service inject хийхэд ашиглагдана */
export const PUSH_SERVICE = 'PUSH_SERVICE';

/**
 * Placeholder Push notification service.
 * Phase 7-д Expo Push Notifications хэрэгжинэ.
 */
@Injectable()
export class PlaceholderPushService implements IPushService {
  private readonly logger = new Logger(PlaceholderPushService.name);

  /** Push notification илгээх (placeholder — лог бичнэ) */
  async sendPush(
    userId: string,
    title: string,
    body: string,
    _data?: Record<string, unknown>,
  ): Promise<void> {
    this.logger.warn(
      `Push notification илгээх боломжгүй (placeholder): userId=${userId}, title="${title}"`,
    );
  }
}
