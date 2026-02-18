import * as crypto from 'crypto';

/**
 * Сертификатын дугаар үүсгэнэ.
 * Формат: OCP-YYYY-XXXXXXXX (hex random, uppercase)
 * Жишээ: OCP-2026-A3F8B2C1
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `OCP-${year}-${random}`;
}

/**
 * Баталгаажуулалтын код үүсгэнэ.
 * UUID-г dash-гүй болгож 32 тэмдэгтийн string буцаана.
 * Жишээ: 550e8400e29b41d4a716446655440000
 */
export function generateVerificationCode(): string {
  return crypto.randomUUID().replace(/-/g, '');
}
