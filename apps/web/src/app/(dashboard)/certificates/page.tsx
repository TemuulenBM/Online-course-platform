'use client';

import { useState } from 'react';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMyCertificates } from '@/hooks/api';
import { PageLayout } from '@/components/ui/page-layout';
import { PageHeader } from '@/components/ui/page-header';
import { CertificateCard } from '@/components/certificates/certificate-card';
import { CertificateCardSkeleton } from '@/components/certificates/certificate-card-skeleton';
import { CertificatesEmpty } from '@/components/certificates/certificates-empty';

const PAGE_LIMIT = 10;

export default function MyCertificatesPage() {
  const t = useTranslations('certificates');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyCertificates({ page, limit: PAGE_LIMIT });
  const certificates = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT) || 1;

  return (
    <PageLayout>
      <PageHeader icon={Award} title={t('achievementBadge')} subtitle={t('achievementDesc')} />

      {/* Certificates grid */}
      {isLoading ? (
        <CertificateCardSkeleton />
      ) : certificates.length === 0 ? (
        <CertificatesEmpty />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="size-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`size-10 rounded-lg text-sm font-bold transition-colors ${
                    p === page
                      ? 'bg-primary text-white'
                      : 'border border-border text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="size-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
