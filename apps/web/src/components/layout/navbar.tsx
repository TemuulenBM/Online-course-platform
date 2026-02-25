'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearnifyLogo } from './learnify-logo';
import { MobileNav } from './mobile-nav';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

/** Landing page-ийн дээд навигаци — scroll дээр frosted glass effect */
export function Navbar() {
  const t = useTranslations('landing');
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: ROUTES.COURSES, label: t('navCourses') },
    { href: '#mentors', label: t('navMentors') },
    { href: '#pricing', label: t('navPricing') },
    { href: '#community', label: t('navCommunity') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-sm border-b border-gray-100/80 dark:border-slate-800/80'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Лого */}
          <LearnifyLogo href="/" />

          {/* Төвийн навигац — зөвхөн desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary/70 transition-colors rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Баруун хэсэг */}
          <div className="flex items-center gap-2">
            {/* Хайлтын icon */}
            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
              <Search className="size-5" />
            </Button>

            {/* Auth товчлуурууд — зөвхөн desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <Button
                  asChild
                  className="bg-gradient-to-r from-primary to-[#9575ED] text-white hover:opacity-90 rounded-full px-6"
                >
                  <Link href={ROUTES.DASHBOARD}>{t('goToDashboard')}</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    <Link href={ROUTES.LOGIN}>{t('logIn')}</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-primary to-[#9575ED] text-white hover:opacity-90 rounded-full px-6"
                  >
                    <Link href={ROUTES.REGISTER}>{t('getStarted')}</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Мобайл menu */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
