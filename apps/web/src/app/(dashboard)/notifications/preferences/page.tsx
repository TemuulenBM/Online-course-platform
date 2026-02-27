'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Mail, Smartphone, MessageSquare, LayoutGrid, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/api';
import { NotificationChannelToggle } from '@/components/notifications/notification-channel-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

/** Мэдэгдэл тохиргоо хуудас — суваг бүрийг auto-save toggle-ээр удирдана */
export default function NotificationPreferencesPage() {
  const t = useTranslations('notifications');
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  /** Аль суваг шинэчлэгдэж байгааг хянах */
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  /** Toggle дарахад шууд API дуудна (auto-save) */
  const handleToggle = (field: 'emailEnabled' | 'pushEnabled' | 'smsEnabled', value: boolean) => {
    setUpdatingField(field);
    updateMutation.mutate(
      { [field]: value },
      {
        onSuccess: () => {
          toast.success(t('preferencesSaved'));
          setUpdatingField(null);
        },
        onError: () => {
          toast.error(t('preferencesError'));
          setUpdatingField(null);
        },
      },
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={ROUTES.NOTIFICATIONS}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft className="size-4" />
              {t('viewNotifications')}
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            {t('preferences')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t('preferencesDescription')}</p>
        </div>

        {/* Сувгуудын жагсаалт */}
        {isLoading ? (
          <PreferencesSkeleton />
        ) : (
          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <NotificationChannelToggle
              icon={Mail}
              title={t('emailNotification')}
              description={t('emailDescription')}
              enabled={preferences?.emailEnabled ?? true}
              loading={updatingField === 'emailEnabled'}
              onToggle={(value) => handleToggle('emailEnabled', value)}
            />
            <NotificationChannelToggle
              icon={Smartphone}
              title={t('pushNotification')}
              description={t('pushDescription')}
              enabled={preferences?.pushEnabled ?? true}
              loading={updatingField === 'pushEnabled'}
              onToggle={(value) => handleToggle('pushEnabled', value)}
            />
            <NotificationChannelToggle
              icon={MessageSquare}
              title={t('smsNotification')}
              description={t('smsDescription')}
              enabled={preferences?.smsEnabled ?? false}
              loading={updatingField === 'smsEnabled'}
              onToggle={(value) => handleToggle('smsEnabled', value)}
            />
            <NotificationChannelToggle
              icon={LayoutGrid}
              title={t('inAppNotification')}
              description={t('inAppDescription')}
              enabled={true}
              locked={true}
              onToggle={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Preferences ачаалагдаж байх үеийн skeleton */
function PreferencesSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-5 justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}
