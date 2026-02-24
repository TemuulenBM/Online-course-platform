'use client';

import { MapPin, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getFileUrl } from '@/lib/utils';
import { useUserStats } from '@/hooks/api/use-profile';
import type { UserProfile } from '@ocp/shared-types';

interface PublicProfileCardProps {
  profile: UserProfile | undefined;
  userId: string;
  isLoading: boolean;
}

export function PublicProfileCard({ profile, userId, isLoading }: PublicProfileCardProps) {
  const { data: stats, isLoading: statsLoading } = useUserStats(userId);

  if (isLoading) {
    return <PublicProfileSkeleton />;
  }

  if (!profile) return null;

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#9c7aff]/10 overflow-hidden mb-8">
      {/* Gradient cover */}
      <div className="h-32 bg-gradient-to-r from-[#9c7aff]/30 via-[#9c7aff]/10 to-transparent" />

      <div className="px-8 pb-8 -mt-16 flex flex-col items-center text-center">
        {/* Аватар */}
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
            <AvatarImage src={getFileUrl(profile.avatarUrl)} className="object-cover" />
            <AvatarFallback className="bg-[#9c7aff]/10 text-[#9c7aff] text-3xl font-bold">
              {initials || <User className="w-12 h-12" />}
            </AvatarFallback>
          </Avatar>
          {/* Ногоон online indicator */}
          <div className="absolute bottom-1 right-1 bg-green-500 border-2 border-white w-5 h-5 rounded-full" />
        </div>

        {/* Нэр */}
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-slate-900">
            {profile.firstName} {profile.lastName}
          </h3>
          {profile.country && (
            <div className="flex items-center justify-center gap-2 text-slate-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-tight">
                {profile.country}
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 max-w-lg">
            <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Stats — бодит дата */}
        <div className="grid grid-cols-3 gap-8 mt-10 w-full max-w-md border-t border-[#9c7aff]/5 pt-8">
          <div className="flex flex-col items-center">
            {statsLoading ? (
              <Skeleton className="h-8 w-8 mb-1" />
            ) : (
              <span className="text-2xl font-bold text-[#9c7aff]">
                {stats?.completedCourses ?? 0}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-400 uppercase">Дуусгасан</span>
          </div>
          <div className="flex flex-col items-center">
            {statsLoading ? (
              <Skeleton className="h-8 w-8 mb-1" />
            ) : (
              <span className="text-2xl font-bold text-[#9c7aff]">{stats?.activeCourses ?? 0}</span>
            )}
            <span className="text-xs font-semibold text-slate-400 uppercase">Үзэж буй</span>
          </div>
          <div className="flex flex-col items-center">
            {statsLoading ? (
              <Skeleton className="h-8 w-8 mb-1" />
            ) : (
              <span className="text-2xl font-bold text-[#9c7aff]">
                {stats?.totalCertificates ?? 0}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-400 uppercase">Сертификат</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Loading skeleton */
function PublicProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#9c7aff]/10 overflow-hidden mb-8">
      <div className="h-32 bg-gradient-to-r from-[#9c7aff]/10 via-[#9c7aff]/5 to-transparent" />
      <div className="px-8 pb-8 -mt-16 flex flex-col items-center">
        <Skeleton className="w-32 h-32 rounded-full" />
        <Skeleton className="h-7 w-48 mt-4" />
        <Skeleton className="h-5 w-36 mt-2" />
        <Skeleton className="h-20 w-96 mt-6" />
        <div className="grid grid-cols-3 gap-8 mt-10 w-full max-w-md pt-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
