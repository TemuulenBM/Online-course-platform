'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { registerSchema, type RegisterInput } from '@ocp/validation';
import { useRegister } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
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

  return (
    <div className="w-full animation-fade-in flex flex-col pt-6 lg:pt-0">
      <div className="text-center lg:text-left mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {t('registerTitle')}
        </h2>
        <p className="text-gray-500 font-medium text-sm">{t('signUpSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {registerMutation.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
            <span className="shrink-0 bg-red-100 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
              !
            </span>
            {t('registrationFailed')}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-800 tracking-wide">
              {t('firstName')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('firstName')}
              type="text"
              placeholder={t('firstNamePlaceholder')}
              className={`w-full px-4 py-3.5 rounded-xl bg-white border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400
                ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 hover:border-gray-300 focus:border-[#8A93E5] focus:ring-4 focus:ring-[#8A93E5]/10'}
              `}
              disabled={registerMutation.isPending}
            />
            {errors.firstName && (
              <p className="text-red-500 text-[13px] font-medium mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-800 tracking-wide">
              {t('lastName')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('lastName')}
              type="text"
              placeholder={t('lastNamePlaceholder')}
              className={`w-full px-4 py-3.5 rounded-xl bg-white border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400
                ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 hover:border-gray-300 focus:border-[#8A93E5] focus:ring-4 focus:ring-[#8A93E5]/10'}
              `}
              disabled={registerMutation.isPending}
            />
            {errors.lastName && (
              <p className="text-red-500 text-[13px] font-medium mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-800 tracking-wide">
            {t('email')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            className={`w-full px-4 py-3.5 rounded-xl bg-white border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400
              ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 hover:border-gray-300 focus:border-[#8A93E5] focus:ring-4 focus:ring-[#8A93E5]/10'}
            `}
            disabled={registerMutation.isPending}
          />
          {errors.email && (
            <p className="text-red-500 text-[13px] font-medium mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-800 tracking-wide">
            {t('password')} <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              className={`w-full pl-4 pr-12 py-3.5 rounded-xl bg-white border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400
                ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 hover:border-gray-300 focus:border-[#8A93E5] focus:ring-4 focus:ring-[#8A93E5]/10'}
              `}
              disabled={registerMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
              disabled={registerMutation.isPending}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[13px] font-medium mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full bg-[#8A93E5] hover:bg-[#7C80EF] text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] mt-6"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('creatingAccount')}
            </>
          ) : (
            t('signUp')
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm font-medium text-gray-600">
          {t('hasAccount')}{' '}
          <Link
            href={ROUTES.LOGIN}
            className="text-[#8A93E5] font-semibold hover:text-[#6c77d4] transition-colors"
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
