import { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { CartProvider } from '@/lib/context/cart-provider';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
