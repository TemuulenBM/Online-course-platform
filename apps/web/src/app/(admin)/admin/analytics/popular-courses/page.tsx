'use client';

import { useState } from 'react';
import {
  Download,
  ChevronRight,
  BookOpen,
  Code,
  Megaphone,
  Languages,
  Palette,
  BarChart3,
  Globe,
  Briefcase,
  TrendingUp,
  Users,
  Banknote,
} from 'lucide-react';

import { usePopularCourses } from '@/hooks/api';
import { AnalyticsPageSkeleton } from '@/components/analytics/analytics-loading';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatMNT, formatNumber, exportToCsv } from '@/lib/utils';

/** Курс дугаарт өнгө + icon сонгох */
const courseStyles = [
  { bg: 'bg-primary/10', color: 'text-primary', icon: BookOpen },
  { bg: 'bg-emerald-500/10', color: 'text-emerald-500', icon: Code },
  { bg: 'bg-orange-500/10', color: 'text-orange-500', icon: Megaphone },
  { bg: 'bg-blue-500/10', color: 'text-blue-500', icon: Languages },
  { bg: 'bg-pink-500/10', color: 'text-pink-500', icon: Palette },
  { bg: 'bg-indigo-500/10', color: 'text-indigo-500', icon: BarChart3 },
  { bg: 'bg-red-500/10', color: 'text-red-500', icon: Globe },
  { bg: 'bg-amber-500/10', color: 'text-amber-500', icon: Briefcase },
  { bg: 'bg-cyan-500/10', color: 'text-cyan-500', icon: Code },
  { bg: 'bg-violet-500/10', color: 'text-violet-500', icon: Palette },
];

export default function PopularCoursesPage() {
  const [limit, setLimit] = useState(10);
  const { data: courses, isLoading } = usePopularCourses(limit);

  /** CSV татах */
  const handleExport = () => {
    if (!courses) return;
    exportToCsv(
      courses.map((c, i) => ({
        '#': i + 1,
        Сургалт: c.courseTitle,
        Бүртгүүлсэн: c.enrollmentCount,
        Дуусгасан: c.completionCount,
        Орлого: c.revenue,
      })),
      'top-courses',
    );
  };

  if (isLoading) return <AnalyticsPageSkeleton />;

  /** Нийт орлого, бүртгэл тооцоо */
  const totalRevenue = courses?.reduce((s, c) => s + c.revenue, 0) ?? 0;
  const totalEnrollments = courses?.reduce((s, c) => s + c.enrollmentCount, 0) ?? 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 sticky top-0 z-10">
        <SidebarTrigger className="md:hidden mr-4" />
        <h2 className="text-xl font-bold">Топ сургалтууд</h2>
      </header>

      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Breadcrumb + Title */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span>Аналитик</span>
          <ChevronRight className="size-3" />
          <span className="text-primary font-medium">Топ сургалтууд</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Топ {limit} сургалт</h2>
            <p className="text-slate-500 mt-1">
              Хамгийн их хандалттай болон өндөр орлоготой сургалтуудын нарийвчилсан статистик.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Хязгаар сонголт */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Шүүлтүүр (Хязгаар)
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="appearance-none bg-white dark:bg-slate-900 border border-primary/20 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all"
              >
                <option value={10}>Топ 10</option>
                <option value={20}>Топ 20</option>
                <option value={50}>Топ 50</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2 self-end"
            >
              <Download className="size-4" />
              Татаж авах
            </button>
          </div>
        </div>

        {/* Хүснэгт */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 overflow-hidden shadow-sm mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 border-b border-primary/10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Сургалтын гарчиг
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Бүртгүүлсэн тоо
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Дуусгасан тоо
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Орлого (MNT)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {courses?.map((course, i) => {
                  const style = courseStyles[i % courseStyles.length]!;
                  const Icon = style.icon;
                  return (
                    <tr
                      key={course.courseId}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-10 rounded-lg ${style.bg} flex items-center justify-center`}
                          >
                            <Icon className={`size-5 ${style.color}`} />
                          </div>
                          <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                            {course.courseTitle}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {formatNumber(course.enrollmentCount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {formatNumber(course.completionCount)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right">
                        {formatMNT(course.revenue)}
                      </td>
                    </tr>
                  );
                })}
                {(!courses || courses.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Мэдээлэл байхгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination мэдээ */}
          <div className="p-4 border-t border-primary/10 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Нийт {courses?.length ?? 0} сургалт харуулж байна
            </p>
          </div>
        </div>

        {/* Доод хэсгийн 3 stat card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl flex items-center gap-4">
            <div className="size-12 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="size-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Нийт бүртгэл
              </p>
              <h3 className="text-xl font-bold">{formatNumber(totalEnrollments)}</h3>
              <p className="text-[10px] text-slate-500">Топ {limit} сургалтын нийт</p>
            </div>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-xl flex items-center gap-4">
            <div className="size-12 bg-emerald-500 rounded-full flex items-center justify-center">
              <Banknote className="size-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Нийт орлого
              </p>
              <h3 className="text-xl font-bold">{formatMNT(totalRevenue)}</h3>
              <p className="text-[10px] text-slate-500">Топ {limit} сургалтаас</p>
            </div>
          </div>
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-xl flex items-center gap-4">
            <div className="size-12 bg-indigo-500 rounded-full flex items-center justify-center">
              <Users className="size-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Дундаж бүртгэл
              </p>
              <h3 className="text-xl font-bold">
                {courses && courses.length > 0
                  ? formatNumber(Math.round(totalEnrollments / courses.length))
                  : '0'}
              </h3>
              <p className="text-[10px] text-slate-500">Нэг сургалтад</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
