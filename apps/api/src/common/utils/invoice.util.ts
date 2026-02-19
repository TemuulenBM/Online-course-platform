import * as crypto from 'crypto';

/**
 * Нэхэмжлэхийн дугаар үүсгэнэ.
 * Формат: INV-YYYY-XXXXXXXX (hex random, uppercase)
 * Жишээ: INV-2026-A3F8B2C1
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `INV-${year}-${random}`;
}
