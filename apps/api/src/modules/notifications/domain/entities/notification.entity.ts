/**
 * Мэдэгдлийн домэйн entity.
 * PostgreSQL-ийн Notification моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class NotificationEntity {
  readonly id: string;
  readonly userId: string;
  readonly type: string;
  readonly title: string;
  readonly message: string;
  readonly data: Record<string, unknown> | null;
  readonly read: boolean;
  readonly sentAt: Date;
  readonly readAt: Date | null;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, unknown> | null;
    read: boolean;
    sentAt: Date;
    readAt: Date | null;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.title = props.title;
    this.message = props.message;
    this.data = props.data;
    this.read = props.read;
    this.sentAt = props.sentAt;
    this.readAt = props.readAt;
    this.createdAt = props.createdAt;
  }

  /** Мэдэгдлийн мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.data,
      read: this.read,
      sentAt: this.sentAt,
      readAt: this.readAt,
      createdAt: this.createdAt,
    };
  }
}
