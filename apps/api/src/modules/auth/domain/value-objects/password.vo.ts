import { BadRequestException } from '@nestjs/common';

/**
 * Нууц үг value object.
 * Нууц үгийн хүч хангалттай эсэхийг баталгаажуулна.
 */
export class Password {
  private readonly value: string;

  /** Нууц үгийн хамгийн бага урт */
  static readonly MIN_LENGTH = 8;

  constructor(password: string) {
    if (!password || password.length < Password.MIN_LENGTH) {
      throw new BadRequestException(
        `Нууц үг хамгийн багадаа ${Password.MIN_LENGTH} тэмдэгт байх ёстой`,
      );
    }

    this.value = password;
  }

  /** Нууц үгийг string хэлбэрээр буцаана */
  toString(): string {
    return this.value;
  }
}
