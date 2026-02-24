'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAdminUsers } from '@/hooks/api/use-admin';
import { UsersTable } from '@/components/admin/users-table';
import { RoleFilterTabs } from '@/components/admin/role-filter-tabs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const limit = 20;

  const { data, isLoading } = useAdminUsers({
    page,
    limit,
    role: roleFilter as 'STUDENT' | 'TEACHER' | 'ADMIN' | undefined,
  });

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-2xl font-bold">{t('usersTitle')}</h1>
            <p className="mt-1 text-muted-foreground">{t('usersSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Role шүүлтүүр */}
      <RoleFilterTabs
        value={roleFilter}
        onChange={(val) => {
          setRoleFilter(val);
          setPage(1);
        }}
      />

      {/* Хэрэглэгчид хүснэгт */}
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
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
