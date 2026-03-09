/**
 * Имэйл баталгаажуулалтын домэйн entity.
 * Email verification токений мэдээллийг бизнес логикийн түвшинд төлөөлнө.
 */
export class EmailVerificationEntity {
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
}
