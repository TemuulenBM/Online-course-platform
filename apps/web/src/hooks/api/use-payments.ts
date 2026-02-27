'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/lib/api-services/payments.service';
import type {
  MyOrdersParams,
  PendingOrdersParams,
  MyInvoicesParams,
} from '@/lib/api-services/payments.service';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';

/* ======== Orders — Query hooks ======== */

/** Миний захиалгуудын жагсаалт */
export function useMyOrders(params?: MyOrdersParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.payments.myOrders(params),
    queryFn: () => paymentsService.listMyOrders(params),
    enabled: isAuthenticated,
  });
}

/** Захиалгын дэлгэрэнгүй */
export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.orderDetail(id),
    queryFn: () => paymentsService.getOrder(id),
    enabled: !!id,
  });
}

/** Хүлээгдэж буй захиалгууд (ADMIN) */
export function usePendingOrders(params?: PendingOrdersParams) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.pendingOrders(params),
    queryFn: () => paymentsService.listPendingOrders(params),
  });
}

/* ======== Orders — Mutation hooks ======== */

/** Захиалга үүсгэх */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { courseId: string; paymentMethod?: string }) =>
      paymentsService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'orders', 'my'] });
    },
  });
}

/** Төлбөрийн баримт upload */
export function useUploadProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => paymentsService.uploadProof(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payments.orderDetail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['payments', 'orders', 'my'] });
    },
  });
}

/** Захиалга баталгаажуулах (ADMIN) */
export function useApproveOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
      paymentsService.approveOrder(id, adminNote),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payments.orderDetail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['payments', 'orders', 'pending'] });
    },
  });
}

/** Захиалга татгалзах (ADMIN) */
export function useRejectOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      paymentsService.rejectOrder(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payments.orderDetail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['payments', 'orders', 'pending'] });
    },
  });
}

/* ======== Invoices ======== */

/** Миний нэхэмжлэхүүд */
export function useMyInvoices(params?: MyInvoicesParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.payments.myInvoices(params),
    queryFn: () => paymentsService.listMyInvoices(params),
    enabled: isAuthenticated,
  });
}

/** Нэхэмжлэхийн дэлгэрэнгүй */
export function useInvoiceDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.invoiceDetail(id),
    queryFn: () => paymentsService.getInvoice(id),
    enabled: !!id,
  });
}

/* ======== Subscriptions ======== */

/** Миний бүртгэл */
export function useMySubscription() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.payments.mySubscription,
    queryFn: () => paymentsService.getMySubscription(),
    enabled: isAuthenticated,
  });
}

/** Бүртгэл цуцлах */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsService.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.payments.mySubscription,
      });
    },
  });
}
