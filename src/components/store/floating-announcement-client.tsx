'use client';

import { FloatingAnnouncement } from './floating-announcement';
import { ReactNode } from 'react';

interface PortableTextBlock {
  _type: 'block';
  children: Array<{
    _type: 'span';
    text: string;
    marks?: string[];
  }>;
}

interface FloatingAnnouncementData {
  text: PortableTextBlock[] | string;
  isActive: boolean;
}

interface FloatingAnnouncementClientProps {
  announcement?: FloatingAnnouncementData;
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

export function FloatingAnnouncementClient({
  announcement,
}: FloatingAnnouncementClientProps) {
  // Use provided announcement data or fallback to placeholder
  const message = announcement?.text
    ? renderPortableText(announcement.text)
    : 'Use code WELCOME20 for 20% off';

  return <FloatingAnnouncement message={message as string} />;
}
