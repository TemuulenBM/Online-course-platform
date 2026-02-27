'use client';

import { useState } from 'react';
import { Download, Plus, Users } from 'lucide-react';

import { useAdminUsers } from '@/hooks/api/use-admin';
import { UsersTable } from '@/components/admin/users-table';
import { UsersFilterBar } from '@/components/admin/role-filter-tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<boolean | undefined>(undefined);
  const limit = 20;

  const { data, isLoading } = useAdminUsers({
    page,
    limit,
    role: roleFilter as 'STUDENT' | 'TEACHER' | 'ADMIN' | undefined,
    emailVerified: emailVerifiedFilter,
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#9c7aff]/10 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-[#9c7aff]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Хэрэглэгчийн удирдлага</h1>
            <p className="mt-1 text-sm text-slate-500">
              Бүртгэлтэй хэрэглэгчдийг удирдаж, эрх зөвшөөрлийг тохируулна
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f6f5f8] text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Экспорт
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-5 py-2.5 bg-[#9c7aff] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#9c7aff]/25 hover:bg-[#8b6ae6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Шинэ хэрэглэгч
          </button>
        </div>
      </div>

      {/* Шүүлтүүр */}
      <UsersFilterBar
        roleFilter={roleFilter}
        onRoleFilterChange={(val) => {
          setRoleFilter(val);
          setPage(1);
        }}
        emailVerifiedFilter={emailVerifiedFilter}
        onEmailVerifiedFilterChange={(val) => {
          setEmailVerifiedFilter(val);
          setPage(1);
        }}
        onClearFilters={() => {
          setRoleFilter(undefined);
          setEmailVerifiedFilter(undefined);
          setPage(1);
        }}
      />

      {/* Хэрэглэгчдийн хүснэгт */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <UsersTable users={data?.data ?? []} meta={data?.meta} page={page} onPageChange={setPage} />
      )}
    </div>
  );
}

/** Loading skeleton */
function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#9c7aff]/10 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 border-b border-[#9c7aff]/10 px-6 py-4">
        <div className="flex gap-10">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-[#9c7aff]/5 flex items-center gap-10">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2 ml-auto">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      ))}
      {/* Pagination skeleton */}
      <div className="bg-slate-50 px-6 py-4 border-t border-[#9c7aff]/10 flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-1">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
