/**
 * Бүртгэлийн домэйн entity.
 * PostgreSQL-ийн Subscription моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class SubscriptionEntity {
  readonly id: string;
  readonly userId: string;
  readonly planType: string;
  readonly status: string;
  readonly currentPeriodStart: Date;
  readonly currentPeriodEnd: Date;
  readonly externalSubscriptionId: string | null;
  readonly cancelAtPeriodEnd: boolean;
  readonly cancelledAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Хэрэглэгчийн нэр */
  readonly userName?: string;
  /** Хэрэглэгчийн имэйл */
  readonly userEmail?: string;

  constructor(props: {
    id: string;
    userId: string;
    planType: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    externalSubscriptionId: string | null;
    cancelAtPeriodEnd: boolean;
    cancelledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    userName?: string;
    userEmail?: string;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.planType = props.planType.toLowerCase();
    this.status = props.status.toLowerCase();
    this.currentPeriodStart = props.currentPeriodStart;
    this.currentPeriodEnd = props.currentPeriodEnd;
    this.externalSubscriptionId = props.externalSubscriptionId;
    this.cancelAtPeriodEnd = props.cancelAtPeriodEnd;
    this.cancelledAt = props.cancelledAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.userName = props.userName;
    this.userEmail = props.userEmail;
  }

  /** Бүртгэл идэвхтэй эсэх шалгах */
  get isActive(): boolean {
    return this.status === 'active' && new Date() < this.currentPeriodEnd;
  }

  /** Бүртгэлийн мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      planType: this.planType,
      status: this.status,
      currentPeriodStart: this.currentPeriodStart,
      currentPeriodEnd: this.currentPeriodEnd,
      cancelAtPeriodEnd: this.cancelAtPeriodEnd,
      cancelledAt: this.cancelledAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      userName: this.userName,
      userEmail: this.userEmail,
      isActive: this.isActive,
    };
  }
}
