'use client';

import { useTranslations } from 'next-intl';
import type { AuditLogEntry } from '@/lib/api-services/admin.service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

/** Status өнгө — activity log-д */
const statusColor: Record<string, string> = {
  active: 'text-green-500',
  completed: 'text-blue-500',
  cancelled: 'text-red-500',
  expired: 'text-slate-500',
};

interface EnrollmentActivityLogProps {
  logs: AuditLogEntry[];
  isLoading: boolean;
}

/** Үйл ажиллагааны лог хүснэгт */
export function EnrollmentActivityLog({ logs, isLoading }: EnrollmentActivityLogProps) {
  const t = useTranslations('enrollments');

  /** Өөрчлөлтүүдээс status утгыг олох */
  const getStatusFromChanges = (changes: Record<string, unknown> | null): string | null => {
    if (!changes) return null;
    if (typeof changes === 'object' && 'status' in changes) {
      return String(changes.status);
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 overflow-hidden">
      <div className="p-6 border-b border-primary/10 flex justify-between items-center">
        <h3 className="font-bold">{t('activityLog')}</h3>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : !logs.length ? (
          <div className="p-8 text-center text-sm text-slate-400">{t('notAvailable')}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5">
                <TableHead className="text-xs font-bold text-slate-500 uppercase">
                  {t('action')}
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase">
                  {t('statusChange')}
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase">
                  {t('date')}
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase">
                  {t('adminUser')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {logs.map((log) => {
                const status = getStatusFromChanges(log.changes);
                return (
                  <TableRow key={log.id} className="border-b border-primary/5 hover:bg-primary/5">
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className={status ? statusColor[status] || '' : 'text-slate-400'}>
                      {status?.toUpperCase() || t('noChange')}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(log.createdAt).toLocaleDateString('mn-MN')}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {log.user?.email?.split('@')[0] || 'System'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
