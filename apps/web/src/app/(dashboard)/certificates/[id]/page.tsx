'use client';

import { use, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCertificateDetail, useCertificatePdfPolling } from '@/hooks/api';
import { QUERY_KEYS } from '@/lib/constants';
import { CertificateDetailHeader } from '@/components/certificates/certificate-detail-header';
import { CertificatePdfProgress } from '@/components/certificates/certificate-pdf-progress';
import { CertificatePreview } from '@/components/certificates/certificate-preview';
import { CertificateInfo } from '@/components/certificates/certificate-info';
import { CertificateDetailSkeleton } from '@/components/certificates/certificate-detail-skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CertificateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: certificate, isLoading } = useCertificateDetail(id);

  /** PDF polling — pdfUrl null үед 3 сек тутам дахин шалгана */
  const { data: polledCert } = useCertificatePdfPolling(id, certificate?.pdfUrl ?? null);

  /** Polling-оос pdfUrl ирвэл үндсэн query-г invalidate хийнэ */
  useEffect(() => {
    if (polledCert?.pdfUrl && !certificate?.pdfUrl) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.certificates.detail(id) });
    }
  }, [polledCert?.pdfUrl, certificate?.pdfUrl, id, queryClient]);

  if (isLoading || !certificate) {
    return (
      <div className="flex-1 overflow-y-auto">
        <CertificateDetailSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <CertificateDetailHeader certificate={certificate} />

      <main className="flex flex-1 justify-center py-8 px-4 md:px-10">
        <div className="max-w-[1000px] w-full flex flex-col gap-8">
          {/* PDF Progress — pdfUrl null үед харуулна */}
          {!certificate.pdfUrl && <CertificatePdfProgress />}

          {/* Certificate Preview */}
          <CertificatePreview certificate={certificate} />

          {/* Additional Info */}
          <CertificateInfo certificate={certificate} />
        </div>
      </main>
    </div>
  );
}
