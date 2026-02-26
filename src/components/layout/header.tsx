'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { CurrencySelector } from './currency-selector';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store/cart-store';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { getBorderColor } from '@/lib/utils/color';

// Define props extended with categories
import { ProductCategory } from '@/lib/types';

interface HeaderProps {
  categories?: ProductCategory[];
  showAboutInNav?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
}

interface NavLink {
  href: string;
  label: string;
  badgeText?: string;
  badgeColor?: string;
}

// Type guard to check if a nav link has badge properties
function hasBadge(
  link: NavLink
): link is NavLink & { badgeText: string; badgeColor: string } {
  return !!(link.badgeText && link.badgeColor);
}

export function Header({
  categories = [],
  showAboutInNav = true,
  onVisibilityChange,
}: HeaderProps) {
  const t = useTranslations('header');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = useCartStore((state) => state.cart.itemCount);
  const headerRef = useRef<HTMLElement>(null);

  // Check if we're on checkout page
  const isCheckoutPage = pathname === '/checkout';

  // Check if we're on mobile
  const isMobile = useIsMobile();

  // Track header visibility using IntersectionObserver
  useEffect(() => {
    if (!headerRef.current || !onVisibilityChange) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        onVisibilityChange(entry.isIntersecting);
      },
      {
        rootMargin: '-10px 0px 0px 0px', // Trigger slightly before header leaves viewport
        threshold: 0,
      }
    );

    observer.observe(headerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [onVisibilityChange]);

  // Combine static links with dynamic categories
  // We'll add categories under a "Shop" dropdown or just list them if few?
  // User asked: "create a new in the exact current ui a elemmnt in @[src/components/layout/header.tsx] to access directly the relevant category"
  // I will add them to the main nav

  const navLinks: NavLink[] = [
    { href: '/', label: t('nav.home') },
    ...(categories?.map((c) => ({
      href: `/c/${c.id}`,
      label: c.name,
      badgeText: c.badgeText,
      badgeColor: c.badgeColor,
    })) || []),
    ...(showAboutInNav ? [{ href: '/about', label: t('nav.about') }] : []),
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/faq', label: t('nav.faq') },
  ];

  return (
    <header
      ref={headerRef}
      className="w-full border-b mx-auto max-w-[1245px] border-border bg-background"
    >
      <div className="mx-auto max-w-[1245px]">
        <div className="flex items-center justify-between py-4">
          {/* Left spacer for balance */}
          <div className="flex-1 min-w-0" />

          {/* Logo - centered */}
          <Link href="/" className="shrink-0 flex justify-center">
            <Image
              src="/icon.webp"
              alt="O'bled"
              width={550}
              height={150}
              className="h-28 sm:h-24 md:h-28 lg:h-32 w-auto invert"
              priority
            />
          </Link>

          {/* Right side actions */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-2 min-w-0">
            {/* Currency Selector - hidden on very small screens, shown in mobile menu */}
            {!isCheckoutPage && (
              <div className="hidden sm:block">
                <CurrencySelector />
              </div>
            )}

            {/* Cart - hidden on checkout page */}
            {!isCheckoutPage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-11 w-11 sm:h-10 sm:w-10"
                  aria-label={t('cart.ariaLabel')}
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5 sm:h-5 sm:w-5" />
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

                <CartDrawer
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                />
              </>
            )}

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:h-10 sm:w-10 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t('menu.ariaLabel')}
            >
              <Menu className="h-5 w-5 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden border-t border-border py-3 md:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                {hasBadge(link) ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm font-medium text-foreground/70 hover:text-black hover:underline transition-colors"
                    >
                      {link.label}
                    </Link>
                    <Badge
                      variant="destructive"
                      className="text-white text-[10px] px-1.5 py-0.5 h-auto font-bold shadow-sm border"
                      style={{
                        backgroundColor: link.badgeColor,
                        borderColor: getBorderColor(link.badgeColor),
                      }}
                    >
                      {link.badgeText}
                    </Badge>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm font-medium text-foreground/70 hover:text-black hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Menu Modal - Bottom Sheet */}
      <Modal
        isOpen={isMobileMenuOpen}
        close={() => setIsMobileMenuOpen(false)}
        position="bottom"
      >
        <div className="p-6 pb-8">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <div key={link.href}>
                {hasBadge(link) ? (
                  <div className="flex items-center justify-between py-3 px-2 rounded-md hover:bg-gray-50">
                    <Link
                      href={link.href}
                      className="text-base font-medium text-foreground/70 hover:text-black hover:underline transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                    <Badge
                      variant="destructive"
                      className="text-white text-[10px] px-1.5 py-0.5 h-auto font-bold shadow-sm border"
                      style={{
                        backgroundColor: link.badgeColor,
                        borderColor: getBorderColor(link.badgeColor),
                      }}
                    >
                      {link.badgeText}
                    </Badge>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="text-base font-medium text-foreground/70 hover:text-black hover:underline transition-colors py-3 px-2 rounded-md hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          {/* Currency selector in mobile menu - hidden on checkout */}
          {!isCheckoutPage && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-end py-2">
                <CurrencySelector />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </header>
  );
}
