/**
 * Audit log домэйн entity.
 * PostgreSQL-ийн AuditLog моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class AuditLogEntity {
  readonly id: string;
  readonly userId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly changes: Record<string, unknown> | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: Date;

  /** Join-оор авсан хэрэглэгчийн мэдээлэл */
  readonly userName: string | null;
  readonly userEmail: string | null;

  constructor(props: {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    userName?: string | null;
    userEmail?: string | null;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.action = props.action;
    this.entityType = props.entityType;
    this.entityId = props.entityId;
    this.changes = props.changes;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt;
    this.userName = props.userName ?? null;
    this.userEmail = props.userEmail ?? null;
  }

  /** Audit log мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userEmail: this.userEmail,
      action: this.action,
      entityType: this.entityType,
      entityId: this.entityId,
      changes: this.changes,
      ipAddress: this.ipAddress,
      metadata: this.metadata,
      createdAt: this.createdAt,
    };
  }
}
