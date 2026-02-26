'use client';

import { usePathname } from 'next/navigation';
import { AnnouncementClient } from '@/components/store/announcement-client';
import { useEffect, useState } from 'react';
import { getAnnouncements, type Announcement } from '@/lib/sanity/queries';
import { useTranslations } from 'next-intl';

export function ConditionalAnnouncements() {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/checkout';
  const t = useTranslations('announcements.fallback');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    const skeletonDelay = 200;
    const timer = window.setTimeout(() => setShowSkeleton(true), skeletonDelay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchAnnouncements() {
      const announcementData = await getAnnouncements();

      const fallbackAnnouncements: Announcement[] = [
        { text: t('manufacturer'), link: '/about' },
      ];
      const finalAnnouncements =
        announcementData?.announcements || fallbackAnnouncements;
      setAnnouncements(finalAnnouncements);
      setIsLoading(false);
    }
    fetchAnnouncements();
  }, [t]);

  if (isCheckoutPage) {
    return null;
  }

  return (
    <AnnouncementClient
      announcements={announcements}
      isLoading={isLoading}
      showSkeleton={showSkeleton}
    />
  );
}
