'use client';

import { Award } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/empty-state';

/** Сургалтад сертификат олгогдоогүй empty state */
export function CourseCertificatesEmpty() {
  const t = useTranslations('certificates');

  return (
    <EmptyState
      icon={Award}
      title={t('noCoursesCertificates')}
      description={t('noCoursesCertificatesDesc')}
      className="mt-8"
    />
  );
}
