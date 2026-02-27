'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEnrollment, useCourseProgress, useEntityAuditLogs } from '@/hooks/api';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ROUTES } from '@/lib/constants';
import { EnrollmentProfileCard } from '@/components/admin/enrollment-detail/enrollment-profile-card';
import { EnrollmentProgressStats } from '@/components/admin/enrollment-detail/enrollment-progress-stats';
import { EnrollmentActivityLog } from '@/components/admin/enrollment-detail/enrollment-activity-log';
import { EnrollmentStatusIndicators } from '@/components/admin/enrollment-detail/enrollment-status-indicators';
import { EnrollmentAdminControls } from '@/components/admin/enrollment-detail/enrollment-admin-controls';
import { EnrollmentAdminNotes } from '@/components/admin/enrollment-detail/enrollment-admin-notes';
import { EnrollmentDetailSkeleton } from '@/components/admin/enrollment-detail/enrollment-detail-skeleton';

export default function AdminEnrollmentDetailPage() {
  const params = useParams<{ enrollmentId: string }>();
  const enrollmentId = params.enrollmentId;
  const t = useTranslations('enrollments');
  const ta = useTranslations('admin');

  /** Элсэлтийн мэдээлэл */
  const { data: enrollment, isLoading: enrollmentLoading } = useEnrollment(enrollmentId);

  /** Ахицын мэдээлэл — зөвхөн active/completed элсэлтэд */
  const shouldFetchProgress =
    enrollment && (enrollment.status === 'active' || enrollment.status === 'completed');
  const { data: progress } = useCourseProgress(shouldFetchProgress ? enrollment.courseId : '');

  /** Audit log — enrollment entity */
  const { data: auditLogs, isLoading: logsLoading } = useEntityAuditLogs(
    'enrollment',
    enrollmentId,
  );

  const progressPercentage = progress?.courseProgressPercentage ?? 0;
  const completedLessons = progress?.completedLessons ?? 0;
  const totalLessons = progress?.totalLessons ?? 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-xl font-bold">{t('adminTitle')}</h2>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
          <Link href={ROUTES.ADMIN} className="hover:text-primary transition-colors">
            {ta('title')}
          </Link>
          <ChevronRight className="size-3" />
          <Link href={ROUTES.ADMIN_ENROLLMENTS} className="hover:text-primary transition-colors">
            {ta('enrollments')}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">{t('adminTitle')}</span>
        </div>

        {/* Content */}
        {enrollmentLoading || !enrollment ? (
          <EnrollmentDetailSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Зүүн багана */}
            <div className="lg:col-span-2 space-y-6">
              <EnrollmentProfileCard enrollment={enrollment} />
              <EnrollmentProgressStats
                progressPercentage={progressPercentage}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
              />
              <EnrollmentActivityLog logs={auditLogs?.data ?? []} isLoading={logsLoading} />
            </div>

            {/* Баруун багана */}
            <div className="space-y-6">
              <EnrollmentStatusIndicators currentStatus={enrollment.status} />
              <EnrollmentAdminControls enrollmentId={enrollment.id} status={enrollment.status} />
              <EnrollmentAdminNotes />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
