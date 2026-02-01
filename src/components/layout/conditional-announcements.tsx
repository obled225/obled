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

  useEffect(() => {
    async function fetchAnnouncements() {
      const announcementData = await getAnnouncements();
      
      // Use announcements from Sanity if available, otherwise use translated fallback
      const fallbackAnnouncements: Announcement[] = [
        {
          text: t('manufacturer'),
          link: '/about',
        },
        {
          text: t('businessOffers'),
          link: '/business',
        },
      ];

      const finalAnnouncements =
        announcementData?.announcements || fallbackAnnouncements;
      setAnnouncements(finalAnnouncements);
    }
    fetchAnnouncements();
  }, [t]);

  if (isCheckoutPage) {
    return null;
  }

  return <AnnouncementClient announcements={announcements} />;
}
