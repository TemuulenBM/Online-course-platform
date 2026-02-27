'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUpdateUserRole } from '@/hooks/api/use-admin';
import type { AdminUser } from '@/lib/api-services/admin.service';

interface ChangeRoleDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roles = ['STUDENT', 'TEACHER', 'ADMIN'] as const;

export function ChangeRoleDialog({ user, open, onOpenChange }: ChangeRoleDialogProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const updateRole = useUpdateUserRole();

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  const handleSubmit = () => {
    if (!user || !selectedRole || selectedRole === user.role) return;

    updateRole.mutate(
      { userId: user.id, role: selectedRole },
      {
        onSuccess: () => {
          toast.success(t('roleUpdated'));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(tCommon('error'));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('changeRoleTitle')}</DialogTitle>
          <DialogDescription>{t('changeRoleDesc', { email: user?.email ?? '' })}</DialogDescription>
        </DialogHeader>

        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectRole')} />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {tRoles(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateRole.isPending || selectedRole === user?.role}
          >
            {updateRole.isPending ? tCommon('loading') : tCommon('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
