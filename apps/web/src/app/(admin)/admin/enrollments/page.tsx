'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMyCourses, useCourseEnrollments } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import type { EnrollmentStatus } from '@ocp/shared-types';
import { cn } from '@/lib/utils';

/** Статусын монгол нэр */
function getStatusLabel(status: EnrollmentStatus): string {
  switch (status) {
    case 'active':
      return 'Идэвхтэй';
    case 'completed':
      return 'Дууссан';
    case 'cancelled':
      return 'Цуцлагдсан';
    case 'expired':
      return 'Хугацаа дууссан';
    default:
      return status;
  }
}

/** Статусын badge өнгө */
function getStatusStyle(status: EnrollmentStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'completed':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'cancelled':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    case 'expired':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

/** Статусын filter tab-ууд */
const STATUS_TABS: { label: string; value: EnrollmentStatus | undefined }[] = [
  { label: 'Бүгд', value: undefined },
  { label: 'Идэвхтэй', value: 'active' },
  { label: 'Дууссан', value: 'completed' },
  { label: 'Цуцлагдсан', value: 'cancelled' },
  { label: 'Хугацаа дууссан', value: 'expired' },
];

const LIMIT = 20;

export default function AdminEnrollmentsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  /** Бүх сургалтуудын жагсаалт (бүх status, admin/teacher эрхтэй) */
  const { data: courses = [] } = useMyCourses();

  /** Сонгосон сургалтын элсэлтүүд */
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useCourseEnrollments(
    selectedCourseId,
    { page, limit: LIMIT, status: statusFilter },
  );

  const enrollments = enrollmentsData?.data ?? [];
  const meta = enrollmentsData?.meta;

  /** Сургалт солих үед page болон filter-г reset хийнэ */
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setPage(1);
    setStatusFilter(undefined);
  };

  /** Статус солих үед page-г reset хийнэ */
  const handleStatusChange = (status: EnrollmentStatus | undefined) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Элсэлтийн удирдлага</h1>
          <p className="mt-1 text-sm text-slate-500">
            Сургалт сонгон оюутнуудын элсэлтийг удирдана
          </p>
        </div>
      </div>

      {/* Сургалт сонгох */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Сургалт сонгох</label>
        <select
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="w-full max-w-xl px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        >
          <option value="">— Сургалт сонгоно уу —</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Статус filter tabs */}
      {selectedCourseId && (
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => handleStatusChange(tab.value)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                statusFilter === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Сургалт сонгоогүй үе */}
      {!selectedCourseId && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-primary/30">
          <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <GraduationCap className="size-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Сургалт сонгоно уу</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Дээрхи dropdown-оос сургалт сонгоход тухайн сургалтын оюутнуудын элсэлтийг харна
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {selectedCourseId && enrollmentsLoading && <EnrollmentTableSkeleton />}

      {/* Хоосон жагсаалт */}
      {selectedCourseId && !enrollmentsLoading && enrollments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-border">
          <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
            <GraduationCap className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Элсэлт олдсонгүй</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {statusFilter
              ? 'Энэ статустай элсэлт байхгүй байна'
              : 'Энэ сургалтад одоогоор элссэн оюутан байхгүй'}
          </p>
        </div>
      )}

      {/* Элсэлтийн хүснэгт */}
      {selectedCourseId && !enrollmentsLoading && enrollments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
          {/* Нийт тоо */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-primary/10 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Нийт <span className="font-semibold text-foreground">{meta?.total ?? 0}</span> элсэлт
            </span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-primary/10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Оюутан</span>
            <span>И-мэйл</span>
            <span>Статус</span>
            <span>Элссэн огноо</span>
            <span className="text-right">Үйлдэл</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-primary/5">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                {/* Оюутны нэр */}
                <span className="text-sm font-medium text-foreground truncate">
                  {enrollment.userName || '—'}
                </span>

                {/* И-мэйл */}
                <span className="text-sm text-muted-foreground truncate">
                  {enrollment.userEmail || '—'}
                </span>

                {/* Статус */}
                <span
                  className={cn(
                    'inline-flex px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap',
                    getStatusStyle(enrollment.status),
                  )}
                >
                  {getStatusLabel(enrollment.status)}
                </span>

                {/* Элссэн огноо */}
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(enrollment.enrolledAt).toLocaleDateString('sv-SE')}
                </span>

                {/* Дэлгэрэнгүй холбоос */}
                <Link
                  href={ROUTES.ADMIN_ENROLLMENT_DETAIL(enrollment.id)}
                  className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <Eye className="size-3.5" />
                  Харах
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-primary/10 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {page} / {meta.totalPages} хуудас
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Loading skeleton */
function EnrollmentTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-primary/10 px-6 py-3">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-primary/10 px-6 py-3 flex gap-10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12 ml-auto" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-primary/5 flex items-center gap-10">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16 rounded-lg ml-auto" />
        </div>
      ))}
    </div>
  );
}
