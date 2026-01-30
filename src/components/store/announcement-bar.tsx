import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

interface AnnouncementBarProps {
  messages: { text: string | ReactNode; href: string }[];
}

export function AnnouncementBar({ messages }: AnnouncementBarProps) {
  return (
    <div className="w-full border-b border-gray-200 bg-white mx-auto max-w-[1245px]">
      {messages.map((message, index) => (
        <Link
          key={index}
          href={message.href}
          className="group flex items-center justify-center gap-2 py-2 sm:py-3 px-4 text-center text-xs sm:text-sm font-medium text-foreground/70 hover:text-black transition-colors border-b border-gray-200 last:border-b-0"
        >
          <span className="truncate">{message.text}</span>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>
      ))}
    </div>
  );
}
