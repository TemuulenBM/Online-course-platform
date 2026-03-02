'use client';

import { Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/empty-state';
import { ROUTES } from '@/lib/constants';

/** Сертификат байхгүй үеийн empty state */
export function CertificatesEmpty() {
  const t = useTranslations('certificates');

  return (
    <EmptyState
      icon={Trophy}
      title={t('noCertificates')}
      description={t('noCertificatesDesc')}
      action={{ label: t('browseCourses'), href: ROUTES.COURSES }}
    />
  );
}
