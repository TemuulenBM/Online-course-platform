'use client';

import { useTranslations } from 'next-intl';

export function HeroBanner() {
  const t = useTranslations('dashboard');

  return (
    <div className="bg-[#2E3035] rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg h-auto md:h-[260px]">
      <div className="z-10 text-white max-w-[320px]">
        <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-3">
          {t('heroBannerLabel')}
        </p>
        <h2 className="text-3xl font-bold leading-[1.15] mb-6">{t('heroBannerTitle')}</h2>
        <button className="bg-white text-gray-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors">
          {t('seeAll')}
        </button>
      </div>

      {/* Чимэглэлийн элементүүд */}
      <div className="absolute right-0 bottom-0 top-0 w-[60%] pointer-events-none hidden md:block">
        <div
          className="absolute left-[10%] bottom-[20%] text-[#95C27F] opacity-80"
          style={{ transform: 'rotate(-15deg)', fontSize: '100px' }}
        >
          🌿
        </div>
        <div
          className="absolute right-[-10%] top-[10%] text-[#507D5D] opacity-80"
          style={{ transform: 'rotate(15deg) scaleX(-1)', fontSize: '120px' }}
        >
          🌿
        </div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[60%] bg-[#FFD166] rounded-tl-full opacity-90 blur-[2px]" />
        <div className="absolute right-[20%] bottom-[10%] text-[180px] drop-shadow-xl z-10 font-emoji leading-none mb-[-25px]">
          👩🏼‍🦰
        </div>
        <div className="absolute right-[10%] bottom-[0%] w-32 h-24 bg-primary rounded-t-xl z-20 -rotate-6 border-b-[6px] border-[#6972C3]" />
        <div className="absolute top-[15%] left-[30%] text-sm text-white/80">✦</div>
        <div className="absolute top-[20%] right-[30%] text-2xl drop-shadow-md">✈️</div>
        <div className="absolute top-[40%] right-[45%] w-2 h-2 rounded-full bg-white/40" />
        <div className="absolute top-[30%] left-[20%] text-xl text-[#FFD166]">★</div>
      </div>
    </div>
  );
}
