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
import { SidebarTrigger } from '@/components/ui/sidebar';

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
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight">
              <Video className="size-8 text-primary" />
              Шууд хичээлүүд
            </h1>
            <p className="mt-1 text-slate-500">
              Удахгүй болох шууд хичээлүүдэд нэгдэж, мэдлэгээ бататгаарай.
            </p>
          </div>
        </div>

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

        {/* Хоосон state */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/20 bg-primary/5 py-20">
            <Video className="mb-4 size-12 text-primary/40" />
            <h3 className="mb-2 text-lg font-bold">Одоогоор шууд хичээл алга</h3>
            <p className="text-sm text-slate-500">Удахгүй шинэ хичээлүүд нэмэгдэх болно.</p>
          </div>
        )}
      </div>
    </div>
  );
}
