'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  Clock,
  Star,
  ChevronRight,
  Download,
  Share2,
  Search,
  MoreHorizontal,
  Banknote,
  TrendingUp,
} from 'lucide-react';

import { useCourseStats, useCourseAnalyticsStudents, useCourseLessonStats } from '@/hooks/api';
import { useCourseById } from '@/hooks/api';
import { StatCard } from '@/components/analytics/stat-card';
import { AnalyticsPageSkeleton } from '@/components/analytics/analytics-loading';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatMNT, formatNumber, formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/** Tab сонголтууд */
type TabType = 'students' | 'lessons';

/** Долоо хоногийн товч */
const dayLabels = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Ша', 'Ня'];

const PAGE_LIMIT = 10;

export default function CourseAnalyticsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);

  /** Hooks */
  const { data: course } = useCourseById(courseId);
  const { data: stats, isLoading: statsLoading } = useCourseStats(courseId);
  const { data: studentsData } = useCourseAnalyticsStudents(courseId, {
    page: studentPage,
    limit: PAGE_LIMIT,
  });
  const { data: lessonStats } = useCourseLessonStats(courseId);

  /** Оюутнуудыг нэрээр шүүх (client-side) */
  const filteredStudents = useMemo(() => {
    if (!studentsData?.data) return [];
    if (!studentSearch) return studentsData.data;
    const q = studentSearch.toLowerCase();
    return studentsData.data.filter(
      (s) => s.userName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  }, [studentsData, studentSearch]);

  /** Completion chart өгөгдөл (placeholder 7 хоног) */
  const completionChartData = useMemo(() => {
    return dayLabels.map((name) => ({
      name,
      rate: Math.round(Math.random() * 40 + 30),
    }));
  }, []);

  /** Төлөвийн badge */
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      EXPIRED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    };
    const statusLabels: Record<string, string> = {
      ACTIVE: 'Идэвхтэй',
      COMPLETED: 'Дуусгасан',
      CANCELLED: 'Цуцлагдсан',
      EXPIRED: 'Хугацаа дууссан',
    };
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          map[status] ?? map['EXPIRED'],
        )}
      >
        {statusLabels[status] ?? status}
      </span>
    );
  };

  if (statsLoading) return <AnalyticsPageSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 sticky top-0 z-10">
        <SidebarTrigger className="md:hidden mr-4" />
        <h2 className="text-xl font-bold">Сургалтын аналитик</h2>
      </header>

      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href={ROUTES.TEACHER_COURSES} className="hover:text-primary transition-colors">
            Курсууд
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-primary font-medium">{course?.title || '...'}</span>
        </nav>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {course?.title || 'Сургалтын аналитик'}
            </h1>
            <p className="text-slate-500 mt-1">
              Detailed performance analytics and student engagement metrics
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-primary/5 transition-colors">
              <Download className="size-4" />
              Тайлан татах
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              <Share2 className="size-4" />
              Хуваалцах
            </button>
          </div>
        </div>

        {/* 4 Stat card-ууд */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Нийт элсэлт"
            value={formatNumber(stats?.totalEnrollments ?? 0)}
            icon={<Users className="size-5" />}
          />
          <StatCard
            label="Идэвхтэй"
            value={formatNumber(stats?.activeEnrollments ?? 0)}
            icon={<UserCheck className="size-5" />}
          />
          <StatCard
            label="Төгссөн"
            value={formatNumber(stats?.completedEnrollments ?? 0)}
            icon={<CheckCircle2 className="size-5" />}
          />
          <StatCard
            label="Цуцалсан"
            value={formatNumber(stats?.cancelledEnrollments ?? 0)}
            icon={<XCircle className="size-5" />}
          />
        </div>

        {/* Дуусгалтын хувь chart + Орлого + Дундаж ахиц */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Completion chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-primary/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold">Дуусгалтын хувь (%)</h3>
                <p className="text-sm text-slate-500">Долоо хоногоор харах</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{stats?.completionRate ?? 0}%</p>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 justify-end">
                  <TrendingUp className="size-3" /> Нийт дуусгалт
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={completionChartData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value) => [`${Number(value ?? 0)}%`, 'Дуусгалт']}
                />
                <Bar dataKey="rate" fill="#9c7aff" opacity={0.3} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Side stats */}
          <div className="flex flex-col gap-4">
            {/* Орлого gradient card */}
            <div className="flex-1 bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Banknote className="size-5" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Бүх цаг үеийн</span>
              </div>
              <p className="text-sm opacity-80 mb-1">Нийт орлого</p>
              <p className="text-3xl font-black">{formatMNT(stats?.totalRevenue ?? 0)}</p>
            </div>

            {/* Дундаж ахиц */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-primary/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Дундаж ахиц</p>
                <TrendingUp className="size-5 text-primary" />
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold">{stats?.avgProgress?.toFixed(1) ?? 0}%</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${stats?.avgProgress ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats мөр */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/5 shadow-sm flex items-center gap-4">
            <div className="size-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center rounded-lg">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Нийт хичээл</p>
              <p className="text-xl font-bold">{formatNumber(stats?.totalLessons ?? 0)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/5 shadow-sm flex items-center gap-4">
            <div className="size-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center rounded-lg">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Сертификат</p>
              <p className="text-xl font-bold">{formatNumber(stats?.totalCertificates ?? 0)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/5 shadow-sm flex items-center gap-4">
            <div className="size-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center rounded-lg">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Нийт зарцуулсан цаг</p>
              <p className="text-xl font-bold">
                {formatDuration(stats?.totalTimeSpentSeconds ?? 0)}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/5 shadow-sm flex items-center gap-4">
            <div className="size-10 bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center rounded-lg">
              <Star className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Дундаж үнэлгээ</p>
              <p className="text-xl font-bold">N/A</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-primary/10 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('students')}
              className={cn(
                'px-2 py-4 border-b-2 font-bold text-sm transition-colors',
                activeTab === 'students'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-primary',
              )}
            >
              Оюутны жагсаалт
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={cn(
                'px-2 py-4 border-b-2 font-bold text-sm transition-colors',
                activeTab === 'lessons'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-primary',
              )}
            >
              Хичээлийн статистик
            </button>
          </div>
        </div>

        {/* Tab content: Students */}
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
            {/* Search */}
            <div className="p-4 border-b border-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Оюутны нэр эсвэл имэйлээр хайх..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Students table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Суралцагч</th>
                    <th className="px-6 py-4">Элссэн огноо</th>
                    <th className="px-6 py-4">Ахиц (%)</th>
                    <th className="px-6 py-4">Төлөв</th>
                    <th className="px-6 py-4">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {filteredStudents.map((student) => (
                    <tr key={student.userId} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {student.userName
                              .split(' ')
                              .map((w) => w[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{student.userName}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(student.enrolledAt).toLocaleDateString('mn-MN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                student.progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary',
                              )}
                              style={{
                                width: `${Math.min(student.progressPercentage, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {student.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(student.enrollmentStatus)}</td>
                      <td className="px-6 py-4">
                        <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        Оюутан олдсонгүй
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(studentsData?.total ?? 0) > PAGE_LIMIT && (
              <div className="p-4 border-t border-primary/10 flex items-center justify-between">
                <p className="text-sm text-slate-500">Нийт {studentsData?.total ?? 0} оюутан</p>
                <CoursesPagination
                  page={studentPage}
                  total={studentsData?.total ?? 0}
                  limit={PAGE_LIMIT}
                  onPageChange={setStudentPage}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab content: Lessons */}
        {activeTab === 'lessons' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Хичээлийн нэр</th>
                    <th className="px-6 py-4">Төрөл</th>
                    <th className="px-6 py-4">Дуусгалтын хувь</th>
                    <th className="px-6 py-4">Дундаж хугацаа</th>
                    <th className="px-6 py-4">Дундаж ахиц</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {lessonStats?.map((lesson) => (
                    <tr key={lesson.lessonId} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {lesson.orderIndex + 1}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold">{lesson.lessonTitle}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold uppercase">
                          {lesson.lessonType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${Math.min(lesson.completionRate, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold">{lesson.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDuration(lesson.avgTimeSpentSeconds)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">{lesson.avgProgress}%</td>
                    </tr>
                  ))}
                  {(!lessonStats || lessonStats.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        Хичээлийн мэдээлэл байхгүй
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
