'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Store' },
  { href: '/business', label: 'For businesses (B2B)' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              className="h-32 w-auto"
            />
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden border-t border-border py-3 md:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="border-t border-border py-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-md border border-input bg-background px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Modal */}
      <Modal isOpen={isMobileMenuOpen} close={() => setIsMobileMenuOpen(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-foreground hover:text-foreground/70"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Modal>
    </header>
  );
}
