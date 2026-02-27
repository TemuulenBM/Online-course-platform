'use client';

import { useMemo } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Banknote,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

import { usePlatformStats, useAnalyticsOverview, useEnrollmentTrend } from '@/hooks/api';
import { StatCard, SecondaryStatCard } from '@/components/analytics/stat-card';
import { GradientStatCard } from '@/components/analytics/gradient-stat-card';
import { AnalyticsPageSkeleton } from '@/components/analytics/analytics-loading';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatMNT, formatNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/** Сүүлийн 7 хоногийн огноо тооцоолох */
function getLast7DaysRange() {
  const now = new Date();
  const dateTo = now.toISOString().split('T')[0]!;
  const from = new Date(now);
  from.setDate(from.getDate() - 6);
  const dateFrom = from.toISOString().split('T')[0]!;
  return { dateFrom, dateTo };
}

const dayLabels = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];

export default function AdminAnalyticsDashboardPage() {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();

  const dateRange = useMemo(() => getLast7DaysRange(), []);
  const { data: trend } = useEnrollmentTrend({
    period: 'day',
    ...dateRange,
  });

  /** Chart өгөгдөл — сүүлийн 7 хоног */
  const chartData = useMemo(() => {
    if (!trend?.data) return [];
    return trend.data.slice(-7).map((item) => {
      const d = new Date(item.period);
      return {
        name: dayLabels[d.getDay()] || '',
        value: item.enrollmentCount,
      };
    });
  }, [trend]);

  if (statsLoading || overviewLoading) return <AnalyticsPageSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 sticky top-0 z-10">
        <SidebarTrigger className="md:hidden mr-4" />
        <h2 className="text-xl font-bold">Аналитик</h2>
      </header>

      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Breadcrumb + Title */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span>Аналитик</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-medium">Ерөнхий</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-1">Хянах самбар</h2>
        <p className="text-slate-500 mb-8">Learnify платформын ерөнхий статистик болон гүйцэтгэл</p>

        {/* 4 Үндсэн stat card-ууд */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Нийт хэрэглэгч"
            value={formatNumber(stats?.users.total ?? 0)}
            icon={<Users className="size-5" />}
          />
          <StatCard
            label="Нийт сургалт"
            value={formatNumber(stats?.courses.total ?? 0)}
            icon={<BookOpen className="size-5" />}
          />
          <StatCard
            label="Нийт элсэлт"
            value={formatNumber(stats?.enrollments.total ?? 0)}
            icon={<GraduationCap className="size-5" />}
          />
          <StatCard
            label="Нийт орлого (MNT)"
            value={formatMNT(overview?.totalRevenue ?? 0)}
            icon={<Banknote className="size-5" />}
          />
        </div>

        {/* 3 Хоёрдогч stat card-ууд */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SecondaryStatCard
            label="Идэвхтэй элсэлт"
            value={formatNumber(overview?.activeEnrollments ?? 0)}
            icon={<Clock className="size-5" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
          <SecondaryStatCard
            label="Дууссан элсэлт"
            value={formatNumber(overview?.completedEnrollments ?? 0)}
            icon={<CheckCircle2 className="size-5" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
          />
          <SecondaryStatCard
            label="Нийт сертификат"
            value={formatNumber(overview?.totalCertificates ?? 0)}
            icon={<Award className="size-5" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />
        </div>

        {/* Сарын онцлох үзүүлэлтүүд */}
        <div className="mb-8">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Энэ сарын онцлох үзүүлэлтүүд
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GradientStatCard
              label="Энэ сарын шинэ хэрэглэгч"
              value={`+${formatNumber(overview?.newUsersThisMonth ?? 0)}`}
              variant="primary"
              icon={<Users className="size-28 text-white" />}
            />
            <GradientStatCard
              label="Энэ сарын шинэ элсэлт"
              value={`+${formatNumber(overview?.newEnrollmentsThisMonth ?? 0)}`}
              subtitle="Өмнөх сараас өссөн"
              variant="light"
              icon={<GraduationCap className="size-28 text-primary" />}
            />
            <GradientStatCard
              label="Энэ сарын орлого"
              value={formatMNT(overview?.revenueThisMonth ?? 0)}
              subtitle="Өмнөх сараас өссөн"
              variant="light"
              icon={<Banknote className="size-28 text-primary" />}
            />
          </div>
        </div>

        {/* Chart + Recent жагсаалт */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Хэрэглэгчийн идэвх bar chart */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-lg">Хэрэглэгчийн идэвх (Сүүлийн 7 хоног)</h4>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Bar dataKey="value" fill="#9c7aff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Сүүлийн үеийн элсэлтүүд */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-primary/10">
            <h4 className="font-bold text-lg mb-6">Сүүлийн үеийн элсэлтүүд</h4>
            <div className="space-y-1">
              {trend?.data
                .slice(-5)
                .reverse()
                .map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {item.enrollmentCount}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.enrollmentCount} элсэлт бүртгэгдсэн</p>
                      <p className="text-xs text-slate-500">
                        Дууссан: {item.completedCount} · Цуцлагдсан: {item.cancelledCount}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">{item.period}</p>
                  </div>
                ))}
              {(!trend?.data || trend.data.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-8">Мэдээлэл байхгүй</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
