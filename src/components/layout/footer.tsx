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
      <div className="py-6">
        <div className="flex justify-between items-center text-sm text-foreground/70">
          <div className="flex justify-start text-start">
            <span className="font-normal">{t('copyright')}</span>
            <span className="mx-2">·</span>
            <Link
              href="/terms"
              className="font-normal hover:text-black transition-colors"
            >
              {t('terms')}
            </Link>
            <span className="mx-2">·</span>
            <button
              onClick={handleLocaleSwitch}
              className="font-normal hover:text-black hover:underline transition-colors cursor-pointer"
            >
              {languageText}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="https://wa.me/22507135164117"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" fill="black" />
            </Link>
            <Link
              href="https://www.instagram.com/kysfactoryciv/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.facebook.com/people/KYS-Factory/61572203992802/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/kys-factory/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
