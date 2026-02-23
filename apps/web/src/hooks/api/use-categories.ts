'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/lib/api-services/categories.service';
import { QUERY_KEYS } from '@/lib/constants';

/** Ангиллуудын мод бүтэц (ховор өөрчлөгдөнө — 30 мин staleTime) */
export function useCategoryTree() {
  return useQuery({
    queryKey: QUERY_KEYS.categories.tree,
    queryFn: () => categoriesService.getTree(),
    staleTime: 30 * 60 * 1000,
  });
}
