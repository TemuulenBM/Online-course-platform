'use client';

import { use, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCourseBySlug, useDiscussionPosts } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscussionBreadcrumbs } from '@/components/discussions/discussion-breadcrumbs';
import { DiscussionSearchBar } from '@/components/discussions/discussion-search-bar';
import { DiscussionFilterTabs } from '@/components/discussions/discussion-filter-tabs';
import { DiscussionSortToggle } from '@/components/discussions/discussion-sort-toggle';
import { DiscussionPostCard } from '@/components/discussions/discussion-post-card';
import { DiscussionPostCardSkeleton } from '@/components/discussions/discussion-post-card-skeleton';
import { DiscussionPagination } from '@/components/discussions/discussion-pagination';
import { DiscussionEmptyState } from '@/components/discussions/discussion-empty-state';

export default function CourseDiscussionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslations('discussions');
  const router = useRouter();
  const searchParams = useSearchParams();

  /** URL search params-аас эхлэлийн утгууд */
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialPostType = searchParams.get('postType') || undefined;
  const initialSortBy = searchParams.get('sortBy') || 'newest';
  const initialSearch = searchParams.get('search') || '';

  const [page, setPage] = useState(initialPage);
  const [postType, setPostType] = useState<string | undefined>(initialPostType);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [search, setSearch] = useState(initialSearch);

  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug);

  const { data, isLoading: postsLoading } = useDiscussionPosts(course?.id || '', {
    page,
    limit: 10,
    postType: postType as 'question' | 'discussion' | undefined,
    sortBy: sortBy as 'newest' | 'votes' | 'views',
    search: search || undefined,
  });

  /** URL params sync */
  const syncUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'newest' && val !== '1') {
          newParams.set(key, val);
        }
      });
      const qs = newParams.toString();
      router.replace(`${ROUTES.COURSE_DISCUSSIONS(slug)}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      });
    },
    [router, slug],
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    syncUrl({ page: String(newPage), postType, sortBy, search });
  };

  const handleFilterChange = (val: string | undefined) => {
    setPostType(val);
    setPage(1);
    syncUrl({ page: '1', postType: val, sortBy, search });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPage(1);
    syncUrl({ page: '1', postType, sortBy: val, search });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    syncUrl({ page: '1', postType, sortBy, search: val });
  };

  if (courseLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <DiscussionPostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500">
        {t('courseNotFound')}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <DiscussionBreadcrumbs
          items={[
            { label: t('breadcrumbHome'), href: ROUTES.DASHBOARD },
            { label: t('breadcrumbDiscussions') },
          ]}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-start justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('forumTitle')}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">{t('forumSubtitle')}</p>
          </div>
          <Link href={ROUTES.COURSE_DISCUSSION_NEW(slug)}>
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-6 shadow-md shadow-primary/20">
              <Plus className="size-4 mr-1.5" />
              {t('newPost')}
            </Button>
          </Link>
        </motion.div>

        {/* Хайлт */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-5"
        >
          <DiscussionSearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder={t('searchPlaceholder')}
          />
        </motion.div>

        {/* Filter + Sort */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-6"
        >
          <DiscussionFilterTabs value={postType} onChange={handleFilterChange} />
          <DiscussionSortToggle value={sortBy} onChange={handleSortChange} />
        </motion.div>

        {/* Нийтлэлүүдийн жагсаалт */}
        {postsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <DiscussionPostCardSkeleton key={i} />
            ))}
          </div>
        ) : data?.posts?.length ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04 } },
            }}
            className="space-y-4"
          >
            {data.posts.map((post) => (
              <DiscussionPostCard
                key={post.id}
                post={post}
                href={ROUTES.COURSE_DISCUSSION_POST(slug, post.id)}
              />
            ))}
          </motion.div>
        ) : (
          <DiscussionEmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
        )}

        {/* Pagination */}
        {data && (
          <DiscussionPagination
            page={data.page}
            total={data.total}
            limit={data.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
