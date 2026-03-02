'use client';

import { ListChecks } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { LiveSession } from '@ocp/shared-types';
import { SessionListCard } from './session-list-card';

interface SessionListSidebarProps {
  sessions: LiveSession[];
  onOpen?: (session: LiveSession) => void;
  onStart?: (session: LiveSession) => void;
  onEdit?: (session: LiveSession) => void;
  onDelete?: (session: LiveSession) => void;
}

/**
 * Баруун sidebar — tabs (Явагдаж буй / Товлогдсон / Дууссан) + session cards.
 */
export function SessionListSidebar({
  sessions,
  onOpen,
  onStart,
  onEdit,
  onDelete,
}: SessionListSidebarProps) {
  const liveSessions = sessions.filter((s) => s.status === 'live');
  const scheduledSessions = sessions.filter((s) => s.status === 'scheduled');
  const endedSessions = sessions.filter((s) => s.status === 'ended');

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-primary/10 bg-white">
      {/* Header */}
      <div className="border-b border-primary/10 bg-primary/5 p-4">
        <h4 className="flex items-center gap-2 font-bold text-slate-700">
          <ListChecks className="size-5 text-primary" />
          Хичээлийн жагсаалт
        </h4>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="live" className="flex flex-1 flex-col gap-0">
        <TabsList variant="line" className="w-full justify-start border-b border-primary/10 px-2">
          <TabsTrigger value="live" className="text-xs">
            Явагдаж буй
            {liveSessions.length > 0 && (
              <span className="ml-1 rounded-full bg-green-500 px-1.5 text-[10px] font-bold text-white">
                {liveSessions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs">
            Товлогдсон
            {scheduledSessions.length > 0 && (
              <span className="ml-1 rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-600">
                {scheduledSessions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ended" className="text-xs">
            Дууссан
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="max-h-[600px] space-y-2 overflow-y-auto p-2">
          {liveSessions.length === 0 ? (
            <EmptyState text="Одоогоор явагдаж буй хичээл алга" />
          ) : (
            liveSessions.map((s) => (
              <SessionListCard
                key={s.id}
                session={s}
                onOpen={() => onOpen?.(s)}
                onEdit={() => onEdit?.(s)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="max-h-[600px] space-y-2 overflow-y-auto p-2">
          {scheduledSessions.length === 0 ? (
            <EmptyState text="Товлогдсон хичээл алга" />
          ) : (
            scheduledSessions.map((s) => (
              <SessionListCard
                key={s.id}
                session={s}
                onStart={() => onStart?.(s)}
                onEdit={() => onEdit?.(s)}
                onDelete={() => onDelete?.(s)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="ended" className="max-h-[600px] space-y-2 overflow-y-auto p-2">
          {endedSessions.length === 0 ? (
            <EmptyState text="Дууссан хичээл алга" />
          ) : (
            endedSessions.map((s) => <SessionListCard key={s.id} session={s} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ListChecks className="mb-2 size-8 text-slate-300" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
