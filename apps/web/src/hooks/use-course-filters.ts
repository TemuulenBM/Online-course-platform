'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { CourseListParams } from '@/lib/api-services/courses.service';

/** URL search params-ээр course filter state удирдах hook */
export function useCourseFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: CourseListParams = useMemo(
    () => ({
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      sortBy: searchParams.get('sortBy') || 'publishedAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: Number(searchParams.get('page')) || 1,
      limit: 12,
    }),
    [searchParams],
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Filter өөрчлөгдөхөд page 1 рүү буцаах
      if (key !== 'page') {
        params.set('page', '1');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return { filters, setFilter, resetFilters };
}
