'use client';

import { Share2, Download, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Certificate } from '@ocp/shared-types';

interface CertificateDetailHeaderProps {
  certificate: Certificate;
}

/** Сертификатын дэлгэрэнгүй хуудасны дээд хэсэг */
export function CertificateDetailHeader({ certificate }: CertificateDetailHeaderProps) {
  const t = useTranslations('certificates');

  const verifyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify?code=${certificate.verificationCode}`
      : '';

  const handleShare = async () => {
    const shareData = {
      title: certificate.courseTitle,
      text: `${certificate.userName} - ${certificate.courseTitle}`,
      url: verifyUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* Хэрэглэгч цуцалсан */
      }
    } else {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success(t('linkCopied'));
    }
  };

  const handleDownload = () => {
    if (certificate.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank');
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 md:px-10 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary">
          <Award className="size-5" />
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-tight">{t('certificateDetail')}</h2>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="sm" className="gap-2" onClick={handleShare}>
          <Share2 className="size-4" />
          <span className="hidden md:inline">{t('share')}</span>
        </Button>
        {certificate.pdfUrl ? (
          <Button size="sm" className="gap-2 shadow-lg shadow-primary/20" onClick={handleDownload}>
            <Download className="size-4" />
            <span className="hidden md:inline">{t('downloadPdf')}</span>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="gap-2" disabled>
                <Download className="size-4" />
                <span className="hidden md:inline">{t('downloadPdf')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('pdfGenerating')}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
