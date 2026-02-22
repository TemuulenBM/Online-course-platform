/**
 * Live session-ийн домэйн entity.
 * PostgreSQL-ийн LiveSession моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class LiveSessionEntity {
  readonly id: string;
  readonly lessonId: string;
  readonly instructorId: string;
  readonly title: string;
  readonly description: string | null;
  readonly scheduledStart: Date;
  readonly scheduledEnd: Date;
  readonly actualStart: Date | null;
  readonly actualEnd: Date | null;
  readonly meetingUrl: string | null;
  readonly meetingId: string | null;
  readonly recordingUrl: string | null;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  /** Холбоос мэдээлэл — join query-ээс ирнэ */
  readonly lessonTitle?: string;
  readonly courseId?: string;
  readonly courseTitle?: string;
  readonly instructorName?: string;
  readonly attendeeCount?: number;

  constructor(props: {
    id: string;
    lessonId: string;
    instructorId: string;
    title: string;
    description: string | null;
    scheduledStart: Date;
    scheduledEnd: Date;
    actualStart: Date | null;
    actualEnd: Date | null;
    meetingUrl: string | null;
    meetingId: string | null;
    recordingUrl: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    lessonTitle?: string;
    courseId?: string;
    courseTitle?: string;
    instructorName?: string;
    attendeeCount?: number;
  }) {
    this.id = props.id;
    this.lessonId = props.lessonId;
    this.instructorId = props.instructorId;
    this.title = props.title;
    this.description = props.description;
    this.scheduledStart = props.scheduledStart;
    this.scheduledEnd = props.scheduledEnd;
    this.actualStart = props.actualStart;
    this.actualEnd = props.actualEnd;
    this.meetingUrl = props.meetingUrl;
    this.meetingId = props.meetingId;
    this.recordingUrl = props.recordingUrl;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lessonTitle = props.lessonTitle;
    this.courseId = props.courseId;
    this.courseTitle = props.courseTitle;
    this.instructorName = props.instructorName;
    this.attendeeCount = props.attendeeCount;
  }

  /** Response хэлбэрээр буцаана */
  toResponse(): Record<string, unknown> {
    return {
      id: this.id,
      lessonId: this.lessonId,
      instructorId: this.instructorId,
      title: this.title,
      description: this.description,
      scheduledStart: this.scheduledStart.toISOString(),
      scheduledEnd: this.scheduledEnd.toISOString(),
      actualStart: this.actualStart?.toISOString() || null,
      actualEnd: this.actualEnd?.toISOString() || null,
      meetingUrl: this.meetingUrl,
      meetingId: this.meetingId,
      recordingUrl: this.recordingUrl,
      status: this.status.toLowerCase(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      lessonTitle: this.lessonTitle,
      courseId: this.courseId,
      courseTitle: this.courseTitle,
      instructorName: this.instructorName,
      attendeeCount: this.attendeeCount,
    };
  }
}
