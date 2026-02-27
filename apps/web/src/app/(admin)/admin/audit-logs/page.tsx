'use client';

import { useState } from 'react';
import { ScrollText, ChevronDown, ChevronRight, Filter, List, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuditLogs } from '@/hooks/api';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { AuditLogListParams, AuditLogEntry } from '@/lib/api-services/admin.service';

/** Action badge color mapping */
const actionColors: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-rose-100 text-rose-700',
  APPROVE: 'bg-green-100 text-green-700',
  REJECT: 'bg-red-100 text-red-700',
};

/** Entity type options */
const entityTypes = [
  '',
  'SYSTEM_SETTING',
  'DISCUSSION_POST',
  'USER',
  'COURSE',
  'ORDER',
  'ENROLLMENT',
];

/** Action options */
const actionOptions = ['', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'];

/** Аудит лог хуудас — table + timeline toggle + filters */
export default function AdminAuditLogsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [filters, setFilters] = useState<AuditLogListParams>({ page: 1, limit: 20 });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useAuditLogs(filters);

  const updateFilter = (key: keyof AuditLogListParams, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const totalPages = data ? Math.ceil(data.total / (filters.limit || 20)) : 1;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
        <SidebarTrigger className="lg:hidden mr-4" />
        <ScrollText className="size-5 text-[#9c7aff] mr-2" />
        <h2 className="text-xl font-bold">Аудит лог</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-[#f6f5f8]">
        <div className="max-w-[1400px] mx-auto">
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Аудит лог</h1>
              <p className="text-sm text-slate-500 mt-1">Системийн бүх үйлдлийн бүртгэл</p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[#9c7aff] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="size-4 inline mr-1" />
                Хүснэгт
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-[#9c7aff] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Clock className="size-4 inline mr-1" />
                Timeline
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm p-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="size-4 text-slate-400" />
              <select
                value={filters.entityType || ''}
                onChange={(e) => updateFilter('entityType', e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                <option value="">Бүх Entity</option>
                {entityTypes.filter(Boolean).map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
              <select
                value={filters.action || ''}
                onChange={(e) => updateFilter('action', e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                <option value="">Бүх үйлдэл</option>
                {actionOptions.filter(Boolean).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-40 text-sm"
                placeholder="Эхлэх огноо"
              />
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-40 text-sm"
                placeholder="Дуусах огноо"
              />
              {(filters.entityType || filters.action || filters.dateFrom || filters.dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ page: 1, limit: 20 })}
                  className="text-xs text-slate-500"
                >
                  Цэвэрлэх
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="bg-white rounded-2xl border p-6 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-40 flex-1" />
                </div>
              ))}
            </div>
          ) : viewMode === 'table' ? (
            <AuditLogTable
              logs={data?.data ?? []}
              expandedId={expandedId}
              onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
            />
          ) : (
            <AuditLogTimeline logs={data?.data ?? []} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        filters.page! > 1 && setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))
                      }
                      className={
                        filters.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === (filters.page || 1)}
                          onClick={() => setFilters((p) => ({ ...p, page }))}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        (filters.page || 1) < totalPages &&
                        setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))
                      }
                      className={
                        (filters.page || 1) >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Audit log хүснэгт — expandable rows */
function AuditLogTable({
  logs,
  expandedId,
  onToggle,
}: {
  logs: AuditLogEntry[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm py-16 text-center">
        <ScrollText className="size-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Audit log бичлэг байхгүй</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-[#9c7aff]/5">
          <tr>
            <th className="px-4 py-3 w-8" />
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Огноо</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Хэрэглэгч</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Үйлдэл</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Entity</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-600">Entity ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#9c7aff]/5">
          {logs.map((log) => (
            <LogRow key={log.id} log={log} isExpanded={expandedId === log.id} onToggle={onToggle} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Нэг audit log мөр — expand хийж changes харах */
function LogRow({
  log,
  isExpanded,
  onToggle,
}: {
  log: AuditLogEntry;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) {
  const hasChanges = log.changes && Object.keys(log.changes).length > 0;

  return (
    <>
      <tr
        onClick={() => hasChanges && onToggle(log.id)}
        className={`hover:bg-slate-50 transition-colors ${hasChanges ? 'cursor-pointer' : ''}`}
      >
        <td className="px-4 py-3">
          {hasChanges &&
            (isExpanded ? (
              <ChevronDown className="size-4 text-slate-400" />
            ) : (
              <ChevronRight className="size-4 text-slate-400" />
            ))}
        </td>
        <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
          {new Date(log.createdAt).toLocaleString('mn-MN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className="font-medium text-slate-900">{log.userName || log.userEmail || '—'}</span>
        </td>
        <td className="px-4 py-3">
          <Badge
            className={`text-xs font-bold ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}`}
          >
            {log.action}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
            {log.entityType}
          </code>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500 font-mono truncate max-w-[120px]">
          {log.entityId}
        </td>
      </tr>
      <AnimatePresence>
        {isExpanded && hasChanges && (
          <tr>
            <td colSpan={6} className="px-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-12 py-4 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Өөрчлөлтүүд:</p>
                  <pre className="text-xs font-mono bg-white p-4 rounded-xl border border-slate-200 overflow-x-auto max-h-[200px]">
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

/** Timeline view — vertical timeline */
function AuditLogTimeline({ logs }: { logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border shadow-sm py-16 text-center">
        <Clock className="size-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Audit log бичлэг байхгүй</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#9c7aff]/5 shadow-sm p-8">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#9c7aff]/20" />

        <div className="space-y-8">
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              className="relative pl-12"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Dot */}
              <div
                className={`absolute left-2.5 top-1 size-3 rounded-full border-2 border-white ${
                  log.action === 'DELETE' || log.action === 'REJECT'
                    ? 'bg-rose-500'
                    : log.action === 'CREATE' || log.action === 'APPROVE'
                      ? 'bg-emerald-500'
                      : 'bg-blue-500'
                }`}
              />

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Badge
                    className={`text-[10px] font-bold ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}`}
                  >
                    {log.action}
                  </Badge>
                  <code className="text-[10px] font-mono text-slate-400">{log.entityType}</code>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString('mn-MN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {log.userName || log.userEmail || 'Тодорхойгүй'}{' '}
                  <span className="text-slate-500 font-normal">
                    — {log.entityType.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </p>
                {log.changes && Object.keys(log.changes).length > 0 && (
                  <pre className="mt-2 text-[11px] font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 overflow-x-auto max-h-[120px]">
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
