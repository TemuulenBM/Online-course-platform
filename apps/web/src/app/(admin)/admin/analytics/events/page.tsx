'use client';

import { useState, useCallback } from 'react';
import { Download, RefreshCw, ChevronRight, ChevronDown, Copy, Check, Search } from 'lucide-react';

import { useAnalyticsEvents } from '@/hooks/api';
import { AnalyticsPageSkeleton } from '@/components/analytics/analytics-loading';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { exportToCsv, cn } from '@/lib/utils';
import type { EventListParams, AnalyticsEvent } from '@ocp/shared-types';

/** Category-ийн badge өнгө */
const categoryColors: Record<string, string> = {
  AUTHENTICATION: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  NAVIGATION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONTENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  BILLING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  SYSTEM: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const CATEGORIES = ['AUTHENTICATION', 'NAVIGATION', 'CONTENT', 'BILLING', 'SYSTEM'];
const PAGE_LIMIT = 10;

export default function EventLogPage() {
  /** Filter state */
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('');
  const [userId, setUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [page, setPage] = useState(1);

  /** Expandable row state */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /** Query params */
  const params: EventListParams = {
    page,
    limit: PAGE_LIMIT,
    ...(eventName && { eventName }),
    ...(category && { eventCategory: category }),
    ...(userId && { userId }),
    ...(dateFrom && { dateFrom }),
  };

  const { data, isLoading, refetch } = useAnalyticsEvents(params);
  const events = data?.data ?? [];
  const total = data?.total ?? 0;

  /** Row toggle */
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setCopied(false);
  };

  /** JSON copy */
  const handleCopy = useCallback(async (event: AnalyticsEvent) => {
    await navigator.clipboard.writeText(JSON.stringify(event.properties, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  /** CSV export */
  const handleExport = () => {
    if (!events.length) return;
    exportToCsv(
      events.map((e) => ({
        'User ID': e.userId ?? 'Нэвтрээгүй',
        'Event Name': e.eventName,
        Category: e.eventCategory,
        'Session ID': e.sessionId ?? '-',
        Date: new Date(e.createdAt).toLocaleString(),
      })),
      'event-log',
    );
  };

  /** Шинэчлэх */
  const handleRefresh = () => {
    refetch();
  };

  /** Хуудас солих */
  const handlePageChange = (p: number) => {
    setPage(p);
    setExpandedId(null);
  };

  /** Огноо формат */
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /** Category badge */
  const getCategoryBadge = (cat: string) => {
    const colorClass = categoryColors[cat.toUpperCase()] ?? 'bg-slate-100 text-slate-700';
    return (
      <span
        className={cn(
          'px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight',
          colorClass,
        )}
      >
        {cat}
      </span>
    );
  };

  if (isLoading) return <AnalyticsPageSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 sticky top-0 z-10">
        <SidebarTrigger className="md:hidden mr-4" />
        <h2 className="text-xl font-bold">Системийн Event-ууд</h2>
      </header>

      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Breadcrumb + Title */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span>Аналитик</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-medium">Event-ууд</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Системийн Event-ууд</h2>
            <p className="text-slate-500 text-sm mt-1">
              Бүх бүртгэгдсэн үйлдлүүдийн жагсаалт ба лог
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-primary/20 rounded-xl text-sm font-medium hover:border-primary transition-all"
            >
              <Download className="size-4" /> Export CSV
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            >
              <RefreshCw className="size-4" /> Шинэчлэх
            </button>
          </div>
        </div>

        {/* Шүүлтүүр */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Event нэр</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => {
                    setEventName(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Нэрээр хайх..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Ангилал</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Бүх ангилал</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Хэрэглэгчийн ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setPage(1);
                }}
                placeholder="ID оруулах..."
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Огноо</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Хүснэгт */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 border-b border-primary/10">
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">User ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Event Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Session ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase text-right">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    isExpanded={expandedId === event.id}
                    onToggle={() => toggleExpand(event.id)}
                    onCopy={() => handleCopy(event)}
                    copied={copied && expandedId === event.id}
                    formatDate={formatDate}
                    getCategoryBadge={getCategoryBadge}
                  />
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Мэдээлэл байхгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Нийт {total} илэрцээс {Math.min((page - 1) * PAGE_LIMIT + 1, total)}-
              {Math.min(page * PAGE_LIMIT, total)} харуулж байна
            </span>
            {total > PAGE_LIMIT && (
              <CoursesPagination
                page={page}
                total={total}
                limit={PAGE_LIMIT}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>

        {/* JSON Expand — одоо хуудасны доод хэсэгт expandable row дотор харагдана */}
        {expandedId && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Event Properties JSON
              </h3>
              <button
                onClick={() => {
                  const event = events.find((e) => e.id === expandedId);
                  if (event) handleCopy(event);
                }}
                className="text-[10px] text-primary font-bold uppercase hover:underline flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="size-3" /> Хуулагдсан
                  </>
                ) : (
                  <>
                    <Copy className="size-3" /> Copy to clipboard
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(events.find((e) => e.id === expandedId)?.properties ?? {}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/** Event мөр component */
function EventRow({
  event,
  isExpanded,
  onToggle,
  formatDate,
  getCategoryBadge,
}: {
  event: AnalyticsEvent;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
  copied: boolean;
  formatDate: (iso: string) => string;
  getCategoryBadge: (cat: string) => React.ReactNode;
}) {
  return (
    <tr
      className={cn(
        'hover:bg-primary/5 transition-colors cursor-pointer',
        isExpanded && 'bg-primary/5',
      )}
      onClick={onToggle}
    >
      <td className="px-6 py-4">
        {event.userId ? (
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {event.userId.slice(0, 8)}...
          </span>
        ) : (
          <span className="text-sm italic text-slate-400">Нэвтрээгүй</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold">{event.eventName}</span>
      </td>
      <td className="px-6 py-4">{getCategoryBadge(event.eventCategory)}</td>
      <td className="px-6 py-4">
        <span className="text-xs font-mono text-slate-500">
          {event.sessionId ? event.sessionId.slice(0, 10) : '-'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {formatDate(event.createdAt)}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all flex items-center gap-1 ml-auto text-xs font-medium">
          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          {isExpanded ? 'Хаах' : 'Дэлгэх'}
        </button>
      </td>
    </tr>
  );
}
