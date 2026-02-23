'use client';

import { Camera, Loader2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMyProfile } from '@/hooks/api';
import { useMyEnrollments } from '@/hooks/api/use-enrollments';
import { useMyCertificates } from '@/hooks/api/use-certificates';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function ProfileHeader() {
  const t = useTranslations('profile');
  const tr = useTranslations('roles');
  const user = useAuthStore((s) => s.user);

  const { data: profile, isLoading } = useMyProfile();
  const { data: enrollments } = useMyEnrollments({ page: 1, limit: 1 });
  const { data: certificates } = useMyCertificates({ page: 1, limit: 1 });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-7 h-7 animate-spin text-[#8A93E5]" />
        </div>
      </div>
    );
  }

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  const memberDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('mn-MN', {
        year: 'numeric',
        month: 'long',
      })
    : '';

  const locationText = profile?.country ?? '';

  /** Role badge өнгө */
  const roleBadgeStyle: Record<string, string> = {
    STUDENT: 'bg-[#8A93E5]/10 text-[#8A93E5]',
    TEACHER: 'bg-emerald-50 text-emerald-600',
    ADMIN: 'bg-amber-50 text-amber-600',
  };

  const totalEnrollments = enrollments?.total ?? 0;
  const totalCertificates = certificates?.total ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar + Edit overlay */}
        <div className="relative group shrink-0">
          <Avatar className="w-24 h-24 border-4 border-white shadow-md">
            <AvatarImage src={profile?.avatarUrl} alt={t('avatarAlt')} />
            <AvatarFallback className="bg-[#8A93E5]/10 text-[#8A93E5] text-2xl font-bold">
              {initials || <User className="w-10 h-10" />}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#8A93E5] hover:bg-[#7B8AD4] text-white rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Мэдээлэл */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2.5 mb-1">
            <h2 className="text-xl font-bold text-gray-900">
              {profile?.firstName} {profile?.lastName}
            </h2>
            {user?.role && (
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${roleBadgeStyle[user.role] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {tr(user.role)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {t('memberSince', { date: memberDate })}
            {locationText && ` • ${locationText}`}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center sm:justify-start gap-0 mt-4">
            <div className="text-center px-5 first:pl-0">
              <p className="text-lg font-bold text-gray-900">{totalEnrollments}</p>
              <p className="text-xs text-gray-500 font-medium">{t('coursesCount')}</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-center px-5">
              <p className="text-lg font-bold text-gray-900">{totalCertificates}</p>
              <p className="text-xs text-gray-500 font-medium">{t('certificatesCount')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
