/**
 * Session домэйн entity.
 * Хэрэглэгчийн нэвтрэлтийн сессийг төлөөлнө.
 */
export class SessionEntity {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt;
  }

  /** Сессийн хугацаа дууссан эсэхийг шалгана */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
