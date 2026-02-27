'use client';

import { useState, useMemo } from 'react';
import { Banknote, ShoppingCart, TrendingUp, UserPlus, Download, ChevronRight } from 'lucide-react';

import { useRevenueReport, useAnalyticsOverview, usePopularCourses } from '@/hooks/api';
import { StatCard } from '@/components/analytics/stat-card';
import { DateRangeFilter } from '@/components/analytics/date-range-filter';
import { AnalyticsPageSkeleton } from '@/components/analytics/analytics-loading';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatMNT, formatNumber } from '@/lib/utils';
import type { DateRangeParams } from '@ocp/shared-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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

/** Төлбөрийн хэлбэрийн placeholder өгөгдөл */
const paymentMethodData = [
  { name: 'Банкны карт', value: 72, amount: '₮17,640,000', color: '#9c7aff' },
  { name: 'SocialPay / QPay', value: 20, amount: '₮4,900,000', color: '#7c3aed' },
  { name: 'Дансаар', value: 8, amount: '₮1,960,000', color: '#e2e8f0' },
];

export default function RevenueReportPage() {
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);
  const [filterParams, setFilterParams] = useState<DateRangeParams>({
    period: 'day',
    ...defaultRange,
  });

  const { data: revenue, isLoading: revenueLoading } = useRevenueReport(filterParams);
  const { data: overview } = useAnalyticsOverview();
  const { data: topCourses } = usePopularCourses(3);

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

  /** Bar chart өгөгдөл */
  const chartData = useMemo(() => {
    if (!revenue?.data) return [];
    return revenue.data.map((item) => ({
      name: item.period.slice(-2),
      revenue: item.totalRevenue,
      orders: item.orderCount,
    }));
  }, [revenue]);

  /** Дундаж сагс */
  const avgCart =
    revenue && revenue.totalOrders > 0 ? Math.round(revenue.totalRevenue / revenue.totalOrders) : 0;

  if (revenueLoading) return <AnalyticsPageSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 sticky top-0 z-10">
        <SidebarTrigger className="md:hidden mr-4" />
        <h2 className="text-xl font-bold">Орлогын тайлан</h2>
      </header>

      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Breadcrumb + Title */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span>Аналитик</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-medium">Орлого</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Орлогын тайлан</h2>
            <p className="text-slate-500 mt-1">
              Системийн нийт борлуулалт болон орлогын явцыг хянах хэсэг
            </p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all">
            <Download className="size-4" />
            Тайлан татах (PDF)
          </button>
        </div>

        {/* Шүүлтүүр */}
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

        {/* Stat card-ууд */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Нийт орлого"
            value={formatMNT(revenue?.totalRevenue ?? 0)}
            icon={<Banknote className="size-5" />}
          />
          <StatCard
            label="Нийт захиалга"
            value={formatNumber(revenue?.totalOrders ?? 0)}
            icon={<ShoppingCart className="size-5" />}
          />
          <StatCard
            label="Дундаж сагс"
            value={formatMNT(avgCart)}
            icon={<TrendingUp className="size-5" />}
          />
          <StatCard
            label="Шинэ хэрэглэгч"
            value={formatNumber(overview?.newUsersThisMonth ?? 0)}
            icon={<UserPlus className="size-5" />}
          />
        </div>

        {/* Орлогын хандлага chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Орлогын хандлага</h3>
              <p className="text-sm text-slate-500">Борлуулалтын график</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary" />
                <span className="text-xs font-medium text-slate-600">Орлого</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value) => [formatMNT(Number(value ?? 0)), 'Орлого']}
              />
              <Bar dataKey="revenue" fill="#9c7aff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Доод хэсэг: Топ сургалт + Төлбөрийн хэлбэр */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Топ курсууд */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 p-6">
            <h3 className="text-lg font-bold mb-6">Хамгийн их борлуулалттай курсууд</h3>
            <div className="flex flex-col gap-4">
              {topCourses?.map((course) => {
                const initials = course.courseTitle
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase();
                return (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between p-4 bg-primary/5 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{course.courseTitle}</p>
                        <p className="text-xs text-slate-500">
                          {formatNumber(course.enrollmentCount)} Оюутан
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatMNT(course.revenue)}</p>
                    </div>
                  </div>
                );
              })}
              {(!topCourses || topCourses.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-8">Мэдээлэл байхгүй</p>
              )}
            </div>
          </div>

          {/* Төлбөрийн хэлбэр donut chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 p-6 flex flex-col gap-6">
            <h3 className="text-lg font-bold">Төлбөрийн хэлбэр</h3>
            <div className="relative mx-auto">
              <ResponsiveContainer width={192} height={192}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">72%</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Картаар</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {paymentMethodData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
