'use client';

import { useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Clock, ShieldCheck, Trash2 } from 'lucide-react';
import { ChangeRoleDialog } from './change-role-dialog';
import { DeleteUserDialog } from './delete-user-dialog';
import type { AdminUser, AdminUserListMeta } from '@/lib/api-services/admin.service';

interface UsersTableProps {
  users: AdminUser[];
  meta?: AdminUserListMeta;
  page: number;
  onPageChange: (page: number) => void;
}

/** Нэрний эхний үсэг */
function getInitial(user: AdminUser): string {
  if (user.profile?.firstName) return user.profile.firstName[0].toUpperCase();
  return user.email[0].toUpperCase();
}

/** Хэрэглэгчийн нэр */
function getUserName(user: AdminUser): string {
  if (!user.profile) return user.email.split('@')[0];
  const name = `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim();
  return name || user.email.split('@')[0];
}

/** Avatar initial-ийн өнгө role-ээр */
function getInitialStyle(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-primary/10 text-primary';
    case 'TEACHER':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

/** Role badge стиль */
function getRoleBadgeStyle(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-primary/15 text-primary';
    case 'TEACHER':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

export function UsersTable({ users, meta, page, onPageChange }: UsersTableProps) {
  const [roleDialogUser, setRoleDialogUser] = useState<AdminUser | null>(null);
  const [deleteDialogUser, setDeleteDialogUser] = useState<AdminUser | null>(null);

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const limit = meta?.limit ?? 20;
  const from = total > 0 ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);

  return (
    <>
      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
        {/* Desktop table — md-ээс дээш */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-primary/10">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Профайл нэр</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Имэйл</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Эрх</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Баталгаажсан</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Бүртгүүлсэн огноо
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Хэрэглэгч олдсонгүй
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getInitialStyle(user.role)}`}
                        >
                          {getInitial(user)}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {getUserName(user)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.emailVerified ? (
                        <div className="flex items-center gap-1.5 text-green-500">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Тийм</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">Үгүй</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRoleDialogUser(user)}
                          className="p-2.5 min-w-[44px] min-h-[44px] text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center"
                          title="Эрх өөрчлөх"
                        >
                          <ShieldCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteDialogUser(user)}
                          className="p-2.5 min-w-[44px] min-h-[44px] text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                          title="Устгах"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view — md-ээс доош */}
        <div className="md:hidden divide-y divide-primary/5">
          {users.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400">Хэрэглэгч олдсонгүй</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getInitialStyle(user.role)}`}
                    >
                      {getInitial(user)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{getUserName(user)}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {user.emailVerified ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Баталгаажсан
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" /> Баталгаажаагүй
                      </>
                    )}
                  </div>
                  <span>{new Date(user.createdAt).toLocaleDateString('sv-SE')}</span>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setRoleDialogUser(user)}
                    className="p-2.5 min-w-[44px] min-h-[44px] text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center"
                    title="Эрх өөрчлөх"
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeleteDialogUser(user)}
                    className="p-2.5 min-w-[44px] min-h-[44px] text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                    title="Устгах"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="px-6 py-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/10">
            <div className="text-sm text-slate-500">
              Нийт {total} хэрэглэгчээс {from}-{to} харуулж байна
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => page > 1 && onPageChange(page - 1)}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-primary text-white'
                      : 'border border-primary/10 hover:bg-primary/10'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => page < totalPages && onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
