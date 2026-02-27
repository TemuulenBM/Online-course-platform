'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUploadAvatar } from '@/hooks/api/use-profile';
import { getFileUrl } from '@/lib/utils';
import { AvatarCropModal } from './avatar-crop-modal';
import type { UserProfile, User as UserType } from '@ocp/shared-types';

interface ProfileInfoCardProps {
  profile: UserProfile | undefined;
  user: UserType | null;
  isLoading: boolean;
  isDirty: boolean;
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
}

/** Role badge стиль */
const roleBadgeStyle: Record<string, string> = {
  STUDENT: 'bg-[#9c7aff]/20 text-[#9c7aff]',
  TEACHER: 'bg-emerald-100 text-emerald-700',
  ADMIN: 'bg-[#9c7aff]/20 text-[#9c7aff]',
};

export function ProfileInfoCard({
  profile,
  user,
  isLoading,
  isDirty,
  isPending,
  onSave,
  onCancel,
}: ProfileInfoCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  if (isLoading) {
    return <ProfileInfoSkeleton />;
  }

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  /** Файл сонгоход crop modal нээх */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файлын хэмжээ 5MB-аас хэтрэхгүй байх ёстой');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    /* input-ийг reset хийх — дахин ижил файл сонгох боломжтой */
    e.target.value = '';
  };

  /** Crop modal-аас Blob авч upload хийх */
  const handleCropDone = (blob: Blob) => {
    setCropModalOpen(false);
    setSelectedImageSrc(null);

    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success('Аватар амжилттай шинэчлэгдлээ'),
      onError: () => toast.error('Аватар upload хийхэд алдаа гарлаа'),
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#9c7aff]/5 overflow-hidden mb-8">
      {/* Gradient banner */}
      <div className="h-32 bg-gradient-to-r from-[#9c7aff]/30 via-[#9c7aff]/10 to-transparent" />

      <div className="px-8 pb-8 -mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Аватар */}
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage
                    src={getFileUrl(profile?.avatarUrl)}
                    className="object-cover object-top"
                  />
                  <AvatarFallback className="bg-[#9c7aff]/10 text-[#9c7aff] text-3xl font-bold rounded-none">
                    {initials || <User className="w-12 h-12" />}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Нуусан file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#9c7aff] text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
              >
                {uploadAvatar.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Нэр + Role + Email */}
            <div className="text-center md:text-left mb-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold text-slate-900">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                {user?.role && (
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-lg border border-[#9c7aff]/20 ${roleBadgeStyle[user.role] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Товчнууд */}
          <div className="flex gap-3 self-center md:self-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={!isDirty || isPending}
              className="px-6 py-2.5 bg-[#f6f5f8] text-slate-600 font-semibold rounded-xl hover:bg-[#9c7aff]/10 hover:text-[#9c7aff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Цуцлах
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!isDirty || isPending}
              className="px-8 py-2.5 bg-[#9c7aff] text-white font-bold rounded-xl shadow-lg shadow-[#9c7aff]/25 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Хадгалах
            </button>
          </div>
        </div>
      </div>

      {/* Аватар crop modal */}
      {selectedImageSrc && (
        <AvatarCropModal
          open={cropModalOpen}
          imageSrc={selectedImageSrc}
          onClose={() => {
            setCropModalOpen(false);
            setSelectedImageSrc(null);
          }}
          onCropDone={handleCropDone}
        />
      )}
    </div>
  );
}

/** Loading skeleton */
function ProfileInfoSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#9c7aff]/5 overflow-hidden mb-8">
      <div className="h-32 bg-gradient-to-r from-[#9c7aff]/10 via-[#9c7aff]/5 to-transparent" />
      <div className="px-8 pb-8 -mt-12">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <Skeleton className="w-32 h-32 rounded-3xl" />
          <div className="space-y-3 mb-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
