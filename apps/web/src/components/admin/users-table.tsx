'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MoreHorizontal } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ChangeRoleDialog } from './change-role-dialog';
import { DeleteUserDialog } from './delete-user-dialog';
import type { AdminUser, AdminUserListMeta } from '@/lib/api-services/admin.service';

interface UsersTableProps {
  users: AdminUser[];
  meta?: AdminUserListMeta;
  page: number;
  onPageChange: (page: number) => void;
}

/** Нэрний эхний үсгүүд */
function getInitials(user: AdminUser): string {
  if (user.profile?.firstName || user.profile?.lastName) {
    const first = user.profile.firstName?.[0] ?? '';
    const last = user.profile.lastName?.[0] ?? '';
    return (first + last).toUpperCase();
  }
  return user.email[0].toUpperCase();
}

/** Хэрэглэгчийн нэрийг харуулах */
function getUserName(user: AdminUser, noName: string): string {
  if (!user.profile) return noName;
  const name = `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim();
  return name || noName;
}

/** Role badge-ийн variant */
function getRoleBadgeVariant(role: string): 'destructive' | 'default' | 'secondary' {
  switch (role) {
    case 'ADMIN':
      return 'destructive';
    case 'TEACHER':
      return 'default';
    default:
      return 'secondary';
  }
}

export function UsersTable({ users, meta, page, onPageChange }: UsersTableProps) {
  const t = useTranslations('admin');
  const tRoles = useTranslations('roles');
  const [roleDialogUser, setRoleDialogUser] = useState<AdminUser | null>(null);
  const [deleteDialogUser, setDeleteDialogUser] = useState<AdminUser | null>(null);

  const totalPages = meta?.totalPages ?? 1;

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('joinedDate')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {t('noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={user.profile?.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{getUserName(user, t('noName'))}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{tRoles(user.role)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setRoleDialogUser(user)}>
                          {t('changeRole')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteDialogUser(user)}
                        >
                          {t('deleteUser')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('totalUsers', { count: meta?.total ?? 0 })}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && onPageChange(page - 1)}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => onPageChange(p)}
                    isActive={p === page}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                  className={
                    page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Dialogs */}
      <ChangeRoleDialog
        user={roleDialogUser}
        open={!!roleDialogUser}
        onOpenChange={(open) => !open && setRoleDialogUser(null)}
      />
      <DeleteUserDialog
        user={deleteDialogUser}
        open={!!deleteDialogUser}
        onOpenChange={(open) => !open && setDeleteDialogUser(null)}
      />
    </>
  );
}
