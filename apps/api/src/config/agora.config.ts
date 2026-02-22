import { registerAs } from '@nestjs/config';

/**
 * Agora SDK тохиргоо.
 * WebRTC видео дуудлага, дэлгэц хуваалцах, бичлэг хийхэд ашиглагдана.
 */
export default registerAs('agora', () => ({
  appId: process.env.AGORA_APP_ID || '',
  appCertificate: process.env.AGORA_APP_CERTIFICATE || '',
  /** Токен-ийн хүчинтэй хугацаа секундээр (default: 3600 = 1 цаг) */
  tokenExpirySeconds: parseInt(process.env.AGORA_TOKEN_EXPIRY_SECONDS || '3600', 10),
  /** Recording callback webhook secret */
  webhookSecret: process.env.AGORA_WEBHOOK_SECRET || '',
}));
