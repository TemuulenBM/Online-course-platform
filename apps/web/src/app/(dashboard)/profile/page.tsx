'use client';

import { useTranslations } from 'next-intl';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileForm } from '@/components/profile/profile-form';

export default function ProfilePage() {
  const t = useTranslations('profile');

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 lg:p-10 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      <ProfileHeader />
      <ProfileForm />
    </div>
  );
}
