'use client';

import { useState, useMemo } from 'react';
import { UserPlus, CheckCircle2, XCircle, BarChart3, Download, ChevronRight } from 'lucide-react';

import { useEnrollmentTrend, useAnalyticsOverview } from '@/hooks/api';
import { StatCard } from '@/components/analytics/stat-card';
import { DateRangeFilter } from '@/components/analytics/date-range-filter';
import { AnalyticsPageSkeleton } from '@/components/analytics/analytics-loading';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { DateRangeParams } from '@ocp/shared-types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/** Анхдагч огнооны хүрээ — сүүлийн 30 хоног */
function getDefaultRange() {
  const now = new Date();
  const dateTo = now.toISOString().split('T')[0]!;
  const from = new Date(now);
  from.setDate(from.getDate() - 30);
  const dateFrom = from.toISOString().split('T')[0]!;
  return { dateFrom, dateTo };
}

/** Хурдан хугацааны сонголтууд */
type QuickPeriod = 'today' | 'week' | 'month' | 'year';
const quickPeriodLabels: Record<QuickPeriod, string> = {
  today: 'Өнөөдөр',
  week: 'Долоо хоног',
  month: 'Сар',
  year: 'Жил',
};

export default function EnrollmentTrendsPage() {
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>('month');
  const [filterParams, setFilterParams] = useState<DateRangeParams>({
    period: 'day',
    ...defaultRange,
  });

  const { data: trend, isLoading: trendLoading } = useEnrollmentTrend(filterParams);
  const { data: overview } = useAnalyticsOverview();

  /** Шүүлтүүр хэрэглэх */
  const handleFilter = () => {
    setFilterParams({ period, dateFrom, dateTo });
  };

  const handleReset = () => {
    setPeriod('day');
    setDateFrom(defaultRange.dateFrom);
    setDateTo(defaultRange.dateTo);
    setFilterParams({ period: 'day', ...defaultRange });
  };

  /** Хурдан хугацаа сонгох */
  const handleQuickPeriod = (qp: QuickPeriod) => {
    setQuickPeriod(qp);
    const now = new Date();
    const to = now.toISOString().split('T')[0]!;
    let from: Date;
    let p: 'day' | 'month' | 'year' = 'day';

    switch (qp) {
      case 'today':
        from = new Date(now);
        p = 'day';
        break;
      case 'week':
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        p = 'day';
        break;
      case 'month':
        from = new Date(now);
        from.setDate(from.getDate() - 30);
        p = 'day';
        break;
      case 'year':
        from = new Date(now);
        from.setFullYear(from.getFullYear() - 1);
        p = 'month';
        break;
    }
    const dateFromStr = from.toISOString().split('T')[0]!;
    setDateFrom(dateFromStr);
    setDateTo(to);
    setPeriod(p);
    setFilterParams({ period: p, dateFrom: dateFromStr, dateTo: to });
  };

  /** Area chart өгөгдөл */
  const chartData = useMemo(() => {
    if (!trend?.data) return [];
    return trend.data.map((item) => ({
      name: item.period.slice(-5),
      enrollments: item.enrollmentCount,
      completed: item.completedCount,
      cancelled: item.cancelledCount,
    }));
  }, [trend]);

  /** Нийт цуцалсан тоо */
  const totalCancelled = useMemo(() => {
    if (!trend?.data) return 0;
    return trend.data.reduce((sum, item) => sum + item.cancelledCount, 0);
  }, [trend]);

  /** Дундаж явц (overview-оос авна) */
  const avgProgress = useMemo(() => {
    if (!overview) return 0;
    if (overview.totalEnrollments === 0) return 0;
    return Math.round((overview.completedEnrollments / overview.totalEnrollments) * 100);
  }, [overview]);

  if (trendLoading) return <AnalyticsPageSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 sticky top-0 z-10">
        <SidebarTrigger className="md:hidden mr-4" />
        <h2 className="text-xl font-bold">Элсэлтийн хандлага</h2>
      </header>

      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Breadcrumb + Title */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span>Аналитик</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-medium">Элсэлт</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Элсэлтийн хандлага</h2>
            <p className="text-slate-500 mt-1">Нийт элсэлт болон дуусгасан байдлын харьцуулалт</p>
          </div>
          <button className="flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors">
            <Download className="size-4" />
            Татах
          </button>
        </div>

        {/* Stat card-ууд */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Нийт элсэлт"
            value={formatNumber(trend?.totalEnrollments ?? 0)}
            icon={<UserPlus className="size-5" />}
          />
          <StatCard
            label="Амжилттай дууссан"
            value={formatNumber(trend?.totalCompleted ?? 0)}
            icon={<CheckCircle2 className="size-5" />}
          />
          <StatCard
            label="Цуцлагдсан"
            value={formatNumber(totalCancelled)}
            icon={<XCircle className="size-5" />}
          />
          <StatCard
            label="Дундаж явц"
            value={`${avgProgress}%`}
            icon={<BarChart3 className="size-5" />}
          />
        </div>

        {/* Хурдан хугацааны сонголт + Шүүлтүүр */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-primary/5 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            {(Object.keys(quickPeriodLabels) as QuickPeriod[]).map((qp) => (
              <button
                key={qp}
                onClick={() => handleQuickPeriod(qp)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-bold transition-all',
                  quickPeriod === qp
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-primary/5 text-slate-600 hover:bg-primary/10',
                )}
              >
                {quickPeriodLabels[qp]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <DateRangeFilter
            period={period}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onPeriodChange={setPeriod}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onFilter={handleFilter}
            onReset={handleReset}
            showReset
          />
        </div>

        {/* Элсэлтийн явцын chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Элсэлтийн явцын график</h3>
              <p className="text-sm text-slate-500">
                Нийт элсэлт болон дуусгасан байдлын харьцуулалт
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary" />
                <span className="text-xs font-medium text-slate-600">Элсэлт</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-600">Дууссан</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-rose-400" />
                <span className="text-xs font-medium text-slate-600">Цуцлагдсан</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradEnroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9c7aff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#9c7aff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Legend wrapperStyle={{ display: 'none' }} />
              <Area
                type="monotone"
                dataKey="enrollments"
                stroke="#9c7aff"
                strokeWidth={3}
                fill="url(#gradEnroll)"
                name="Элсэлт"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#gradCompleted)"
                name="Дууссан"
              />
              <Area
                type="monotone"
                dataKey="cancelled"
                stroke="#F87171"
                strokeWidth={2}
                strokeDasharray="8 4"
                fill="transparent"
                name="Цуцлагдсан"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Хүснэгт */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-primary/5 bg-primary/5">
            <h4 className="text-sm font-bold">Хугацааны задаргаа</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 font-medium">Хугацаа</th>
                  <th className="px-6 py-4 font-medium">Нийт элсэлт</th>
                  <th className="px-6 py-4 font-medium">Дууссан</th>
                  <th className="px-6 py-4 font-medium">Цуцлагдсан</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {trend?.data
                  .slice(-10)
                  .reverse()
                  .map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{item.period}</td>
                      <td className="px-6 py-4">{formatNumber(item.enrollmentCount)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">
                          {formatNumber(item.completedCount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-bold">
                          {formatNumber(item.cancelledCount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                {(!trend?.data || trend.data.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Мэдээлэл байхгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
