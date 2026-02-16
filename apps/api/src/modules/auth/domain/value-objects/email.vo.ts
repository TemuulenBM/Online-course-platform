import { BadRequestException } from '@nestjs/common';

/**
 * Имэйл value object.
 * Имэйл хаягийн формат зөв эсэхийг баталгаажуулна.
 */
export class Email {
  private readonly value: string;

  constructor(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!this.isValidEmail(normalizedEmail)) {
      throw new BadRequestException('Имэйл хаягийн формат буруу байна');
    }

    this.value = normalizedEmail;
  }

  /** Имэйл хаягийн формат зөв эсэхийг шалгана */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /** Имэйл хаягийг string хэлбэрээр буцаана */
  toString(): string {
    return this.value;
  }

  /** Хоёр имэйл хаяг ижил эсэхийг шалгана */
  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
