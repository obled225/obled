'use client';

import { AnnouncementBar } from './announcement-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

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
  isLoading?: boolean;
  /** Only show skeleton after a delay; fast loads skip it. */
  showSkeleton?: boolean;
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

const ANNOUNCEMENT_BAR_WRAPPER_CLASS =
  'w-full border-b border-gray-200 bg-white mx-auto max-w-[1245px]';
const ANNOUNCEMENT_BAR_INNER_CLASS =
  'flex items-center justify-center py-2 sm:py-3 px-4 text-center';

function AnnouncementBarSkeleton() {
  return (
    <div className={ANNOUNCEMENT_BAR_WRAPPER_CLASS}>
      <div className={ANNOUNCEMENT_BAR_INNER_CLASS} aria-hidden>
        <Skeleton className="h-4 w-48 max-w-full" />
      </div>
    </div>
  );
}

function AnnouncementBarPlaceholder() {
  return (
    <div className={ANNOUNCEMENT_BAR_WRAPPER_CLASS} aria-hidden>
      <div className={ANNOUNCEMENT_BAR_INNER_CLASS} />
    </div>
  );
}

export function AnnouncementClient({
  announcements = [],
  isLoading = false,
  showSkeleton = false,
}: AnnouncementClientProps) {
  const messages = announcements.map((announcement) => ({
    text: renderPortableText(announcement.text),
    href: announcement.link || '',
  }));

  if (isLoading) {
    return showSkeleton ? (
      <AnnouncementBarSkeleton />
    ) : (
      <AnnouncementBarPlaceholder />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <AnnouncementBar messages={messages} />
    </motion.div>
  );
}
