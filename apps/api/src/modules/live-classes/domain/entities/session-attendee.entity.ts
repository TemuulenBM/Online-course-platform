/**
 * Session оролцогчийн домэйн entity.
 */
export class SessionAttendeeEntity {
  readonly id: string;
  readonly liveSessionId: string;
  readonly userId: string;
  readonly joinedAt: Date;
  readonly leftAt: Date | null;
  readonly durationMinutes: number;
  readonly createdAt: Date;

  /** Холбоос мэдээлэл */
  readonly userName?: string;
  readonly userEmail?: string;

  constructor(props: {
    id: string;
    liveSessionId: string;
    userId: string;
    joinedAt: Date;
    leftAt: Date | null;
    durationMinutes: number;
    createdAt: Date;
    userName?: string;
    userEmail?: string;
  }) {
    this.id = props.id;
    this.liveSessionId = props.liveSessionId;
    this.userId = props.userId;
    this.joinedAt = props.joinedAt;
    this.leftAt = props.leftAt;
    this.durationMinutes = props.durationMinutes;
    this.createdAt = props.createdAt;
    this.userName = props.userName;
    this.userEmail = props.userEmail;
  }

  /** Response хэлбэрээр буцаана */
  toResponse(): Record<string, unknown> {
    return {
      id: this.id,
      liveSessionId: this.liveSessionId,
      userId: this.userId,
      joinedAt: this.joinedAt.toISOString(),
      leftAt: this.leftAt?.toISOString() || null,
      durationMinutes: this.durationMinutes,
      createdAt: this.createdAt.toISOString(),
      userName: this.userName,
      userEmail: this.userEmail,
    };
  }
}
