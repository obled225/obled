'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { CartProvider } from '@/lib/context/cart-provider';
import { ConditionalAnnouncements } from './conditional-announcements';
import { FloatingAnnouncementClient } from '@/components/store/floating-announcement-client';
import { ProductCategory } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getFloatingAnnouncement } from '@/lib/sanity/queries';

interface PageLayoutProps {
  children: ReactNode;
  categories?: ProductCategory[];
}

export function PageLayout({ children, categories }: PageLayoutProps) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/checkout';
  const [announcement, setAnnouncement] = useState<{
    text: string | Array<{
      _type: 'block';
      children: Array<{
        _type: 'span';
        text: string;
        marks?: string[];
      }>;
    }>;
    isActive: boolean;
  } | null>(null);

  useEffect(() => {
    async function fetchAnnouncement() {
      const announcementData = await getFloatingAnnouncement();
      
      // Fallback data if Sanity query fails
      const fallbackAnnouncement = {
        text: 'Use code WELCOME20 for 20% off',
        isActive: false,
      };

      // Use Sanity data if available and active, otherwise use fallback
      const finalAnnouncement = announcementData?.isActive
        ? announcementData
        : fallbackAnnouncement;

      // Only set if there's an active announcement
      if (finalAnnouncement?.isActive || finalAnnouncement === fallbackAnnouncement) {
        setAnnouncement(finalAnnouncement);
      }
    }
    fetchAnnouncement();
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header categories={categories} />
        <ConditionalAnnouncements />
        <div className="flex-1">{children}</div>
        <Footer />
        {!isCheckoutPage && announcement && (
          <FloatingAnnouncementClient announcement={announcement} />
        )}
      </div>
    </CartProvider>
  );
}
