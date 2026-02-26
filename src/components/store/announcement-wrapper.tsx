import { getAnnouncements } from '@/lib/sanity/queries';
import { AnnouncementClient } from './announcement-client';
import { getTranslations } from 'next-intl/server';

export async function AnnouncementWrapper() {
  const t = await getTranslations('announcements.fallback');
  const announcementData = await getAnnouncements();

  // Use announcements from Sanity if available, otherwise use translated fallback
  const fallbackAnnouncements = [
    {
      text: t('manufacturer'),
      link: '/about',
    },
  ];

  const announcements =
    announcementData?.announcements || fallbackAnnouncements;

  return <AnnouncementClient announcements={announcements} />;
}
