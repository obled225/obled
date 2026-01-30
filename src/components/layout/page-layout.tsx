import { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { CartProvider } from '@/lib/context/cart-provider';
import { AnnouncementWrapper } from '@/components/store/announcement-wrapper';
import { FloatingAnnouncementWrapper } from '@/components/store/floating-announcement-wrapper';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <AnnouncementWrapper />
        <div className="flex-1">{children}</div>
        <Footer />
        <FloatingAnnouncementWrapper />
      </div>
    </CartProvider>
  );
}
