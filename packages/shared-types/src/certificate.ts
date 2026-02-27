/** Сертификатын бүтэц — backend response-тай тааруулсан */
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  pdfUrl: string | null;
  qrCodeUrl: string | null;
  verificationCode: string;
  issuedAt: string;
  createdAt: string;
  userName: string;
  userEmail?: string;
  courseTitle: string;
  courseSlug: string;
}
