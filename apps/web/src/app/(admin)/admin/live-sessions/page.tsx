'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { mn } from 'date-fns/locale';
import {
  Video,
  Radio,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

import { useAllLiveSessions, useSessionAttendees, useCancelLiveSession } from '@/hooks/api';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { LiveSession, SessionAttendee, LiveSessionStatus } from '@ocp/shared-types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_LIMIT = 15;

/** Статус тэмдэглэгээ */
const STATUS_FILTERS = [
  { value: '', label: 'Бүгд' },
  { value: 'scheduled', label: 'Товлосон' },
  { value: 'live', label: 'Явагдаж байна' },
  { value: 'ended', label: 'Дууссан' },
  { value: 'cancelled', label: 'Цуцлагдсан' },
] as const;

/** Статусын badge */
function StatusBadge({ status }: { status: LiveSessionStatus }) {
  const config: Record<
    LiveSessionStatus,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    scheduled: {
      label: 'Товлосон',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <CalendarDays className="size-3" />,
    },
    live: {
      label: 'LIVE',
      className: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
      icon: <Radio className="size-3" />,
    },
    ended: {
      label: 'Дууссан',
      className: 'bg-slate-50 text-slate-600 border-slate-200',
      icon: <CheckCircle className="size-3" />,
    },
    cancelled: {
      label: 'Цуцлагдсан',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: <XCircle className="size-3" />,
    },
  };

  const cfg = config[status] ?? config.scheduled;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        cfg.className,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

/** Session хугацааг хоёр цагийн зөрүүгээр минутаар буцаана */
function durationMins(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

/** Оролцогчдын dialog */
function AttendeesDialog({
  session,
  open,
  onClose,
}: {
  session: LiveSession;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useSessionAttendees(session.id, { limit: 50 }, {});

  const attendees: SessionAttendee[] = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Оролцогчид — {session.title}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : attendees.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="text-sm text-slate-500">Оролцогч олдсонгүй</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 py-2">
            {attendees.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {(a.userName?.[0] ?? a.userEmail?.[0] ?? 'U').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.userName ?? 'Хэрэглэгч'}</p>
                  <p className="truncate text-xs text-slate-500">{a.userEmail ?? ''}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-slate-700">{a.durationMinutes} мин</p>
                  <p className="text-[10px] text-slate-400">
                    {format(new Date(a.joinedAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400 pt-1">Нийт {data?.total ?? 0} оролцогч</p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Admin live sessions удирдлагын хуудас — /admin/live-sessions
 */
export default function AdminLiveSessionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);

  const { data, isLoading } = useAllLiveSessions({
    page,
    limit: PAGE_LIMIT,
    status: statusFilter || undefined,
  });

  const cancelMutation = useCancelLiveSession();

  const sessions = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  /** Статусаар тоолох */
  const allSessions = data?.data ?? [];
  const liveCount = allSessions.filter((s) => s.status === 'live').length;
  const scheduledCount = allSessions.filter((s) => s.status === 'scheduled').length;
  const endedCount = allSessions.filter((s) => s.status === 'ended').length;

  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleCancel = (session: LiveSession) => {
    cancelMutation.mutate(session.id, {
      onSuccess: () => toast.success('Session цуцлагдлаа'),
      onError: () => toast.error('Цуцлахад алдаа гарлаа'),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            <nav className="mb-1 flex items-center gap-1 text-sm text-slate-500">
              <Link href="/admin/dashboard" className="hover:text-primary">
                Хяналтын самбар
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-primary">Шууд хичээлүүд</span>
            </nav>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
              <Video className="size-8 text-primary" />
              Шууд хичээлүүд
            </h1>
            <p className="mt-1 text-slate-500">Бүх шууд хичээлүүдийг хянах, удирдах</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Нийт', value: totalCount, icon: Video, color: 'text-primary' },
            {
              label: 'Явагдаж байна',
              value: liveCount,
              icon: Radio,
              color: 'text-red-500',
            },
            {
              label: 'Товлосон',
              value: scheduledCount,
              icon: CalendarDays,
              color: 'text-blue-500',
            },
            {
              label: 'Дууссан',
              value: endedCount,
              icon: CheckCircle,
              color: 'text-slate-500',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <Icon className={cn('size-5', color)} />
              </div>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-16" />
              ) : (
                <p className="mt-2 text-3xl font-bold">{value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                statusFilter === f.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Гарчиг', 'Сургалт', 'Багш', 'Статус', 'Эхлэх цаг', 'Хугацаа', 'Үйлдэл'].map(
                    (h) => (
                      <th
                        key={h}
                        className="bg-slate-50/50 px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-5 py-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sessions.map((s) => (
                      <tr
                        key={s.id}
                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      >
                        {/* Гарчиг */}
                        <td className="max-w-[200px] px-5 py-4">
                          <p className="truncate text-sm font-semibold" title={s.title}>
                            {s.title}
                          </p>
                        </td>
                        {/* Сургалт */}
                        <td className="max-w-[160px] px-5 py-4">
                          <p
                            className="truncate text-sm text-slate-600 dark:text-slate-400"
                            title={s.courseTitle}
                          >
                            {s.courseTitle ?? '-'}
                          </p>
                        </td>
                        {/* Багш */}
                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {s.instructorName ?? '-'}
                          </p>
                        </td>
                        {/* Статус */}
                        <td className="px-5 py-4">
                          <StatusBadge status={s.status} />
                        </td>
                        {/* Эхлэх цаг */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {format(new Date(s.scheduledStart), 'yyyy.MM.dd', { locale: mn })}
                            </span>
                            <span className="text-xs text-slate-400">
                              {format(new Date(s.scheduledStart), 'HH:mm')}
                            </span>
                          </div>
                        </td>
                        {/* Хугацаа */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="size-3" />
                            <span>{durationMins(s.scheduledStart, s.scheduledEnd)} мин</span>
                          </div>
                        </td>
                        {/* Үйлдэл */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedSession(s)}
                              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                            >
                              <Users className="size-3.5" />
                              Оролцогчид
                            </button>
                            {s.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancel(s)}
                                disabled={cancelMutation.isPending}
                                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                Цуцлах
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {sessions.length} / {totalCount} харуулж байна
              </span>
              {totalCount > PAGE_LIMIT && (
                <CoursesPagination
                  page={page}
                  total={totalCount}
                  limit={PAGE_LIMIT}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>

        {/* Empty state */}
        {!isLoading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
              <Video className="size-10 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Session олдсонгүй</h3>
            <p className="text-sm text-slate-500">
              {statusFilter
                ? `"${statusFilter}" статустай session байхгүй байна.`
                : 'Шууд хичээл товлогдоогүй байна.'}
            </p>
          </div>
        )}
      </div>

      {/* Attendees dialog */}
      {selectedSession && (
        <AttendeesDialog
          session={selectedSession}
          open={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
