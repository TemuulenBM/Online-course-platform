'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { registerSchema, type RegisterInput } from '@ocp/validation';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { LearnifyLogo } from '@/components/layout/learnify-logo';
import { useRegister } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

/** Google "G" icon SVG */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  const handleGoogleSignUp = () => {
    toast.info(t('comingSoon'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE7F9] via-[#E0D6F5] to-[#D5CCF0] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Чимэглэлийн blur тойргууд */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#9575ED]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[480px]">
        {/* Лого */}
        <div className="mb-6">
          <LearnifyLogo href={ROUTES.HOME} />
        </div>

        {/* Гарчиг */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('registerHeading')}</h1>
        <p className="text-gray-500 text-sm mb-8">{t('registerSubHeading')}</p>

        {/* Карт */}
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full">
          {/* Алдааны мэдээлэл */}
          {registerMutation.error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 border border-red-100 mb-5">
              <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
                !
              </span>
              {t('registrationFailed')}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Овог, Нэр */}
            <div className="grid grid-cols-2 gap-3">
              <AuthInput
                id="lastName"
                label={t('lastName')}
                type="text"
                placeholder={t('lastName')}
                error={errors.lastName?.message}
                disabled={registerMutation.isPending}
                {...formRegister('lastName')}
              />
              <AuthInput
                id="firstName"
                label={t('firstName')}
                type="text"
                placeholder={t('firstName')}
                error={errors.firstName?.message}
                disabled={registerMutation.isPending}
                {...formRegister('firstName')}
              />
            </div>

            {/* Имэйл */}
            <AuthInput
              id="email"
              label={t('emailLabel')}
              type="email"
              placeholder="example@mail.com"
              leftIcon={<Mail className="w-[18px] h-[18px]" />}
              error={errors.email?.message}
              disabled={registerMutation.isPending}
              {...formRegister('email')}
            />

            {/* Нууц үг */}
            <AuthInput
              id="password"
              label={t('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              leftIcon={<Lock className="w-[18px] h-[18px]" />}
              rightIcon={
                showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )
              }
              onRightIconClick={() => setShowPassword(!showPassword)}
              hint={t('passwordMinHint')}
              error={errors.password?.message}
              disabled={registerMutation.isPending}
              {...formRegister('password')}
            />

            {/* Бүртгүүлэх товч */}
            <AuthButton
              type="submit"
              isLoading={registerMutation.isPending}
              loadingText={t('creatingAccount')}
            >
              {t('signUp')}
            </AuthButton>
          </form>

          <AuthDivider />

          {/* Google бүртгүүлэх товч */}
          <AuthButton
            type="button"
            variant="outline"
            icon={<GoogleIcon />}
            iconPosition="left"
            onClick={handleGoogleSignUp}
          >
            {t('signUpWithGoogle')}
          </AuthButton>
        </div>

        {/* Нэвтрэх холбоос */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {t('hasAccount')}{' '}
            <Link
              href={ROUTES.LOGIN}
              className="text-primary font-bold hover:text-[#6c77d4] transition-colors"
            >
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
