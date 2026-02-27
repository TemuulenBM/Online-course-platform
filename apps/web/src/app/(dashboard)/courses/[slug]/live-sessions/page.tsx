'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Video } from 'lucide-react';

import { useCourseBySlug, useCourseSessions } from '@/hooks/api';
import { SessionTimelineCard } from '@/components/live-sessions/history/session-timeline-card';
import {
  SessionFilterTabs,
  type TimeFilter,
} from '@/components/live-sessions/history/session-filter-tabs';
import { HelpSection } from '@/components/live-sessions/history/help-section';
import { SessionTimelineSkeleton } from '@/components/live-sessions/history/session-timeline-skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';

/**
 * Сургалтын session түүх — /courses/[slug]/live-sessions
 */
export default function CourseLiveSessionsHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug);
  const { data: sessionsPaginated, isLoading: sessionsLoading } = useCourseSessions(
    course?.id ?? '',
  );

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const sessions = sessionsPaginated?.data ?? [];

  const filtered = useMemo(() => {
    if (timeFilter === 'upcoming') {
      return sessions.filter((s) => s.status === 'scheduled' || s.status === 'live');
    }
    if (timeFilter === 'past') {
      return sessions.filter((s) => s.status === 'ended' || s.status === 'cancelled');
    }
    return sessions;
  }, [sessions, timeFilter]);

  // Upcoming / Past бүлэглэлт
  const upcomingSessions = filtered.filter((s) => s.status === 'scheduled' || s.status === 'live');
  const pastSessions = filtered.filter((s) => s.status === 'ended' || s.status === 'cancelled');

  const isLoading = courseLoading || sessionsLoading;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            {/* Breadcrumb */}
            <nav className="mb-2 flex items-center gap-2 text-sm">
              <Link href="/my-courses" className="text-slate-500 hover:text-primary">
                Миний сургалтууд
              </Link>
              <ChevronRight className="size-3.5 text-slate-400" />
              <span className="font-medium text-primary">{course?.title ?? slug}</span>
            </nav>
            <h1 className="text-3xl font-extrabold tracking-tight">Хичээлийн хуваарь</h1>
            <p className="text-slate-500">Шууд хичээлүүдэд нэгдэж, бичлэг үзэж, ирцээ хянаарай.</p>
          </div>
        </div>

        {/* Filter */}
        <SessionFilterTabs active={timeFilter} onChange={setTimeFilter} />

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SessionTimelineSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Sessions */}
        {!isLoading && (
          <div className="space-y-4">
            {/* Upcoming */}
            {upcomingSessions.map((s) => (
              <SessionTimelineCard key={s.id} session={s} />
            ))}

            {/* Divider */}
            {upcomingSessions.length > 0 && pastSessions.length > 0 && (
              <div className="pb-4 pt-8">
                <h4 className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-slate-400">
                  Өнгөрсөн хичээлүүд
                  <div className="h-px flex-1 bg-primary/10" />
                </h4>
              </div>
            )}

            {/* Past */}
            {pastSessions.map((s) => (
              <SessionTimelineCard key={s.id} session={s} attended={null} />
            ))}

            {/* Хоосон */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/10 bg-primary/5 py-16">
                <Video className="mb-4 size-10 text-primary/40" />
                <p className="font-bold">Хичээл олдсонгүй</p>
                <p className="text-sm text-slate-500">
                  Энэ сургалтад шууд хичээл товлогдоогүй байна.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Help section */}
        <HelpSection />
      </div>
    </div>
  );
}
