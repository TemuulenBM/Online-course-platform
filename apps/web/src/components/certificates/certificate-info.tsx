'use client';

import { Info, Linkedin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { Certificate } from '@ocp/shared-types';

interface CertificateInfoProps {
  certificate: Certificate;
}

/** Сертификатын нэмэлт мэдээлэл + LinkedIn CTA */
export function CertificateInfo({ certificate }: CertificateInfoProps) {
  const t = useTranslations('certificates');

  const verifyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify?code=${certificate.verificationCode}`
      : '';

  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.courseTitle)}&organizationName=Learnify&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(certificate.certificateNumber)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* About certificate */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Info className="size-5 text-primary" />
          {t('aboutCertificate')}
        </h4>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex justify-between">
            <span>{t('totalHours')}</span>
            <span className="font-bold text-slate-900 dark:text-white">
              48 {t('level') === 'Түвшин' ? 'цаг' : 'hrs'}
            </span>
          </li>
          <li className="flex justify-between">
            <span>{t('level')}</span>
            <span className="font-bold text-slate-900 dark:text-white">-</span>
          </li>
          <li className="flex justify-between">
            <span>{t('validity')}</span>
            <span className="font-bold text-slate-900 dark:text-white">{t('unlimited')}</span>
          </li>
        </ul>
      </div>

      {/* LinkedIn CTA */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 flex flex-col justify-center gap-4">
        <p className="text-center text-sm text-slate-500 mb-2">{t('linkedInCongrats')}</p>
        <Button asChild className="w-full bg-[#0077b5] hover:bg-[#006396] text-white gap-2">
          <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
            <Linkedin className="size-5" />
            {t('addToLinkedIn')}
          </a>
        </Button>
      </div>
    </div>
  );
}
