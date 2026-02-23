'use client';

import { ChevronDown, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Mock activity өгөгдөл — долоо хоногийн цаг (pixel утга, max ~110px) */
const ACTIVITY_DATA = [
  { day: 'Mon', height: 33 },
  { day: 'Tue', height: 66 },
  { day: 'Wed', height: 44 },
  { day: 'Thu', height: 55 },
  { day: 'Fri', height: 94, active: true },
  { day: 'Sat', height: 50 },
  { day: 'Sun', height: 77 },
];

export function ProfileCard() {
  const t = useTranslations('dashboard');

  return (
    <div className="flex flex-col bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
      {/* Профайл */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-bold text-gray-900">{t('myProfile')}</h3>
        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-2 pb-4 border-b border-gray-100">
        <div className="w-24 h-24 rounded-full bg-pink-50 p-1 mb-4 relative">
          <div className="w-full h-full rounded-full bg-pink-100 overflow-hidden flex items-center justify-center border-[3px] border-white shadow-sm">
            <span className="text-6xl pt-4">👩🏼‍🏫</span>
          </div>
          <div className="absolute -inset-2 rounded-full border border-pink-100/50 pointer-events-none" />
        </div>
        <h4 className="text-[19px] font-bold text-gray-900 mb-1">Adeline Watson</h4>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          {t('basicMember')} <span className="text-yellow-400">🌟</span>
        </span>
      </div>

      {/* Идэвхийн график */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 mb-0.5">{t('activity')}</span>
            <span className="text-lg font-bold text-gray-900">3.5 {t('hours')}</span>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            {t('weekly')} <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between h-36 relative px-1">
          <div className="absolute top-0 left-[58%] -translate-x-1/2 bg-white border border-gray-100 shadow-lg text-[10px] font-bold px-3 py-1.5 rounded-lg text-gray-600 z-10">
            10 hours
          </div>
          <div className="absolute top-[24px] left-[58%] -translate-x-1/2 w-px h-[8px] bg-gray-200 z-0" />

          {ACTIVITY_DATA.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5 flex-1 group">
              <div
                className={`w-full max-w-[28px] rounded-lg transition-all ${
                  item.active
                    ? 'bg-[repeating-linear-gradient(45deg,rgba(167,139,250,0.7),rgba(167,139,250,0.7)_3px,#A78BFA_3px,#A78BFA_6px)]'
                    : 'bg-[#C4B5FD]'
                } hover:opacity-80`}
                style={{ height: `${item.height}px` }}
              />
              <span className="text-[10px] font-bold text-gray-400">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
