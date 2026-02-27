'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  UserPlus,
  Users,
  Download,
  Search,
  MoreVertical,
  Clock,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

import { useCourseAnalyticsStudents, useCourseStats } from '@/hooks/api';
import { useCourseById } from '@/hooks/api';
import { AnalyticsPageSkeleton } from '@/components/analytics/analytics-loading';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber, formatDuration, exportToCsv } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

type StatusFilter = 'all' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const PAGE_LIMIT = 20;

export default function CourseStudentsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  /** Hooks */
  const { data: course } = useCourseById(courseId);
  const { data: stats } = useCourseStats(courseId);
  const { data: studentsData, isLoading } = useCourseAnalyticsStudents(courseId, {
    page,
    limit: PAGE_LIMIT,
  });

  const students = studentsData?.data ?? [];
  const total = studentsData?.total ?? 0;

  /** Client-side шүүлтүүр */
  const filteredStudents = useMemo(() => {
    let result = students;

    /** Status шүүлт */
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.enrollmentStatus === statusFilter);
    }

    /** Нэр / имэйл хайлт */
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.userName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
      );
    }

    return result;
  }, [students, statusFilter, searchQuery]);

  /** Tab тоо тооцоо */
  const statusCounts = useMemo(() => {
    const counts = { all: students.length, ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 };
    students.forEach((s) => {
      if (s.enrollmentStatus === 'ACTIVE') counts.ACTIVE++;
      else if (s.enrollmentStatus === 'COMPLETED') counts.COMPLETED++;
      else if (s.enrollmentStatus === 'CANCELLED') counts.CANCELLED++;
    });
    return counts;
  }, [students]);

  /** Filter солих үед page reset */
  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  /** CSV export */
  const handleExport = () => {
    if (!filteredStudents.length) return;
    exportToCsv(
      filteredStudents.map((s) => ({
        Оюутан: s.userName,
        Имэйл: s.email,
        Төлөв: s.enrollmentStatus,
        'Явц (%)': s.progressPercentage,
        'Зарцуулсан хугацаа': formatDuration(s.totalTimeSpentSeconds),
        Хичээл: `${s.completedLessons}/${s.totalLessons}`,
        'Элссэн огноо': new Date(s.enrolledAt).toLocaleDateString('mn-MN'),
      })),
      `students-${courseId}`,
    );
  };

  /** Status badge */
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      CANCELLED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Идэвхтэй',
      COMPLETED: 'Дуусгасан',
      CANCELLED: 'Цуцлагдсан',
    };
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          map[status] ?? 'bg-slate-100 text-slate-700',
        )}
      >
        {labels[status] ?? status}
      </span>
    );
  };

  /** Progress bar өнгө */
  const getProgressColor = (pct: number, status: string) => {
    if (status === 'CANCELLED') return 'bg-slate-400';
    if (pct >= 100) return 'bg-green-500';
    return 'bg-primary';
  };

  if (isLoading) return <AnalyticsPageSkeleton />;

  /** Pagination текст */
  const from = Math.min((page - 1) * PAGE_LIMIT + 1, total);
  const to = Math.min(page * PAGE_LIMIT, total);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-xl font-bold">
            {course?.title ? `${course.title} — Оюутнууд` : 'Оюутнууд'}
          </h2>
        </div>
      </header>

      <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link
            href={ROUTES.TEACHER_COURSES}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            Хичээлийн шинжилгээ
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-slate-900 dark:text-white font-medium">Оюутнуудын жагсаалт</span>
        </nav>

        {/* Page title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Курсын оюутнууд</h2>
            <p className="text-slate-500 mt-1">
              Энэхүү курст бүртгэлтэй оюутнуудын явц болон идэвхийг хянах.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl h-10 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
            >
              <Download className="size-4" />
              CSV татах
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 rounded-xl h-10 px-4 bg-primary/50 text-white text-sm font-bold cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    <UserPlus className="size-4" />
                    Оюутныг урих
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Удахгүй нээгдэнэ</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Tabs + Search + Table */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-primary/10 mb-8">
          {/* Status tabs */}
          <div className="flex border-b border-primary/10 px-6 overflow-x-auto">
            {(
              [
                { key: 'all', label: `Бүх оюутнууд (${formatNumber(statusCounts.all)})` },
                { key: 'ACTIVE', label: 'Идэвхтэй' },
                { key: 'COMPLETED', label: 'Дуусгасан' },
                { key: 'CANCELLED', label: 'Цуцлагдсан' },
              ] as { key: StatusFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key)}
                className={cn(
                  'px-4 py-4 whitespace-nowrap border-b-2 text-sm font-bold transition-colors',
                  statusFilter === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-primary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-4 bg-slate-50/50 dark:bg-transparent">
            <div className="flex w-full items-stretch rounded-xl h-12 bg-white dark:bg-slate-800 border border-primary/10 focus-within:ring-2 ring-primary/20 transition-all">
              <div className="text-slate-400 flex items-center justify-center pl-4">
                <Search className="size-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Нэр эсвэл имэйлээр хайх..."
                className="flex w-full border-none bg-transparent focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 px-4 text-sm"
              />
            </div>
          </div>

          {/* Students table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-y border-primary/5">
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                    Оюутан
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                    Төлөв
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                    Явц %
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                    Зарцуулсан цаг
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                    Хичээл
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                    Элссэн огноо
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400" />
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredStudents.map((student) => (
                  <tr key={student.userId} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {student.userName
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{student.userName}</span>
                          <span className="text-xs text-slate-500">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(student.enrollmentStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              getProgressColor(
                                student.progressPercentage,
                                student.enrollmentStatus,
                              ),
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
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDuration(student.totalTimeSpentSeconds)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {student.completedLessons}/{student.totalLessons}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(student.enrolledAt).toLocaleDateString('mn-MN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                          <Users className="size-8" />
                        </div>
                        <h3 className="text-lg font-bold">Оюутан олдсонгүй</h3>
                        <p className="text-slate-500 mt-1">
                          Шүүлтүүр солих эсвэл хайлтаа өөрчилнө үү.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-primary/10">
            <p className="text-sm text-slate-500">
              Нийт {total} оюутнаас {from}-{to}-ийг харуулж байна
            </p>
            {total > PAGE_LIMIT && (
              <CoursesPagination
                page={page}
                total={total}
                limit={PAGE_LIMIT}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>

        {/* Footer stat card-ууд */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 flex items-center gap-4">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Энэ сарын элсэлт</p>
              <h3 className="text-2xl font-bold">+{formatNumber(stats?.activeEnrollments ?? 0)}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 flex items-center gap-4">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Дундаж зарцуулсан цаг</p>
              <h3 className="text-2xl font-bold">
                {formatDuration(
                  stats?.totalTimeSpentSeconds
                    ? Math.round(stats.totalTimeSpentSeconds / Math.max(stats.totalEnrollments, 1))
                    : 0,
                )}
              </h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 flex items-center gap-4">
            <div className="size-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Дуусгалтын хувь</p>
              <h3 className="text-2xl font-bold">{stats?.completionRate ?? 0}%</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
