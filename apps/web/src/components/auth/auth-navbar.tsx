'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LearnifyLogo } from '@/components/layout/learnify-logo';
import { ROUTES } from '@/lib/constants';

interface AuthNavbarProps {
  /** links: "Нүүр" + "Хичээлүүд" холбоосууд, back: буцах arrow */
  variant?: 'links' | 'back';
}

/** Auth хуудсуудын энгийн navbar (reset-password, forgot-password) */
export function AuthNavbar({ variant = 'links' }: AuthNavbarProps) {
  const t = useTranslations('authNavbar');

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <LearnifyLogo href={ROUTES.HOME} />

        {variant === 'links' ? (
          <nav className="flex items-center gap-6">
            <Link
              href={ROUTES.HOME}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('home')}
            </Link>
            <Link
              href={ROUTES.HOME}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('courses')}
            </Link>
          </nav>
        ) : (
          <Link
            href={ROUTES.LOGIN}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>
    </header>
  );
}
