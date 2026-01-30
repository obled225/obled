import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Can be imported from a shared config
export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'fr' as const;

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  // Await requestLocale if it exists (might be undefined without middleware)
  const resolvedRequestLocale = requestLocale ? await requestLocale : undefined;

  // Use cookie locale if valid, otherwise use requestLocale, otherwise default
  let locale: (typeof locales)[number] = defaultLocale;

  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale as (typeof locales)[number];
  } else if (
    resolvedRequestLocale &&
    (locales as readonly string[]).includes(resolvedRequestLocale)
  ) {
    locale = resolvedRequestLocale as (typeof locales)[number];
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
