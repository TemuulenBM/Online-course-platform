/**
 * Захиалгын домэйн entity.
 * PostgreSQL-ийн Order моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class OrderEntity {
  readonly id: string;
  readonly userId: string;
  readonly courseId: string | null;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly paymentMethod: string | null;
  readonly externalPaymentId: string | null;
  readonly proofImageUrl: string | null;
  readonly adminNote: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly paidAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Хэрэглэгчийн нэр — response-д харуулахад */
  readonly userName?: string;
  /** Хэрэглэгчийн имэйл */
  readonly userEmail?: string;
  /** Сургалтын нэр */
  readonly courseTitle?: string;
  /** Сургалтын slug */
  readonly courseSlug?: string;
  /** Сургалтын үнэ */
  readonly coursePrice?: number;
  /** Сургалтын эзэмшигчийн ID — эрхийн шалгалтад */
  readonly courseInstructorId?: string;
  /** Нэхэмжлэхийн ID */
  readonly invoiceId?: string;
  /** Нэхэмжлэхийн дугаар */
  readonly invoiceNumber?: string;

  constructor(props: {
    id: string;
    userId: string;
    courseId: string | null;
    amount: number | unknown;
    currency: string;
    status: string;
    paymentMethod: string | null;
    externalPaymentId: string | null;
    proofImageUrl: string | null;
    adminNote: string | null;
    metadata: Record<string, unknown> | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    userName?: string;
    userEmail?: string;
    courseTitle?: string;
    courseSlug?: string;
    coursePrice?: number | unknown;
    courseInstructorId?: string;
    invoiceId?: string;
    invoiceNumber?: string;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.courseId = props.courseId;
    this.amount = props.amount != null ? Number(props.amount) : 0;
    this.currency = props.currency;
    this.status = props.status.toLowerCase();
    this.paymentMethod = props.paymentMethod;
    this.externalPaymentId = props.externalPaymentId;
    this.proofImageUrl = props.proofImageUrl;
    this.adminNote = props.adminNote;
    this.metadata = props.metadata;
    this.paidAt = props.paidAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.userName = props.userName;
    this.userEmail = props.userEmail;
    this.courseTitle = props.courseTitle;
    this.courseSlug = props.courseSlug;
    this.coursePrice = props.coursePrice != null ? Number(props.coursePrice) : undefined;
    this.courseInstructorId = props.courseInstructorId;
    this.invoiceId = props.invoiceId;
    this.invoiceNumber = props.invoiceNumber;
  }

  /** Захиалгын мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      courseId: this.courseId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      paymentMethod: this.paymentMethod,
      proofImageUrl: this.proofImageUrl,
      adminNote: this.adminNote,
      paidAt: this.paidAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      userName: this.userName,
      userEmail: this.userEmail,
      courseTitle: this.courseTitle,
      courseSlug: this.courseSlug,
      invoiceId: this.invoiceId,
      invoiceNumber: this.invoiceNumber,
    };
  }
}
