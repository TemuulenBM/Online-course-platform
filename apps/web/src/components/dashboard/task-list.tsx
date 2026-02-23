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
    <div className="flex flex-col bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[17px] font-bold text-gray-900">{t('listTask')}</h3>
        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {MOCK_TASKS.map((task) => (
          <div key={task.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-lg border border-gray-100 shadow-sm group-hover:bg-gray-100 transition-colors">
                {task.emoji}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-gray-900 mb-0.5">{task.name}</span>
                <span className="text-xs font-semibold text-gray-500 tracking-wide">
                  {t('dueDate')} {task.date}
                </span>
              </div>
            </div>
            <button className="text-gray-300 group-hover:text-gray-600 transition-colors">
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
