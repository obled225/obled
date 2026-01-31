'use client';

import { PortableText as PortableTextReact } from '@portabletext/react';
import type { PortableTextBlock } from '@/lib/types/sanity';

interface PortableTextProps {
  content: PortableTextBlock[] | string | undefined;
  className?: string;
}

export function PortableText({ content, className = '' }: PortableTextProps) {
  if (!content) return null;

  // Handle string fallback
  if (typeof content === 'string') {
    return <div className={className}>{content}</div>;
  }

  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div className={className}>
      <PortableTextReact
        value={content}
        components={{
          block: {
            normal: ({ children }) => <p className="mb-4">{children}</p>,
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold mb-4 mt-6">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold mb-3 mt-5">{children}</h3>
            ),
          },
          list: {
            bullet: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2">
                {children}
              </ul>
            ),
            number: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2">
                {children}
              </ol>
            ),
          },
          listItem: {
            bullet: ({ children }) => <li>{children}</li>,
            number: ({ children }) => <li>{children}</li>,
          },
          marks: {
            strong: ({ children }) => (
              <strong className="font-bold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
          },
        }}
      />
    </div>
  );
}
