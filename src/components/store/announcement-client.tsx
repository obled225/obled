'use client';

import { AnnouncementBar } from './announcement-bar';
import { ReactNode } from 'react';

interface PortableTextBlock {
  _type: 'block';
  children: Array<{
    _type: 'span';
    text: string;
    marks?: string[];
  }>;
}

interface Announcement {
  text: PortableTextBlock[] | string;
  link?: string;
}

interface AnnouncementClientProps {
  announcements?: Announcement[];
}

// Simple Portable Text renderer for basic text with bold marks
function renderPortableText(blocks: PortableTextBlock[] | string): ReactNode {
  // Handle fallback string format
  if (typeof blocks === 'string') {
    return blocks;
  }

  if (!blocks || !Array.isArray(blocks)) return '';

  return blocks.map((block, blockIndex) => {
    if (block._type !== 'block') return null;

    return (
      <span key={blockIndex}>
        {block.children?.map((child, childIndex) => {
          const { text, marks = [] } = child;

          if (marks.includes('strong')) {
            return (
              <span key={childIndex} className="font-bold">
                {text}
              </span>
            );
          }

          return <span key={childIndex}>{text}</span>;
        })}
      </span>
    );
  });
}

export function AnnouncementClient({
  announcements = [],
}: AnnouncementClientProps) {
  // Transform announcements to the format expected by AnnouncementBar
  const messages = announcements.map((announcement) => ({
    text: renderPortableText(announcement.text),
    href: announcement.link || '',
  }));

  return <AnnouncementBar messages={messages} />;
}
