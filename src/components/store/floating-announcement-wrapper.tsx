import { getFloatingAnnouncement } from '@/lib/sanity/queries';
import { FloatingAnnouncementClient } from './floating-announcement-client';

// Fallback data if Sanity query fails
const fallbackAnnouncement = {
  text: "Use code WELCOME20 for 20% off",
  isActive: false,
};

export async function FloatingAnnouncementWrapper() {
  // Get floating announcement data from Sanity
  const announcementData = await getFloatingAnnouncement();

  // Use Sanity data if available and active, otherwise use fallback
  const announcement = announcementData?.isActive ? announcementData : fallbackAnnouncement;

  // Only render if there's an active announcement
  if (!announcement?.isActive && announcement === fallbackAnnouncement) {
    return null;
  }

  return <FloatingAnnouncementClient announcement={announcement} />;
}