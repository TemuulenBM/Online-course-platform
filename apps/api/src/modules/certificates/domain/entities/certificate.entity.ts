/**
 * Сертификатын домэйн entity.
 * PostgreSQL-ийн Certificate моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class CertificateEntity {
  readonly id: string;
  readonly userId: string;
  readonly courseId: string;
  readonly certificateNumber: string;
  readonly pdfUrl: string | null;
  readonly qrCodeUrl: string | null;
  readonly verificationCode: string;
  readonly issuedAt: Date;
  readonly createdAt: Date;
  /** Хэрэглэгчийн нэр — response-д харуулахад */
  readonly userName?: string;
  /** Хэрэглэгчийн имэйл — багш/админ харагдац */
  readonly userEmail?: string;
  /** Сургалтын нэр — response-д харуулахад */
  readonly courseTitle?: string;
  /** Сургалтын slug — линк үүсгэхэд */
  readonly courseSlug?: string;
  /** Сургалтын эзэмшигчийн ID — эрхийн шалгалтад */
  readonly courseInstructorId?: string;

  constructor(props: {
    id: string;
    userId: string;
    courseId: string;
    certificateNumber: string;
    pdfUrl: string | null;
    qrCodeUrl: string | null;
    verificationCode: string;
    issuedAt: Date;
    createdAt: Date;
    userName?: string;
    userEmail?: string;
    courseTitle?: string;
    courseSlug?: string;
    courseInstructorId?: string;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.courseId = props.courseId;
    this.certificateNumber = props.certificateNumber;
    this.pdfUrl = props.pdfUrl;
    this.qrCodeUrl = props.qrCodeUrl;
    this.verificationCode = props.verificationCode;
    this.issuedAt = props.issuedAt;
    this.createdAt = props.createdAt;
    this.userName = props.userName;
    this.userEmail = props.userEmail;
    this.courseTitle = props.courseTitle;
    this.courseSlug = props.courseSlug;
    this.courseInstructorId = props.courseInstructorId;
  }

  /** Сертификатын мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      courseId: this.courseId,
      certificateNumber: this.certificateNumber,
      pdfUrl: this.pdfUrl,
      qrCodeUrl: this.qrCodeUrl,
      verificationCode: this.verificationCode,
      issuedAt: this.issuedAt,
      createdAt: this.createdAt,
      userName: this.userName,
      userEmail: this.userEmail,
      courseTitle: this.courseTitle,
      courseSlug: this.courseSlug,
    };
  }
}
