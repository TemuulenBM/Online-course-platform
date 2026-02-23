'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileInput } from '@ocp/validation';
import { usersService } from '@/lib/api-services/users.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Миний профайл авах */
export function useMyProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.users.profile,
    queryFn: () => usersService.getMyProfile(),
  });
}

/** Профайл шинэчлэх mutation */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => usersService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.profile,
      });
    },
  });
}
