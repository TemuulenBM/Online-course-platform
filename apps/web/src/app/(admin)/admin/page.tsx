'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ROUTES } from '@/lib/constants';

/** /admin → /admin/dashboard руу redirect */
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ADMIN_DASHBOARD);
  }, [router]);

  return null;
}
