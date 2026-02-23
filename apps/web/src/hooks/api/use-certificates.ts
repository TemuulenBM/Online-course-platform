'use client';

import { useQuery } from '@tanstack/react-query';
import { certificatesService } from '@/lib/api-services/certificates.service';
import type { MyCertificatesParams } from '@/lib/api-services/certificates.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Миний сертификатууд (pagination) */
export function useMyCertificates(params?: MyCertificatesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.certificates.my(params),
    queryFn: () => certificatesService.listMy(params),
  });
}
