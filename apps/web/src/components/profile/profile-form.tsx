'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, Shield, SlidersHorizontal, User as UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { updateProfileSchema, type UpdateProfileInput } from '@ocp/validation';
import { useMyProfile, useUpdateProfile } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

/** Input талбарын стиль */
const inputBase =
  'w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 text-sm';
const inputFocus = 'focus:border-[#8A93E5] focus:ring-2 focus:ring-[#8A93E5]/20 focus:bg-white';
const inputError = 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50';

/** Tab-ийн тодорхойлолт */
const TABS = [
  { key: 'personalInfo', icon: UserIcon },
  { key: 'security', icon: Shield },
  { key: 'preferences', icon: SlidersHorizontal },
] as const;

/** Bio тэмдэгтийн дээд хязгаар */
const BIO_MAX_LENGTH = 500;

export function ProfileForm() {
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const user = useAuthStore((s) => s.user);

  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      bio: '',
      country: '',
      timezone: '',
    },
  });

  const bioValue = watch('bio') ?? '';

  /** Профайл ачаалагдсаны дараа формыг populate хийх */
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        bio: profile.bio ?? '',
        country: profile.country ?? '',
        timezone: profile.timezone ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: UpdateProfileInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success(t('updateSuccess'));
      },
      onError: () => {
        toast.error(t('updateError'));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-[#8A93E5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 lg:px-8">
        <div className="flex gap-6">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = i === 0;
            return (
              <button
                key={tab.key}
                className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#8A93E5] text-[#8A93E5]'
                    : 'border-transparent text-gray-400 hover:text-gray-600 cursor-default'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(tab.key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="p-6 lg:p-8">
        {/* Section header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">{t('accountDetails')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('accountDetailsSubtitle')}</p>
        </div>

        {updateMutation.error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 border border-red-100 mb-5">
            <span className="shrink-0 bg-red-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold">
              !
            </span>
            {t('updateError')}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Нэр, Овог — 2 багана */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                {t('firstName')}
              </label>
              <input
                id="firstName"
                {...register('firstName')}
                placeholder={t('firstName')}
                className={`${inputBase} ${errors.firstName ? inputError : inputFocus}`}
                disabled={updateMutation.isPending}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs font-medium mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                {t('lastName')}
              </label>
              <input
                id="lastName"
                {...register('lastName')}
                placeholder={t('lastName')}
                className={`${inputBase} ${errors.lastName ? inputError : inputFocus}`}
                disabled={updateMutation.isPending}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs font-medium mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Имэйл — read-only */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              {t('email')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={user?.email ?? ''}
                readOnly
                disabled
                className={`${inputBase} pl-10 bg-gray-100 text-gray-500 cursor-not-allowed`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{t('emailHelp')}</p>
          </div>

          {/* Намтар + character count */}
          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
              {t('bio')}
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              placeholder={t('bio')}
              rows={4}
              maxLength={BIO_MAX_LENGTH}
              className={`${inputBase} resize-none ${errors.bio ? inputError : inputFocus}`}
              disabled={updateMutation.isPending}
            />
            <div className="flex justify-between items-center">
              {errors.bio ? (
                <p className="text-red-500 text-xs font-medium">{errors.bio.message}</p>
              ) : (
                <span />
              )}
              <p
                className={`text-xs ${bioValue.length > BIO_MAX_LENGTH * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}
              >
                {t('bioCharCount', { count: bioValue.length, max: BIO_MAX_LENGTH })}
              </p>
            </div>
          </div>

          {/* Байршил, Цагийн бүс — 2 багана */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="country" className="text-sm font-semibold text-gray-700">
                {t('country')}
              </label>
              <input
                id="country"
                {...register('country')}
                placeholder={t('country')}
                className={`${inputBase} ${errors.country ? inputError : inputFocus}`}
                disabled={updateMutation.isPending}
              />
              {errors.country && (
                <p className="text-red-500 text-xs font-medium mt-1">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="timezone" className="text-sm font-semibold text-gray-700">
                {t('timezone')}
              </label>
              <input
                id="timezone"
                {...register('timezone')}
                placeholder={t('timezone')}
                className={`${inputBase} ${errors.timezone ? inputError : inputFocus}`}
                disabled={updateMutation.isPending}
              />
              {errors.timezone && (
                <p className="text-red-500 text-xs font-medium mt-1">{errors.timezone.message}</p>
              )}
            </div>
          </div>

          {/* Хадгалах товч + separator */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateMutation.isPending || !isDirty}
                className="bg-[#8A93E5] hover:bg-[#7B8AD4] text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  tc('save')
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
