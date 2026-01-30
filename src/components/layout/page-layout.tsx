import { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { CartProvider } from '@/lib/context/cart-provider';
import { AnnouncementBar } from '@/components/store/announcement-bar';

interface PageLayoutProps {
  children: ReactNode;
}

const announcements = [
  {
    text: 'KYS FACTORY fabricant & fournisseur de t-shirts vierges',
    href: '/about',
  },
  {
    text: 'Offres marques et entreprises',
    href: '/business',
  },
];

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <AnnouncementBar messages={announcements} />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </CartProvider>
  );
}
