'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { EnrollmentWithCourse } from '@ocp/shared-types';
import { useCancelEnrollment } from '@/hooks/api';
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

interface CancelEnrollmentDialogProps {
  enrollment: EnrollmentWithCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Элсэлт цуцлах баталгаажуулах dialog */
export function CancelEnrollmentDialog({
  enrollment,
  open,
  onOpenChange,
}: CancelEnrollmentDialogProps) {
  const t = useTranslations('myCourses');
  const tCommon = useTranslations('common');
  const cancelMutation = useCancelEnrollment();

  const handleCancel = () => {
    if (!enrollment) return;
    cancelMutation.mutate(enrollment.id, {
      onSuccess: () => {
        toast.success(t('cancelSuccess'));
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : tCommon('error'));
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('cancelConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('cancelConfirmDesc', { courseTitle: enrollment?.courseTitle || '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" disabled={cancelMutation.isPending}>
            {tCommon('close')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {t('cancelling')}
              </>
            ) : (
              t('cancelEnrollment')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
