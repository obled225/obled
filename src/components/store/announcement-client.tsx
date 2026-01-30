'use client';

import { AnnouncementBar } from './announcement-bar';

interface Announcement {
  text: string;
  link?: string;
}

interface AnnouncementClientProps {
  announcements?: Announcement[];
}

export function AnnouncementClient({ announcements = [] }: AnnouncementClientProps) {
  // Transform announcements to the format expected by AnnouncementBar
  const messages = announcements.map((announcement) => ({
    text: announcement.text,
    href: announcement.link || '',
  }));

  return <AnnouncementBar messages={messages} />;
}