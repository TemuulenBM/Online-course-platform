/**
 * Rate limiting constants.
 * @Throttle decorator compile-time тул ConfigService ашиглах боломжгүй.
 * Эдгээр утгуудыг нэг газраас удирдаж, бүх controller-т дахин ашиглана.
 * Default утгууд нь throttle.config.ts-тэй ижил байна.
 */

/** Auth endpoint-д зориулсан хязгаарлалт (login, register) */
export const AUTH_THROTTLE = { long: { ttl: 60000, limit: 5 } };

/** Нууц үг сэргээх endpoint-д зориулсан хязгаарлалт */
export const PASSWORD_RESET_THROTTLE = { long: { ttl: 60000, limit: 3 } };

/** Төлбөр үүсгэх endpoint-д зориулсан хязгаарлалт */
export const PAYMENT_THROTTLE = { long: { ttl: 60000, limit: 5 } };

/** Бүртгэл (subscription) үүсгэх endpoint-д зориулсан хязгаарлалт */
export const SUBSCRIPTION_THROTTLE = { long: { ttl: 60000, limit: 3 } };
