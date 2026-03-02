import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  // REDIS_URL байвал URL-ээр холбогдоно (Upstash: rediss://default:{password}@{host}:{port})
  url: process.env.REDIS_URL,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  // Upstash болон TLS шаарддаг Redis provider-уудад ашиглана
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
}));
