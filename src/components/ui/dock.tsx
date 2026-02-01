'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { useCartStore } from '@/lib/store/cart-store';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

interface DockProps {
  isHeaderVisible: boolean;
}

export function Dock({ isHeaderVisible }: DockProps) {
  const t = useTranslations('header');
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const cartItemCount = useCartStore((state) => state.cart.itemCount);
  const isCheckoutPage = pathname === '/checkout';
  const isMobile = useIsMobile();
  const dockRef = useRef<HTMLDivElement>(null);

  // Handle mount state for smooth initial animation
  useEffect(() => {
    if (!isHeaderVisible) {
      // Small delay to ensure smooth transition when header disappears
      const timer = setTimeout(() => setIsMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      // Immediately hide when header becomes visible
      setTimeout(() => setIsMounted(false), 0);
    }
  }, [isHeaderVisible]);

  // Don't show dock on checkout page or when cart is empty
  if (isCheckoutPage || cartItemCount === 0) {
    return null;
  }

  // Show dock when header is not visible (but keep in DOM for smooth transitions)
  const shouldShow = !isHeaderVisible && isMounted;

  return (
    <>
      <div
        ref={dockRef}
        className={`fixed z-50 flex items-center gap-2 bg-background border border-border rounded-md shadow-lg transition-all duration-300 ease-in-out ${
          isMobile ? 'top-4 px-1 py-1 gap-1' : 'top-[50px] px-2 py-2 gap-2'
        } ${
          shouldShow
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        }`}
        style={{
          right: isMobile
            ? 'max(1rem, calc((100% - 1245px) / 2 + 1rem))'
            : 'max(calc(0.5rem - 15px), calc((100% - 1245px) / 2 + 0.5rem - 17px))',
        }}
      >
        {/* Cart - always visible */}
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${isMobile ? 'h-9 w-9' : 'h-11 w-11 sm:h-10 sm:w-10'}`}
          aria-label={t('cart.ariaLabel')}
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart
            className={isMobile ? 'h-4 w-4' : 'h-5 w-5 sm:h-5 sm:w-5'}
          />
          {cartItemCount > 0 && (
            <Badge
              className={`absolute -top-1 -right-1 ${
                isMobile
                  ? 'h-4 w-4 text-[9px] font-semibold'
                  : 'h-4 w-4 text-[10px]'
              } p-0 flex items-center justify-center bg-[#22c55e] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)] border-0`}
            >
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
