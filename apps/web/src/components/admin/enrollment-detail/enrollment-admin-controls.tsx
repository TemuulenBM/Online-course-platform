'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Trash2, Zap, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCompleteEnrollment, useDeleteEnrollment } from '@/hooks/api';
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
import { ROUTES } from '@/lib/constants';

interface EnrollmentAdminControlsProps {
  enrollmentId: string;
  status: string;
}

/** Admin удирдлагын самбар — Complete + Delete */
export function EnrollmentAdminControls({ enrollmentId, status }: EnrollmentAdminControlsProps) {
  const router = useRouter();
  const t = useTranslations('enrollments');
  const tc = useTranslations('common');

  const [completeOpen, setCompleteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const completeMutation = useCompleteEnrollment();
  const deleteMutation = useDeleteEnrollment();

  const handleComplete = () => {
    completeMutation.mutate(enrollmentId, {
      onSuccess: () => {
        toast.success(t('completeSuccess'));
        setCompleteOpen(false);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : tc('error'));
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(enrollmentId, {
      onSuccess: () => {
        toast.success(t('deleteSuccess'));
        setDeleteOpen(false);
        router.push(ROUTES.ADMIN_ENROLLMENTS);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : tc('error'));
      },
    });
  };

  const canComplete = status === 'active';

  return (
    <>
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10 shadow-lg ring-1 ring-primary/5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          {t('adminControlPanel')}
        </h3>
        <div className="space-y-4">
          {/* Complete */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">{t('completeManuallyDesc')}</p>
            <button
              type="button"
              disabled={!canComplete}
              onClick={() => setCompleteOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="size-4" />
              {t('completeManually')}
            </button>
          </div>

          <hr className="border-primary/5 my-4" />

          {/* Delete */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">{t('deleteEnrollmentDesc')}</p>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-transparent text-red-500 border border-red-200 dark:border-red-900/30 py-3 px-4 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            >
              <Trash2 className="size-4" />
              {t('deleteEnrollment')}
            </button>
          </div>
        </div>
      </div>

      {/* Complete Dialog */}
      <AlertDialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('completeConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('completeConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={completeMutation.isPending}>
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  {t('completing')}
                </>
              ) : (
                tc('confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  {t('deleting')}
                </>
              ) : (
                tc('delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
