/**
 * RefreshToken домэйн entity.
 * Токен шинэчлэлд ашиглагдах refresh token-ийг төлөөлнө.
 */
export class RefreshTokenEntity {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly revoked: boolean;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    revoked: boolean;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
    this.revoked = props.revoked;
    this.createdAt = props.createdAt;
  }

  /** Refresh token хүчинтэй эсэхийг шалгана (цуцлагдаагүй, хугацаа дуусаагүй) */
  isValid(): boolean {
    return !this.revoked && new Date() < this.expiresAt;
  }
}
