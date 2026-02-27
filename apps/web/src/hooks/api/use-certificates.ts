'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificatesService } from '@/lib/api-services/certificates.service';
import type {
  MyCertificatesParams,
  CourseCertificatesParams,
} from '@/lib/api-services/certificates.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Миний сертификатууд (pagination) */
export function useMyCertificates(params?: MyCertificatesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.certificates.my(params),
    queryFn: () => certificatesService.listMy(params),
  });
}

/** Сертификатын дэлгэрэнгүй */
export function useCertificateDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.certificates.detail(id),
    queryFn: () => certificatesService.getById(id),
    enabled: !!id,
  });
}

/** Сертификат баталгаажуулах (public) */
export function useVerifyCertificate(code: string) {
  return useQuery({
    queryKey: QUERY_KEYS.certificates.verify(code),
    queryFn: () => certificatesService.verify(code),
    enabled: !!code,
    retry: false,
  });
}

/** Сургалтын сертификатууд (TEACHER/ADMIN) */
export function useCourseCertificates(courseId: string, params?: CourseCertificatesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.certificates.byCourse(courseId, params),
    queryFn: () => certificatesService.listByCourse(courseId, params),
    enabled: !!courseId,
  });
}

/** Сертификат гараар үүсгэх */
export function useGenerateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => certificatesService.generate(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

/** Сертификат устгах (ADMIN) */
export function useDeleteCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => certificatesService.deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

/** PDF Polling — pdfUrl null байхад 3 сек interval-аар дахин query хийнэ */
export function useCertificatePdfPolling(id: string, pdfUrl: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.certificates.detail(id), 'pdf-poll'],
    queryFn: () => certificatesService.getById(id),
    enabled: !!id && pdfUrl === null,
    refetchInterval: pdfUrl === null ? 3000 : false,
    refetchIntervalInBackground: false,
  });
}
