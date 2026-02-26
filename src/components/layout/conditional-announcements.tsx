'use client';

import { usePathname } from 'next/navigation';
import { AnnouncementClient } from '@/components/store/announcement-client';
import { useMemo } from 'react';
import type { Announcement } from '@/lib/sanity/queries';
import { useTranslations } from 'next-intl';

const FALLBACK_ANNOUNCEMENT_KEY = 'manufacturer';

export function ConditionalAnnouncements({
  initialAnnouncements,
}: {
  initialAnnouncements?: Announcement[] | null;
}) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/checkout';
  const t = useTranslations('announcements.fallback');

  const announcements = useMemo(() => {
    const fallback: Announcement[] = [
      { text: t(FALLBACK_ANNOUNCEMENT_KEY), link: '/about' },
    ];
    if (initialAnnouncements?.length) return initialAnnouncements;
    return fallback;
  }, [initialAnnouncements, t]);

  if (isCheckoutPage) {
    return null;
  }

  return <AnnouncementClient announcements={announcements} />;
}
