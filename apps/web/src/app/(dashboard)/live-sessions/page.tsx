'use client';

import { useState, useMemo } from 'react';
import { Video } from 'lucide-react';
import { useUpcomingSessions } from '@/hooks/api';
import { FeaturedSessionCard } from '@/components/live-sessions/upcoming/featured-session-card';
import { SessionCard } from '@/components/live-sessions/upcoming/session-card';
import {
  SessionCardSkeleton,
  FeaturedSessionCardSkeleton,
} from '@/components/live-sessions/upcoming/session-card-skeleton';
import { CategoryFilterTabs } from '@/components/live-sessions/upcoming/category-filter-tabs';
import { CtaCard } from '@/components/live-sessions/upcoming/cta-card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLayout } from '@/components/ui/page-layout';
import { PageHeader } from '@/components/ui/page-header';
import { ROUTES } from '@/lib/constants';

/**
 * Удахгүй болох шууд хичээлүүд — /live-sessions
 */
export default function LiveSessionsPage() {
  const { data: paginatedSessions, isLoading } = useUpcomingSessions({ limit: 50 });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const sessions = paginatedSessions?.data ?? [];

  // Client-side category filter
  const filtered = useMemo(() => {
    if (!activeCategory) return sessions;
    return sessions.filter((s) => s.courseId === activeCategory);
  }, [sessions, activeCategory]);

  // Хамгийн ойрын session = featured
  const featured = filtered[0];
  const rest = filtered.slice(1);

  // Категори нэрсийг courses-ийн courseTitle-аас гаргах
  const categoryNames = useMemo(() => {
    const unique = new Map<string, string>();
    sessions.forEach((s) => {
      if (s.courseId && s.courseTitle) unique.set(s.courseId, s.courseTitle);
    });
    return Array.from(unique, ([id, name]) => ({ id, name }));
  }, [sessions]);

  return (
    <PageLayout>
      <PageHeader
        icon={Video}
        title="Шууд хичээлүүд"
        subtitle="Удахгүй болох шууд хичээлүүдэд нэгдэж, мэдлэгээ бататгаарай."
      />

      {/* Категори filter */}
      {categoryNames.length > 0 && (
        <CategoryFilterTabs
          categories={categoryNames}
          activeId={activeCategory}
          onChange={setActiveCategory}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <>
          <FeaturedSessionCardSkeleton />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        </>
      )}

      {/* Featured card */}
      {!isLoading && featured && <FeaturedSessionCard session={featured} />}

      {/* Grid */}
      {!isLoading && rest.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
          <CtaCard />
        </div>
      )}

      {/* Хоосон state — CTA товч нэмэгдсэн */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={Video}
          title="Одоогоор шууд хичээл алга"
          description="Удахгүй шинэ хичээлүүд нэмэгдэх болно."
          action={{ label: 'Сургалт үзэх', href: ROUTES.COURSES }}
        />
      )}
    </PageLayout>
  );
}
