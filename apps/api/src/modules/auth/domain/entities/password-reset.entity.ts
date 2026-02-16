/**
 * PasswordReset домэйн entity.
 * Нууц үг сэргээх хүсэлтийг төлөөлнө.
 */
export class PasswordResetEntity {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly used: boolean;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
    this.used = props.used;
    this.createdAt = props.createdAt;
  }

  /** Нууц үг сэргээх токен хүчинтэй эсэхийг шалгана (ашиглагдаагүй, хугацаа дуусаагүй) */
  isValid(): boolean {
    return !this.used && new Date() < this.expiresAt;
  }
}
