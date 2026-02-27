'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

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
import { useDeleteUser } from '@/hooks/api/use-admin';
import type { AdminUser } from '@/lib/api-services/admin.service';

interface DeleteUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    if (!user) return;

    deleteUser.mutate(user.id, {
      onSuccess: () => {
        toast.success(t('userDeleted'));
        onOpenChange(false);
      },
      onError: () => {
        toast.error(tCommon('error'));
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteUserTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteUserDesc', { email: user?.email ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUser.isPending ? tCommon('loading') : tCommon('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
