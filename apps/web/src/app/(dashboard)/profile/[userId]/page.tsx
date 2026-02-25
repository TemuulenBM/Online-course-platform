'use client';

import { use } from 'react';
import { Shield } from 'lucide-react';
import { useUserProfile } from '@/hooks/api';
import { PublicProfileCard } from '@/components/profile/public-profile-card';
import { PublicProfileTabs } from '@/components/profile/public-profile-tabs';

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { data: profile, isLoading, error } = useUserProfile(userId);

  /** Алдааны төлөв */
  if (error && !isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-xl border border-red-200 p-16 text-center">
          <p className="text-slate-500 text-lg font-medium">Хэрэглэгч олдсонгүй</p>
          <p className="text-slate-400 text-sm mt-2">
            Энэ хэрэглэгч бүртгэлгүй эсвэл профайл үүсгээгүй байна.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <PublicProfileCard profile={profile} userId={userId} isLoading={isLoading} />
      <PublicProfileTabs userId={userId} />

      {/* Footer */}
      <footer className="mt-auto py-10 flex justify-center opacity-50 text-xs">
        <div className="flex items-center gap-1 text-slate-500">
          <Shield className="w-4 h-4" />
          <span>Энэ бол олон нийтэд нээлттэй профайл хуудас юм.</span>
        </div>
      </footer>
    </div>
  );
}
