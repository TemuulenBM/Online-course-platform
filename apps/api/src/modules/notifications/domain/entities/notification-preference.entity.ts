/**
 * Мэдэгдлийн тохиргооны домэйн entity.
 * PostgreSQL-ийн NotificationPreference моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class NotificationPreferenceEntity {
  readonly id: string;
  readonly userId: string;
  readonly emailEnabled: boolean;
  readonly pushEnabled: boolean;
  readonly smsEnabled: boolean;
  readonly channelPreferences: Record<string, unknown> | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    channelPreferences: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.emailEnabled = props.emailEnabled;
    this.pushEnabled = props.pushEnabled;
    this.smsEnabled = props.smsEnabled;
    this.channelPreferences = props.channelPreferences;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Тухайн channel идэвхтэй эсэхийг шалгана */
  isChannelEnabled(channel: 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP'): boolean {
    switch (channel) {
      case 'EMAIL':
        return this.emailEnabled;
      case 'PUSH':
        return this.pushEnabled;
      case 'SMS':
        return this.smsEnabled;
      case 'IN_APP':
        return true;
      default:
        return false;
    }
  }

  /** Тохиргооны мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      emailEnabled: this.emailEnabled,
      pushEnabled: this.pushEnabled,
      smsEnabled: this.smsEnabled,
      channelPreferences: this.channelPreferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
