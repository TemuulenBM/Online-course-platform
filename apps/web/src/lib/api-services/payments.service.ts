import type {
  ApiResponse,
  Order,
  OrderListResponse,
  Invoice,
  InvoiceListResponse,
  Subscription,
} from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Миний захиалгын жагсаалтын params */
export interface MyOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

/** Admin хүлээгдэж буй захиалгын params */
export interface PendingOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

/** Миний нэхэмжлэхийн params */
export interface MyInvoicesParams {
  page?: number;
  limit?: number;
}

export const paymentsService = {
  /* ======== Orders ======== */

  /** Захиалга үүсгэх */
  createOrder: async (data: { courseId: string; paymentMethod?: string }): Promise<Order> => {
    const res = await client.post<ApiResponse<Order>>('/payments/orders', data);
    return res.data.data!;
  },

  /** Миний захиалгуудын жагсаалт */
  listMyOrders: async (params?: MyOrdersParams): Promise<OrderListResponse> => {
    const res = await client.get<ApiResponse<OrderListResponse>>('/payments/orders/my', { params });
    return res.data.data!;
  },

  /** Захиалгын дэлгэрэнгүй */
  getOrder: async (id: string): Promise<Order> => {
    const res = await client.get<ApiResponse<Order>>(`/payments/orders/${id}`);
    return res.data.data!;
  },

  /** Төлбөрийн баримт upload */
  uploadProof: async (id: string, file: File): Promise<Order> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post<ApiResponse<Order>>(
      `/payments/orders/${id}/upload-proof`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data!;
  },

  /* ======== Admin Orders ======== */

  /** Хүлээгдэж буй захиалгуудын жагсаалт (ADMIN) */
  listPendingOrders: async (params?: PendingOrdersParams): Promise<OrderListResponse> => {
    const res = await client.get<ApiResponse<OrderListResponse>>('/payments/orders/pending', {
      params,
    });
    return res.data.data!;
  },

  /** Захиалга баталгаажуулах (ADMIN) */
  approveOrder: async (id: string, adminNote?: string): Promise<Order> => {
    const res = await client.patch<ApiResponse<Order>>(`/payments/orders/${id}/approve`, {
      adminNote,
    });
    return res.data.data!;
  },

  /** Захиалга татгалзах (ADMIN) */
  rejectOrder: async (id: string, reason: string): Promise<Order> => {
    const res = await client.patch<ApiResponse<Order>>(`/payments/orders/${id}/reject`, { reason });
    return res.data.data!;
  },

  /* ======== Invoices ======== */

  /** Миний нэхэмжлэхүүд */
  listMyInvoices: async (params?: MyInvoicesParams): Promise<InvoiceListResponse> => {
    const res = await client.get<ApiResponse<InvoiceListResponse>>('/payments/invoices/my', {
      params,
    });
    return res.data.data!;
  },

  /** Нэхэмжлэхийн дэлгэрэнгүй */
  getInvoice: async (id: string): Promise<Invoice> => {
    const res = await client.get<ApiResponse<Invoice>>(`/payments/invoices/${id}`);
    return res.data.data!;
  },

  /* ======== Subscriptions ======== */

  /** Миний бүртгэл */
  getMySubscription: async (): Promise<Subscription> => {
    const res = await client.get<ApiResponse<Subscription>>('/payments/subscriptions/my');
    return res.data.data!;
  },

  /** Бүртгэл цуцлах */
  cancelSubscription: async (id: string): Promise<Subscription> => {
    const res = await client.patch<ApiResponse<Subscription>>(
      `/payments/subscriptions/${id}/cancel`,
    );
    return res.data.data!;
  },
};
