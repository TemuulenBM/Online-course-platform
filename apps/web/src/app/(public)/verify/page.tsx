'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useVerifyCertificate } from '@/hooks/api';
import { VerifyHeader } from '@/components/certificates/verify/verify-header';
import { VerifySearchForm } from '@/components/certificates/verify/verify-search-form';
import { VerifyResult } from '@/components/certificates/verify/verify-result';
import { VerifyNotFound } from '@/components/certificates/verify/verify-not-found';
import { VerifyResultSkeleton } from '@/components/certificates/verify/verify-result-skeleton';
import { VerifyFooter } from '@/components/certificates/verify/verify-footer';

export default function VerifyPage() {
  const t = useTranslations('certificates');
  const searchParams = useSearchParams();

  const [inputCode, setInputCode] = useState('');
  const [searchCode, setSearchCode] = useState('');

  /** URL-д ?code= параметр байвал автоматаар хайна */
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      setInputCode(urlCode);
      setSearchCode(urlCode);
    }
  }, [searchParams]);

  const { data: certificate, isLoading, isError } = useVerifyCertificate(searchCode);

  const handleSearch = () => {
    if (inputCode.trim()) {
      setSearchCode(inputCode.trim());
    }
  };

  return (
    <>
      <VerifyHeader />

      <main className="flex flex-1 justify-center py-12 px-6">
        <div className="flex flex-col max-w-[800px] flex-1 gap-8">
          {/* Hero Section */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              {t('verification')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
              {t('verificationDesc')}
            </p>
          </div>

          {/* Search form */}
          <VerifySearchForm
            code={inputCode}
            onCodeChange={setInputCode}
            onSubmit={handleSearch}
            isLoading={isLoading}
          />

          {/* Results */}
          {isLoading && <VerifyResultSkeleton />}

          {!isLoading && certificate && <VerifyResult certificate={certificate} />}

          {!isLoading && isError && searchCode && <VerifyNotFound />}

          {/* Footer */}
          <VerifyFooter />
        </div>
      </main>
    </>
  );
}
