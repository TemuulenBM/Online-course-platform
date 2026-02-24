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

/** Бусад хэрэглэгчийн профайл авах */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.users.profileById(userId),
    queryFn: () => usersService.getUserProfile(userId),
    enabled: !!userId,
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

/** Аватар upload mutation */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => usersService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.profile,
      });
    },
  });
}

/** Хэрэглэгчийн статистик авах */
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.users.stats(userId),
    queryFn: () => usersService.getUserStats(userId),
    enabled: !!userId,
  });
}
