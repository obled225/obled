'use client';

import Link from 'next/link';
import { User, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CartDropdown from './cart-dropdown';
import { SearchBar } from './search-bar';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">KYSFactory</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              About
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search button (mobile) */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="w-5 h-5" />
            </Button>

            {/* User account */}
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <CartDropdown />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
