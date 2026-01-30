'use client';

import { ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface TranslationProviderProps {
  children: ReactNode;
}

/**
 * Translation provider component
 * Wraps the app to provide translation context
 * Note: next-intl hooks work globally, but this provider allows for future extensibility
 */
export function TranslationProvider({ children }: TranslationProviderProps) {
  // Provider is a pass-through for now since next-intl hooks work globally
  // This allows for future extension if needed
  return <>{children}</>;
}

/**
 * Hook to access translations and locale
 * @param namespace - Optional namespace for translations (e.g., 'footer', 'common')
 * @returns Object with `t` function for translations and `locale` string
 */
export function useTranslation(namespace?: string) {
  const t = useTranslations(namespace);
  const locale = useLocale();

  return {
    t,
    locale,
  };
}
