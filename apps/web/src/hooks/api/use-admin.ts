'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api-services/admin.service';
import type { AdminUserListParams } from '@/lib/api-services/admin.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Хэрэглэгчдийн жагсаалт (ADMIN only) */
export function useAdminUsers(params?: AdminUserListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users(params),
    queryFn: () => adminService.listUsers(params),
  });
}

/** Хэрэглэгчийн эрх солих (ADMIN only) */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },
  });
}

/** Хэрэглэгч устгах (ADMIN only) */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },
  });
}
