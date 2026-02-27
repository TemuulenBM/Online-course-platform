'use client';

import { Download, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Certificate } from '@ocp/shared-types';

interface CourseCertificatesTableProps {
  certificates: Certificate[];
}

/** Сургалтын сертификатуудын хүснэгт */
export function CourseCertificatesTable({ certificates }: CourseCertificatesTableProps) {
  const t = useTranslations('certificates');

  const handleShare = async (cert: Certificate) => {
    const verifyUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/verify?code=${cert.verificationCode}`
        : '';

    if (navigator.share) {
      try {
        await navigator.share({ title: cert.courseTitle, url: verifyUrl });
      } catch {
        /* Хэрэглэгч цуцалсан */
      }
    } else {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success(t('linkCopied'));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 border-b border-primary/10">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('studentName')}
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('studentEmail')}
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('certificateNo')}
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('issuedDateCol')}
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((cert) => {
              const formattedDate = new Date(cert.issuedAt).toLocaleDateString('mn-MN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              const initials = cert.userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <TableRow
                  key={cert.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/10">
                        {initials}
                      </div>
                      <span className="font-medium text-sm">{cert.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{cert.userEmail ?? '-'}</TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-mono font-bold">
                      {cert.certificateNumber}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{formattedDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {cert.pdfUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(cert.pdfUrl!, '_blank')}
                          className="flex items-center gap-1 text-primary hover:underline font-semibold text-xs transition-all"
                        >
                          <Download className="size-3.5" />
                          {t('download')}
                        </button>
                      )}
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleShare(cert)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Share2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
