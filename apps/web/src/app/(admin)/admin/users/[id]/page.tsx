'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Trash2,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

import { useDeleteUser } from '@/hooks/api/use-admin';
import { ChangeRoleDialog } from '@/components/admin/change-role-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { AdminUser } from '@/lib/api-services/admin.service';

/** Дүрийн badge стиль */
const roleBadgeStyle: Record<string, string> = {
  ADMIN: 'bg-primary/15 text-primary',
  TEACHER: 'bg-green-100 text-green-800',
  STUDENT: 'bg-blue-100 text-blue-800',
};

/** Avatar initial өнгө */
const initialStyle: Record<string, string> = {
  ADMIN: 'bg-primary/10 text-primary',
  TEACHER: 'bg-green-100 text-green-700',
  STUDENT: 'bg-blue-100 text-blue-700',
};

/** Дүрийн монгол нэр */
const roleLabels: Record<string, string> = {
  ADMIN: 'Администратор',
  TEACHER: 'Багш',
  STUDENT: 'Оюутан',
};

/** Хэрэглэгчийн дэлгэрэнгүй хуудас — URL search params-аас мэдээлэл авна */
export default function UserDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = params.id as string;
  const email = searchParams.get('email') ?? '';
  const role = (searchParams.get('role') ?? 'STUDENT') as 'STUDENT' | 'TEACHER' | 'ADMIN';
  const name = searchParams.get('name') ?? email.split('@')[0] ?? '';
  const createdAt = searchParams.get('createdAt') ?? '';
  const emailVerified = searchParams.get('emailVerified') === 'true';

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(role);

  const deleteUser = useDeleteUser();

  /** Dialogs-д дамжуулах AdminUser объект */
  const user: AdminUser = {
    id: userId,
    email,
    role: currentRole,
    emailVerified,
    createdAt,
    profile: {
      id: '',
      userId,
      firstName: name.split(' ')[0] ?? null,
      lastName: name.split(' ').slice(1).join(' ') || null,
      avatarUrl: null,
    },
  };

  /** Устгах + жагсаалт руу буцах */
  const handleDelete = () => {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        toast.success('Хэрэглэгч амжилттай устгагдлаа');
        router.push('/admin/users');
      },
      onError: () => {
        toast.error('Устгахад алдаа гарлаа');
      },
    });
  };

  const initial = (name[0] ?? email[0] ?? '?').toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link
            href="/admin/users"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-3" />
            Хэрэглэгчид
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-primary font-medium">{name || email}</span>
        </div>

        {/* Хэрэглэгчийн мэдээллийн карт */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm overflow-hidden mb-6">
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar initial */}
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl shrink-0 ${initialStyle[currentRole] ?? 'bg-slate-100 text-slate-700'}`}
            >
              {initial}
            </div>

            {/* Дэлгэрэнгүй мэдээлэл */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">{name || email}</h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadgeStyle[currentRole] ?? 'bg-slate-100 text-slate-700'}`}
                >
                  {roleLabels[currentRole] ?? currentRole}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mt-2">
                <div className="flex items-center gap-1.5">
                  <Mail className="size-4" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {emailVerified ? (
                    <CheckCircle className="size-4 text-green-500" />
                  ) : (
                    <Clock className="size-4" />
                  )}
                  <span>{emailVerified ? 'Имэйл баталгаажсан' : 'Баталгаажаагүй'}</span>
                </div>
                {createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    <span>
                      Бүртгэлтэй:{' '}
                      {new Date(createdAt).toLocaleDateString('mn-MN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Үйлдлийн карт */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Удирдлагын үйлдлүүд</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setIsRoleDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              <ShieldCheck className="size-4" />
              Эрх солих
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <Trash2 className="size-4" />
              Устгах
            </Button>
          </div>
        </div>
      </div>

      {/* Эрх солих dialog */}
      <ChangeRoleDialog
        user={user}
        open={isRoleDialogOpen}
        onOpenChange={(open) => {
          setIsRoleDialogOpen(open);
          if (!open && user.role !== currentRole) {
            setCurrentRole(user.role);
          }
        }}
      />

      {/* Устгах баталгаажуулах dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Хэрэглэгч устгах</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{email}</strong> хэрэглэгчийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцааж
              болохгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Болих</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? 'Устгаж байна...' : 'Устгах'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
