'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleSwitcher } from '@/lib/utils/locale-switcher';

export function Footer() {
  const t = useTranslations('footer');
  const { switchLocale, currentLocale } = useLocaleSwitcher();

  const newLocale = currentLocale === 'fr' ? 'en' : 'fr';
  const languageText = currentLocale === 'fr' ? 'English' : 'Français';

  const handleLocaleSwitch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    switchLocale(newLocale);
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex justify-center text-center text-sm text-muted-foreground">
          <span>{t('copyright')}</span>
          <span className="mx-2">·</span>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            {t('terms')}
          </Link>
          <span className="mx-2">·</span>
          <button
            onClick={handleLocaleSwitch}
            className="hover:text-foreground transition-colors underline cursor-pointer"
          >
            {languageText}
          </button>
        </div>
      </div>
    </footer>
  );
}
