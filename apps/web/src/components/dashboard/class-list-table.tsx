'use client';

import { useTranslations } from 'next-intl';

type ClassStatus = 'on_progress' | 'completed' | 'not_started';

interface ClassItem {
  id: string;
  name: string;
  level: string;
  time: string;
  emoji: string;
  progress: number;
  status: ClassStatus;
}

/** Mock өгөгдөл — ирээдүйд API hook-ээр солино */
const MOCK_CLASSES: ClassItem[] = [
  {
    id: '1',
    name: 'Product Design Tutorial',
    level: 'Beginer',
    time: '08.00 - 10.00',
    emoji: '🪄',
    progress: 50,
    status: 'on_progress',
  },
  {
    id: '2',
    name: 'Illustration Tutorial',
    level: 'Expert',
    time: '11.00 - 12.00',
    emoji: '🎨',
    progress: 80,
    status: 'on_progress',
  },
  {
    id: '3',
    name: 'UX Research',
    level: 'Beginer',
    time: '15.00 - 17.00',
    emoji: '🕵🏻‍♂️',
    progress: 20,
    status: 'on_progress',
  },
];

/** Статус badge-ийн өнгө */
const statusStyles = {
  on_progress: 'bg-[#EAF3EB] text-[#507D5D]',
  completed: 'bg-[#EAF0FC] text-[#5D8FFC]',
  not_started: 'bg-gray-100 text-gray-500',
} as const;

const statusDotStyles = {
  on_progress: 'bg-[#507D5D]',
  completed: 'bg-[#5D8FFC]',
  not_started: 'bg-gray-400',
} as const;

export function ClassListTable() {
  const t = useTranslations('dashboard');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{t('myClassList')}</h3>
        <button className="text-sm font-semibold text-gray-500 bg-white border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
          {t('seeAll')}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 capitalize w-1/2">
                {t('classColumn')}
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 capitalize w-1/4">
                {t('progressColumn')}
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 capitalize w-1/4">
                {t('statusColumn')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_CLASSES.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-xl shrink-0 shadow-sm border border-gray-100">
                      {item.emoji}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-[15px] mb-0.5">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <span>{item.level}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-700">
                      {item.progress}% {t('finish')}
                    </span>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-[#8A93E5] rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center gap-1.5 ${statusStyles[item.status]} px-3 py-1 rounded-full text-[11px] font-bold`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotStyles[item.status]}`} />
                    {item.status === 'on_progress' && t('onProgress')}
                    {item.status === 'completed' && t('completed')}
                    {item.status === 'not_started' && t('notStarted')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
