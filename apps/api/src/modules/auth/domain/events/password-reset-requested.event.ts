/**
 * Нууц үг сэргээх хүсэлт домэйн event.
 * Хэрэглэгч нууц үг сэргээх хүсэлт илгээх үед үүснэ.
 */
export class PasswordResetRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
