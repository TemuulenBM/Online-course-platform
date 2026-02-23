import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

/**
 * next-intl серверийн тохиргоо.
 * Cookie-оос locale тодорхойлж, тохирох орчуулгын файлыг ачаална.
 * URL prefix ашиглахгүй (cookie-based approach).
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'mn';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
