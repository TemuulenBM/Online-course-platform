/**
 * Agora service interface.
 * Agora SDK-тэй харьцах бүх үйлдлийг тодорхойлно.
 * Ирээдүйд бусад WebRTC provider (100ms, Jitsi) руу солих боломжтой.
 */
export interface IAgoraService {
  /** RTC токен үүсгэх */
  generateRtcToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber',
    expirySeconds?: number,
  ): string;

  /** Сессийн ID-аас суваг нэр үүсгэх */
  generateChannelName(sessionId: string): string;
}

/** NestJS DI token */
export const AGORA_SERVICE = 'AGORA_SERVICE';
