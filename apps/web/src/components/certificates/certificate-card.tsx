'use client';

import Link from 'next/link';
import { Eye, Download, BadgeCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/lib/constants';
import type { Certificate } from '@ocp/shared-types';

interface CertificateCardProps {
  certificate: Certificate;
}

/** Сертификатын карт — жагсаалтад хэрэглэгдэнэ */
export function CertificateCard({ certificate }: CertificateCardProps) {
  const t = useTranslations('certificates');

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const handleDownload = () => {
    if (certificate.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
      <div className="flex-1 space-y-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            {t('issuedOn', { date: formattedDate })}
          </p>
          <h3 className="text-lg font-bold leading-snug mb-1">{certificate.courseTitle}</h3>
          <p className="text-slate-500 text-sm font-mono">{certificate.certificateNumber}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="gap-2">
            <Link href={ROUTES.CERTIFICATE_DETAIL(certificate.id)}>
              <Eye className="size-4" />
              {t('view')}
            </Link>
          </Button>
          {certificate.pdfUrl ? (
            <Button variant="secondary" size="sm" className="gap-2" onClick={handleDownload}>
              <Download className="size-4" />
              {t('downloadPdf')}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2" disabled>
                  <Download className="size-4" />
                  {t('downloadPdf')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('pdfGenerating')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      {/* Thumbnail placeholder */}
      <div className="w-full sm:w-40 aspect-[4/3] rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden relative border border-slate-100 dark:border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BadgeCheck className="size-10 text-primary/30" />
        </div>
      </div>
    </div>
  );
}
