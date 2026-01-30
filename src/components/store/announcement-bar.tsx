import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface AnnouncementBarProps {
  messages: { text: string; href: string }[];
}

export function AnnouncementBar({ messages }: AnnouncementBarProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      {messages.map((message, index) => (
        <Link
          key={index}
          href={message.href}
          className="flex items-center justify-center gap-2 py-3 text-center text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-200 last:border-b-0"
        >
          {message.text}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ))}
    </div>
  );
}
