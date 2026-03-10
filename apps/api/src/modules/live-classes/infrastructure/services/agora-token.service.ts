import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAgoraService } from '../../domain/interfaces/agora-service.interface';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

/**
 * Agora SDK токен үүсгэх service.
 * agora-token npm package ашиглан RTC токен үүсгэнэ.
 * IAgoraService interface-г хэрэгжүүлнэ — ирээдүйд бусад provider руу солих боломжтой.
 */
@Injectable()
export class AgoraTokenService implements IAgoraService {
  private readonly logger = new Logger(AgoraTokenService.name);
  private readonly appId: string;
  private readonly appCertificate: string;
  private readonly defaultExpiry: number;

  /** Agora credentials зөв тохируулагдсан эсэх */
  private readonly configured: boolean;

  /** Placeholder утгууд — .env-д бодит утга оруулаагүй үед илрүүлнэ */
  private static readonly PLACEHOLDER_VALUES = [
    'your-agora-app-id',
    'your-agora-app-certificate',
    '',
  ];

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('agora.appId') || '';
    this.appCertificate = this.configService.get<string>('agora.appCertificate') || '';
    this.defaultExpiry = this.configService.get<number>('agora.tokenExpirySeconds') || 3600;

    /** Credentials placeholder эсвэл хоосон бол анхааруулга */
    this.configured =
      !AgoraTokenService.PLACEHOLDER_VALUES.includes(this.appId) &&
      !AgoraTokenService.PLACEHOLDER_VALUES.includes(this.appCertificate);

    if (!this.configured) {
      this.logger.warn(
        'Agora credentials тохируулагдаагүй! AGORA_APP_ID, AGORA_APP_CERTIFICATE ' +
          '.env файлд бодит утга оруулна уу. Шууд хичээл эхлүүлэх боломжгүй.',
      );
    }
  }

  /** Agora тохиргоо бэлэн эсэх */
  isReady(): boolean {
    return this.configured;
  }

  /** RTC токен үүсгэх */
  generateRtcToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber',
    expirySeconds?: number,
  ): string {
    const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expiry = expirySeconds || this.defaultExpiry;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expiry;

    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      rtcRole,
      privilegeExpiredTs,
      privilegeExpiredTs,
    );

    this.logger.debug(`Agora RTC токен үүслээ: channel=${channelName}, uid=${uid}, role=${role}`);

    return token;
  }

  /** Сессийн ID-аас суваг нэр үүсгэх */
  generateChannelName(sessionId: string): string {
    return `ocp-live-${sessionId}`;
  }
}
