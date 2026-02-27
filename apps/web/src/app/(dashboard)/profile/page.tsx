'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileInput } from '@ocp/validation';
import { toast } from 'sonner';

import { useMyProfile, useUpdateProfile } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { ProfileInfoCard } from '@/components/profile/profile-header';
import { BasicInfoCard } from '@/components/profile/profile-form';
import { LocationTimeCard } from '@/components/profile/location-time-card';
import { CourseProgressCard } from '@/components/profile/course-progress-card';
import { UpcomingTasksCard } from '@/components/profile/upcoming-tasks-card';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  const onSubmit = handleSubmit((data: UpdateProfileInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Профайл амжилттай шинэчлэгдлээ');
      },
      onError: () => {
        toast.error('Профайл шинэчлэхэд алдаа гарлаа');
      },
    });
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Profile Info Card — gradient + avatar + buttons */}
      <ProfileInfoCard
        profile={profile}
        user={user}
        isLoading={isLoading}
        isDirty={isDirty}
        isPending={updateMutation.isPending}
        onSave={onSubmit}
        onCancel={() => reset()}
      />

      {/* 2/3 + 1/3 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Зүүн багана 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <BasicInfoCard
            register={register}
            errors={errors}
            email={user?.email ?? ''}
            isPending={updateMutation.isPending}
            isLoading={isLoading}
          />
          <LocationTimeCard
            register={register}
            setValue={setValue}
            watch={watch}
            isPending={updateMutation.isPending}
            isLoading={isLoading}
          />
        </div>

        {/* Баруун багана 1/3 */}
        <div className="space-y-6">
          <CourseProgressCard />
          <UpcomingTasksCard />
        </div>
      </div>
    </div>
  );
}
