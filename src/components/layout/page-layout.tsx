import { ReactNode } from 'react';
import { Header } from './headers';
import { Footer } from './footer';
import { CartProvider } from '@/lib/context/cart-provider';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </CartProvider>
  );
}
