import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import {
  categoriesAdminService,
  type CreateCategoryData,
  type UpdateCategoryData,
} from '@/lib/api-services/categories-admin.service';

/** Ангилал үүсгэх mutation */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoriesAdminService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.tree });
    },
  });
}

/** Ангилал шинэчлэх mutation */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      categoriesAdminService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.tree });
    },
  });
}

/** Ангилал устгах mutation */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesAdminService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.tree });
    },
  });
}
