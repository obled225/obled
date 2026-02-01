'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleSwitcher } from '@/lib/translations/locale-switcher';
import {
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from '@/components/ui/icons';

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
    <footer className="w-full border-t mx-auto max-w-[1245px] border-border bg-background">
      <div className="py-4 sm:py-6 px-4 sm:px-6 md:px-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-foreground/70">
          {/* Copyright and links - left aligned on mobile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2 sm:gap-0 text-left">
            <span className="font-normal">{t('copyright')}</span>
            <span className="hidden sm:inline mx-2">·</span>
            <Link
              href="/terms"
              className="font-normal hover:text-black transition-colors"
            >
              {t('terms')}
            </Link>
            <span className="hidden sm:inline mx-2">·</span>
            <Link
              href="https://github.com/lomiafrica/commerce"
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal hover:text-black transition-colors"
            >
              {t('openSource')}
            </Link>
            <span className="hidden sm:inline mx-2">·</span>
            <button
              onClick={handleLocaleSwitch}
              className="font-normal hover:text-black hover:underline transition-colors cursor-pointer text-left"
            >
              {languageText}
            </button>
          </div>
          {/* Social icons - right aligned on mobile, same vertical position */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 pt-2 sm:pt-0">
            <Link
              href="https://wa.me/22507135164117"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5 sm:w-5 sm:h-5" fill="black" />
            </Link>
            <Link
              href="https://www.instagram.com/kysfactoryciv/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5 sm:w-5 sm:h-5" />
            </Link>
            <Link
              href="https://www.facebook.com/people/KYS-Factory/61572203992802/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-5 h-5 sm:w-5 sm:h-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/kys-factory/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="w-5 h-5 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
