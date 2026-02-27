import type { PaginatedResponse } from './common';

/** Захиалгын төлөв */
export type OrderStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

/** Захиалгын мэдээлэл */
export interface Order {
  id: string;
  userId: string;
  courseId: string | null;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: string | null;
  proofImageUrl: string | null;
  adminNote: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  courseTitle?: string;
  courseSlug?: string;
  invoiceId?: string;
  invoiceNumber?: string;
}

/** Захиалгын жагсаалтын хариу */
export type OrderListResponse = PaginatedResponse<Order>;

/** Нэхэмжлэхийн мэдээлэл */
export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  pdfUrl: string | null;
  createdAt: string;
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
}

/** Нэхэмжлэхийн жагсаалтын хариу */
export type InvoiceListResponse = PaginatedResponse<Invoice>;

/** Бүртгэлийн төлөв */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

/** Бүртгэлийн мэдээлэл */
export interface Subscription {
  id: string;
  userId: string;
  planType: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  isActive: boolean;
}
