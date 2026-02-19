/**
 * Нэхэмжлэхийн домэйн entity.
 * PostgreSQL-ийн Invoice моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class InvoiceEntity {
  readonly id: string;
  readonly orderId: string;
  readonly invoiceNumber: string;
  readonly amount: number;
  readonly currency: string;
  readonly pdfUrl: string | null;
  readonly createdAt: Date;
  /** Сургалтын нэр — response-д харуулахад */
  readonly courseTitle?: string;
  /** Хэрэглэгчийн нэр */
  readonly userName?: string;
  /** Хэрэглэгчийн имэйл */
  readonly userEmail?: string;
  /** Захиалга эзэмшигчийн ID — эрхийн шалгалтад */
  readonly orderUserId?: string;

  constructor(props: {
    id: string;
    orderId: string;
    invoiceNumber: string;
    amount: number | unknown;
    currency: string;
    pdfUrl: string | null;
    createdAt: Date;
    courseTitle?: string;
    userName?: string;
    userEmail?: string;
    orderUserId?: string;
  }) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.invoiceNumber = props.invoiceNumber;
    this.amount = props.amount != null ? Number(props.amount) : 0;
    this.currency = props.currency;
    this.pdfUrl = props.pdfUrl;
    this.createdAt = props.createdAt;
    this.courseTitle = props.courseTitle;
    this.userName = props.userName;
    this.userEmail = props.userEmail;
    this.orderUserId = props.orderUserId;
  }

  /** Нэхэмжлэхийн мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      orderId: this.orderId,
      invoiceNumber: this.invoiceNumber,
      amount: this.amount,
      currency: this.currency,
      pdfUrl: this.pdfUrl,
      createdAt: this.createdAt,
      courseTitle: this.courseTitle,
      userName: this.userName,
      userEmail: this.userEmail,
    };
  }
}
