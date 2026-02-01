'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { CurrencySelector } from './currency-selector';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store/cart-store';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

// Define props extended with categories
import { ProductCategory } from '@/lib/types';

interface HeaderProps {
  categories?: ProductCategory[];
}

interface NavLink {
  href: string;
  label: string;
  badgeText?: string;
  badgeColor?: string;
}

// Helper function to lighten a hex color for border effect
function lightenColor(hex: string, percent: number = 20): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Lighten each component
  const newR = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  
  // Convert back to hex
  return `#${[newR, newG, newB].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

// Type guard to check if a nav link has badge properties
function hasBadge(link: NavLink): link is NavLink & { badgeText: string; badgeColor: string } {
  return !!(link.badgeText && link.badgeColor);
}

export function Header({ categories = [] }: HeaderProps) {
  const t = useTranslations('header');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = useCartStore((state) => state.cart.itemCount);

  // Check if we're on mobile
  const isMobile = useIsMobile();

  // Combine static links with dynamic categories
  // We'll add categories under a "Shop" dropdown or just list them if few?
  // User asked: "create a new in the exact current ui a elemmnt in @[src/components/layout/header.tsx] to access directly the relevant category"
  // I will add them to the main nav

  const navLinks: NavLink[] = [
    { href: '/', label: t('nav.home') },
    { href: '/shop', label: t('nav.store') },
    { href: '/business', label: t('nav.business') },
    // Dynamic Categories inserted here
    ...(categories?.map((c) => ({
      href: `/shop?category=${c.id}`,
      label: c.name,
      badgeText: c.badgeText,
      badgeColor: c.badgeColor,
    })) || []),
    { href: '/about', label: t('nav.about') },
    { href: '/faq', label: t('nav.faq') },
  ];

  return (
    <header className="w-full border-b mx-auto max-w-[1245px] border-border bg-background">
      <div className="mx-auto max-w-[1245px]">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/icon.webp"
              alt="KYS Factory"
              width={550}
              height={150}
              className="h-28 sm:h-24 md:h-28 lg:h-32 w-auto"
              priority
            />
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-2">
            {/* Currency Selector - hidden on very small screens, shown in mobile menu */}
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>

            {/* Search - hidden on mobile */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label={t('search.ariaLabel')}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}

            {/* Cart */}
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
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />

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
                        borderColor: lightenColor(link.badgeColor, 15),
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

        {/* Search bar - only on desktop */}
        {isSearchOpen && !isMobile && (
          <div className="border-t border-border py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className="w-full rounded-md border border-input bg-background px-3 sm:px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10"
                onClick={() => setIsSearchOpen(false)}
                aria-label={t('search.closeAriaLabel')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
                        borderColor: lightenColor(link.badgeColor, 15),
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
          {/* Currency selector in mobile menu */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-end py-2">
              <CurrencySelector />
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}
