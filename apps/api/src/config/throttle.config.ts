import { registerAs } from '@nestjs/config';

/**
 * Rate limiting тохиргоо.
 * Бүх утгыг env-ээс тохируулах боломжтой.
 */
export default registerAs('throttle', () => ({
  // Ерөнхий хязгаарлалт (бүх endpoint-д)
  short: {
    ttl: parseInt(process.env.THROTTLE_SHORT_TTL || '1000', 10),
    limit: parseInt(process.env.THROTTLE_SHORT_LIMIT || '3', 10),
  },
  medium: {
    ttl: parseInt(process.env.THROTTLE_MEDIUM_TTL || '10000', 10),
    limit: parseInt(process.env.THROTTLE_MEDIUM_LIMIT || '20', 10),
  },
  long: {
    ttl: parseInt(process.env.THROTTLE_LONG_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LONG_LIMIT || '100', 10),
  },
  // Auth endpoint-д зориулсан хатуу хязгаарлалт
  auth: {
    ttl: parseInt(process.env.THROTTLE_AUTH_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '5', 10),
  },
  // Нууц үг сэргээх endpoint-д зориулсан хязгаарлалт
  passwordReset: {
    ttl: parseInt(process.env.THROTTLE_PASSWORD_RESET_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_PASSWORD_RESET_LIMIT || '3', 10),
  },
}));
