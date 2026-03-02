'use client';

import { ChevronRight, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Mock даалгаврын өгөгдөл */
const MOCK_TASKS = [
  { id: '1', emoji: '👩🏽‍💻', name: 'Make user flow', date: '14 Nov, 05:45' },
  { id: '2', emoji: '✍🏻', name: 'Basic shape', date: '13 Nov, 20:00' },
  { id: '3', emoji: '🤔', name: 'User interview', date: '12 Nov, 19:45' },
];

export function TaskList() {
  const t = useTranslations('dashboard');

  return (
    <div className="flex flex-col bg-card rounded-2xl p-6 border border-border shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[17px] font-bold text-foreground">{t('listTask')}</h2>
        <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {MOCK_TASKS.map((task) => (
          <div key={task.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center text-lg border border-border shadow-sm group-hover:bg-muted/80 transition-colors"
                aria-hidden="true"
              >
                {task.emoji}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-foreground mb-0.5">{task.name}</span>
                <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                  {t('dueDate')} {task.date}
                </span>
              </div>
            </div>
            <button className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
