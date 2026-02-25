'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LearnifyLogo } from './learnify-logo';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';

/** Мобайл навигацийн Sheet menu */
export function MobileNav() {
  const t = useTranslations('landing');
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const navLinks = [
    { href: ROUTES.COURSES, label: t('navCourses') },
    { href: '#mentors', label: t('navMentors') },
    { href: '#pricing', label: t('navPricing') },
    { href: '#community', label: t('navCommunity') },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0">
        <div className="flex flex-col h-full">
          {/* Дээд хэсэг — лого + хаах */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
            <LearnifyLogo href="/" />
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Навигацийн линкүүд */}
          <nav className="flex-1 p-6">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center h-12 px-4 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-background dark:hover:bg-slate-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth товчлуурууд */}
          <div className="p-6 border-t border-gray-100 dark:border-slate-800 space-y-3">
            {isAuthenticated ? (
              <Button
                asChild
                className="w-full bg-gradient-to-r from-primary to-[#9575ED] text-white hover:opacity-90"
              >
                <Link href={ROUTES.DASHBOARD} onClick={() => setOpen(false)}>
                  {t('goToDashboard')}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link href={ROUTES.LOGIN} onClick={() => setOpen(false)}>
                    {t('logIn')}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-primary to-[#9575ED] text-white hover:opacity-90"
                >
                  <Link href={ROUTES.REGISTER} onClick={() => setOpen(false)}>
                    {t('getStarted')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
