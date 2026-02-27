'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCourseById, useCourseCertificates } from '@/hooks/api';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { CertificateStatsCards } from '@/components/certificates/course/certificate-stats-cards';
import { CourseCertificatesTable } from '@/components/certificates/course/course-certificates-table';
import { CourseCertificatesTableSkeleton } from '@/components/certificates/course/course-certificates-table-skeleton';
import { CourseCertificatesEmpty } from '@/components/certificates/course/course-certificates-empty';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_LIMIT = 10;

export default function CourseCertificatesPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const t = useTranslations('certificates');

  const [page, setPage] = useState(1);

  const { data: course } = useCourseById(courseId);
  const { data, isLoading } = useCourseCertificates(courseId, { page, limit: PAGE_LIMIT });
  const certificates = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT) || 1;

  /** Энэ сарын сертификатын тоог тооцоолох */
  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return certificates.filter((c) => new Date(c.issuedAt) >= startOfMonth).length;
  }, [certificates]);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-primary/10 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm">
          <SidebarTrigger className="md:hidden mr-2" />
          <span className="text-slate-400">Courses</span>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="font-medium">{course?.title ?? '...'}</span>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="font-medium text-primary">{t('courseCertificates')}</span>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('courseCertificates')}</h2>
          <p className="text-slate-500 text-sm">{t('courseCertificatesDesc')}</p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 flex items-center gap-4"
              >
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CertificateStatsCards totalIssued={total} thisMonth={thisMonthCount} pending={0} />
        )}

        {/* Certificates Table */}
        {isLoading ? (
          <CourseCertificatesTableSkeleton />
        ) : certificates.length === 0 ? (
          <CourseCertificatesEmpty />
        ) : (
          <>
            <CourseCertificatesTable certificates={certificates} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-primary/5 rounded-xl flex items-center justify-between border border-primary/10">
                <span className="text-sm text-slate-500 font-medium">
                  {t('showingOf', {
                    from: (page - 1) * PAGE_LIMIT + 1,
                    to: Math.min(page * PAGE_LIMIT, total),
                    total,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        p === page
                          ? 'bg-primary text-white'
                          : 'hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
