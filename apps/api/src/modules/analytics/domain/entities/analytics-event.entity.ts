/**
 * Analytics event домэйн entity.
 * PostgreSQL-ийн AnalyticsEvent моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class AnalyticsEventEntity {
  readonly id: string;
  readonly userId: string | null;
  readonly eventName: string;
  readonly eventCategory: string;
  readonly properties: Record<string, unknown> | null;
  readonly sessionId: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    userId: string | null;
    eventName: string;
    eventCategory: string;
    properties: Record<string, unknown> | null;
    sessionId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.eventName = props.eventName;
    this.eventCategory = props.eventCategory;
    this.properties = props.properties;
    this.sessionId = props.sessionId;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt;
  }

  /** Event мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      eventName: this.eventName,
      eventCategory: this.eventCategory,
      properties: this.properties,
      sessionId: this.sessionId,
      createdAt: this.createdAt,
    };
  }
}
