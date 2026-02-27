'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SessionTabsProps {
  activeTab: 'info' | 'notes' | 'qa';
  onTabChange: (tab: 'info' | 'notes' | 'qa') => void;
  sessionTitle?: string;
  sessionDescription?: string;
  instructorName?: string;
}

/**
 * Видео доор харагдах tabs: Хичээлийн мэдээлэл / Тэмдэглэл / Асуулт хариулт.
 */
export function SessionTabs({
  activeTab,
  onTabChange,
  sessionTitle,
  sessionDescription,
  instructorName,
}: SessionTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as 'info' | 'notes' | 'qa')}
      className="mt-2 gap-0"
    >
      <TabsList variant="line" className="w-full justify-start gap-8 border-b border-primary/10">
        <TabsTrigger value="info" className="text-sm font-bold">
          Хичээлийн мэдээлэл
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-sm font-bold">
          Тэмдэглэл
        </TabsTrigger>
        <TabsTrigger value="qa" className="text-sm font-bold">
          Асуулт хариулт
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="py-4">
        <div className="space-y-3">
          {sessionTitle && <h3 className="text-lg font-bold">{sessionTitle}</h3>}
          {instructorName && <p className="text-sm text-slate-500">Багш: {instructorName}</p>}
          {sessionDescription ? (
            <p className="text-sm text-slate-600">{sessionDescription}</p>
          ) : (
            <p className="text-sm text-slate-400">Тайлбар байхгүй байна.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="notes" className="py-4">
        <textarea
          className="min-h-[150px] w-full rounded-lg border border-primary/10 bg-white p-3 text-sm focus:ring-2 focus:ring-primary/50"
          placeholder="Хичээлийн тэмдэглэлээ энд бичнэ үү..."
        />
      </TabsContent>

      <TabsContent value="qa" className="py-4">
        <div className="text-center text-sm text-slate-400">
          <p className="mb-2">Асуулт хариултын хэсэг удахгүй нэмэгдэнэ.</p>
          <p>Discussion модультай холбогдох боломжтой.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
