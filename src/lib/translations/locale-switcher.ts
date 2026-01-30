'use client';

import { useLocale } from 'next-intl';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export function useLocaleSwitcher() {
  const currentLocale = useLocale();

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    // Set cookie to persist locale preference
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Reload the page to apply the new locale (server reads cookie on reload)
    window.location.reload();
  };

  return { switchLocale, currentLocale };
}

export const LOCALE_COOKIE_NAME_EXPORTED = LOCALE_COOKIE_NAME;
