'use client';

import { ChevronDown, MoreVertical, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMyProfile } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getFileUrl } from '@/lib/utils';

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

/** Role badge-ийн өнгө */
const roleBadgeStyle: Record<string, string> = {
  STUDENT: 'bg-primary/10 text-primary',
  TEACHER: 'bg-emerald-50 text-emerald-600',
  ADMIN: 'bg-amber-50 text-amber-600',
};

export function ProfileCard() {
  const t = useTranslations('dashboard');
  const tr = useTranslations('roles');
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useMyProfile();

  /** Нэрийн эхний үсэг */
  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : (user?.email?.split('@')[0] ?? '');

  const roleKey = user?.role ?? 'STUDENT';

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
        {isLoading ? (
          <>
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-36 mb-2 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </>
        ) : (
          <>
            <div className="mb-4">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarImage src={getFileUrl(profile?.avatarUrl)} alt={fullName} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials || <User className="w-10 h-10" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <h4 className="text-[19px] font-bold text-gray-900 mb-1">{fullName}</h4>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${roleBadgeStyle[roleKey] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {tr(roleKey)}
            </span>
          </>
        )}
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
