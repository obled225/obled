import { getAnnouncementBar } from '@/lib/sanity/queries';
import { AnnouncementClient } from './announcement-client';

const fallbackAnnouncements = [
  {
    text: 'KYS FACTORY fabricant & fournisseur de t-shirts vierges',
    href: '/about',
  },
  {
    text: 'Offres marques et entreprises',
    href: '/business',
  },
];

export async function AnnouncementWrapper() {
  const announcementData = await getAnnouncementBar();

  // Use announcements from Sanity if available, otherwise use fallback
  const announcements = announcementData?.announcements || fallbackAnnouncements;

  return <AnnouncementClient announcements={announcements} />;
}