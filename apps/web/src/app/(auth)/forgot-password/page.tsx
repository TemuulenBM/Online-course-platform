'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ChevronLeft, Mail, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@ocp/validation';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthNavbar } from '@/components/auth/auth-navbar';
import { AuthFooter } from '@/components/auth/auth-footer';
import { useForgotPassword } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => setIsSubmitted(true),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE7F9] via-[#E0D6F5] to-[#D5CCF0] flex flex-col">
      <AuthNavbar variant="back" />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-[480px]">
          {isSubmitted ? (
            /* Амжилттай илгээгдсэн төлөв */
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <MailCheck className="w-9 h-9 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('checkEmail')}</h2>
              <p className="text-gray-500 text-sm max-w-[300px] mb-8 leading-relaxed">
                {t('checkEmailSubtitle')}
              </p>
              <Link href={ROUTES.LOGIN} className="w-full">
                <AuthButton icon={<ArrowLeft className="w-5 h-5" />} iconPosition="left">
                  {t('backToLogin')}
                </AuthButton>
              </Link>
            </div>
          ) : (
            /* Формын төлөв */
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('forgotPasswordHeading')}
              </h1>
              <p className="text-gray-500 text-sm mb-8">{t('forgotPasswordHintNew')}</p>

              {/* Алдааны мэдээлэл */}
              {forgotPasswordMutation.error && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100 mb-5">
                  <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                  {t('serverError')}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <AuthInput
                  id="email"
                  label={t('emailLabel')}
                  type="email"
                  placeholder="example@mail.com"
                  leftIcon={<Mail className="w-[18px] h-[18px]" />}
                  error={errors.email?.message}
                  disabled={forgotPasswordMutation.isPending}
                  {...register('email')}
                />

                <AuthButton
                  type="submit"
                  isLoading={forgotPasswordMutation.isPending}
                  loadingText={t('sending')}
                >
                  {t('send')}
                </AuthButton>
              </form>

              {/* Буцах холбоос */}
              <div className="text-center mt-6">
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-[#6c77d4] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('goBack')}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
