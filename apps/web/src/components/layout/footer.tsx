'use client';

import { useTranslations } from 'next-intl';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { LearnifyLogo } from './learnify-logo';

/** Landing page-ийн хөл хэсэг */
export function Footer() {
  const t = useTranslations('landing');

  const columns = [
    {
      title: t('footerCompany'),
      links: [t('footerAbout'), t('footerCareers'), t('footerPartners'), t('footerBlog')],
    },
    {
      title: t('footerResources'),
      links: [t('footerCommunity'), t('footerMentors'), t('footerCourses'), t('footerFreeTrials')],
    },
    {
      title: t('footerSupport'),
      links: [t('footerHelpCenter'), t('footerPrivacy'), t('footerTerms'), t('footerContact')],
    },
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Дээд хэсэг: Лого + линкүүд */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Лого + тайлбар */}
          <div className="lg:col-span-2">
            <LearnifyLogo href="/" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              {t('footerDesc')}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Линк баганууд */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary/70 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-gray-100 dark:bg-slate-800" />

        {/* Доод хэсэг: Copyright */}
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          {t('footerCopyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
