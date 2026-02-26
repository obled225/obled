'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { CartProvider } from '@/lib/context/cart-provider';
import { ConditionalAnnouncements } from './conditional-announcements';
import { FloatingAnnouncementClient } from '@/components/store/floating-announcement-client';
import { Dock } from '@/components/ui/dock';
import { ProductCategory } from '@/lib/types';
import { useState } from 'react';
import type { Announcement, FloatingAnnouncementData } from '@/lib/sanity/queries';

interface PageLayoutProps {
  children: ReactNode;
  categories?: ProductCategory[];
  showAboutInNav?: boolean;
  announcements?: Announcement[] | null;
  floatingAnnouncement?: FloatingAnnouncementData | null;
}

export function PageLayout({
  children,
  categories,
  showAboutInNav = true,
  announcements,
  floatingAnnouncement,
}: PageLayoutProps) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/checkout';
  const isAdminPage = pathname?.startsWith('/admin');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        {!isAdminPage && (
          <Header
            categories={categories}
            showAboutInNav={showAboutInNav}
            onVisibilityChange={setIsHeaderVisible}
          />
        )}
        {!isAdminPage && (
          <ConditionalAnnouncements initialAnnouncements={announcements} />
        )}
        <div className="flex-1">{children}</div>
        {!isAdminPage && <Footer />}
        {!isCheckoutPage && !isAdminPage && floatingAnnouncement && (
          <FloatingAnnouncementClient announcement={floatingAnnouncement} />
        )}
        {!isAdminPage && <Dock isHeaderVisible={isHeaderVisible} />}
      </div>
    </CartProvider>
  );
}
