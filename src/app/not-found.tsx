'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="grow flex items-center justify-center min-h-[60vh]">
      <div className="flex justify-center w-full px-4">
        <div className="bg-background border border-border rounded-lg overflow-hidden max-w-md w-full">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-medium text-foreground mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-foreground/80 mb-4">
              {t('description')}
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2 mt-4">
                <Home className="h-4 w-4" />
                {t('goHome')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
