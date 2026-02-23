'use client';

import { ChevronDown, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Mock activity өгөгдөл — долоо хоногийн цаг */
const ACTIVITY_DATA = [
  { day: 'Mon', height: '30%' },
  { day: 'Tue', height: '60%' },
  { day: 'Wed', height: '40%' },
  { day: 'Thu', height: '50%' },
  { day: 'Fri', height: '85%', active: true },
  { day: 'Sat', height: '45%' },
  { day: 'Sun', height: '70%' },
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
        <div className="flex items-end justify-between h-32 relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border border-gray-100 shadow-lg text-[10px] font-bold px-3 py-1.5 rounded-lg text-gray-600 z-10 hidden sm:block">
            10 hours
          </div>
          <div className="absolute top-[26px] left-[55%] -translate-x-1/2 w-px h-[10px] bg-gray-200 z-0 hidden sm:block" />

          {ACTIVITY_DATA.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 w-8 group">
              <div
                className={`w-6 rounded-md transition-all shadow-sm ${
                  item.active
                    ? 'bg-[repeating-linear-gradient(45deg,rgba(138,147,229,0.8),rgba(138,147,229,0.8)_4px,#8A93E5_4px,#8A93E5_8px)]'
                    : 'bg-[#B4BCF8]'
                } hover:opacity-80`}
                style={{ height: item.height }}
              />
              <span className="text-[10px] font-bold text-gray-400">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
