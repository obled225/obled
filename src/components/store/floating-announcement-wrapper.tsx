import { getFloatingAnnouncement } from '@/lib/sanity/queries';
import { FloatingAnnouncementClient } from './floating-announcement-client';

export async function FloatingAnnouncementWrapper() {
  // Get floating announcement data from Sanity
  // getFloatingAnnouncement() already filters by isActive, so if it returns data, it's active
  const announcementData = await getFloatingAnnouncement();

  // Only render if there's an active announcement
  if (!announcementData) {
    return null;
  }

  return <FloatingAnnouncementClient announcement={announcementData} />;
}
