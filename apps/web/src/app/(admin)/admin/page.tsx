'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ROUTES } from '@/lib/constants';

/** /admin → /admin/users руу redirect */
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ADMIN_USERS);
  }, [router]);

  return null;
}
