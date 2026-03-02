'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMyCertificates } from '@/hooks/api';
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
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold">{t('achievementBadge')}</h1>
            <p className="text-muted-foreground mt-1">{t('achievementDesc')}</p>
          </div>
        </div>

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
      </div>
    </div>
  );
}
