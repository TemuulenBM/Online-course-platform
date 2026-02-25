'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, GraduationCap, LogIn, Mail } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { loginSchema, type LoginInput } from '@ocp/validation';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { LearnifyLogo } from '@/components/layout/learnify-logo';
import { useLogin } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Зүүн тал — Чимэглэлийн хэсэг */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#EDE7F9] via-[#E0D6F5] to-[#D5CCF0] relative overflow-hidden items-center justify-center p-12">
        {/* Чимэглэлийн blur тойргууд */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#9575ED]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center max-w-md">
          {/* Floating card */}
          <div className="relative mb-10">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-16 bg-[#C4B5F0]/30 rounded-3xl blur-md" />
            <div className="relative w-72 h-64 bg-gradient-to-br from-[#B8A4E8] to-[#C9B8F0] rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="w-20 h-20 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-primary mb-3">{t('decorativeHeading')}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{t('decorativeText')}</p>
        </div>
      </div>

      {/* Баруун тал — Форм */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[440px]">
          {/* Лого */}
          <div className="mb-10">
            <LearnifyLogo href={ROUTES.HOME} />
          </div>

          {/* Гарчиг */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('loginWelcome')}</h1>
            <p className="text-gray-500 text-sm">{t('loginWelcomeSubtitle')}</p>
          </div>

          {/* Алдааны мэдээлэл */}
          {loginMutation.error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100 mb-5">
              <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
                !
              </span>
              {t('invalidCredentials')}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Имэйл */}
            <AuthInput
              id="email"
              label={t('emailLabel')}
              type="email"
              placeholder="example@domain.com"
              rightIcon={<Mail className="w-[18px] h-[18px]" />}
              error={errors.email?.message}
              disabled={loginMutation.isPending}
              {...register('email')}
            />

            {/* Нууц үг */}
            <AuthInput
              id="password"
              label={t('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              labelRight={
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-sm font-semibold text-primary hover:text-[#6c77d4] transition-colors"
                >
                  {t('forgotPasswordQuestion')}
                </Link>
              }
              rightIcon={
                showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )
              }
              onRightIconClick={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
              disabled={loginMutation.isPending}
              {...register('password')}
            />

            {/* Намайг сана */}
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <div className="w-2.5 h-2.5 rounded-full" />
              </div>
              <span className="text-sm text-gray-600">{t('rememberMe')}</span>
            </div>

            {/* Нэвтрэх товч */}
            <AuthButton
              type="submit"
              isLoading={loginMutation.isPending}
              loadingText={t('signingIn')}
              icon={<LogIn className="w-5 h-5" />}
            >
              {t('signIn')}
            </AuthButton>
          </form>

          <AuthDivider />

          {/* Бүртгүүлэх холбоос */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t('noAccount')}{' '}
              <Link
                href={ROUTES.REGISTER}
                className="text-primary font-bold hover:text-[#6c77d4] transition-colors"
              >
                {t('signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
