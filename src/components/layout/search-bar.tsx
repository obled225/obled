'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Product, getProductPrice } from '@/lib/types';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { formatPrice } from '@/lib/utils/format';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const t = useTranslations('header');
  const { currency } = useCurrencyStore();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products
  // TODO: Fetch products from Sanity CMS for search
  const searchResults = useMemo(() => {
    if (query.length > 2) {
      // TODO: Implement search with Sanity
      return [];
    }
    return [];
  }, [query]);

  // Update results and open state when search results change
  useEffect(() => {
    setResults(searchResults);
    setIsOpen(searchResults.length > 0);
  }, [searchResults]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-2">
              {results.length} {t('search.resultsFound')}
            </div>
            {results.map((product) => {
              // Get price for selected currency
              const currentPrice =
                getProductPrice(product, currency) ||
                getProductPrice(product, 'XOF') ||
                product.prices[0];
              const displayPrice = currentPrice?.basePrice || product.price;
              const displayCurrency =
                currentPrice?.currency || product.currency;

              return (
                <button
                  key={product.id}
                  onClick={() => {
                    router.push(`/products/${product.slug}`);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded shrink-0 overflow-hidden">
                      {product.images && product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          width={500}
                          height={500}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {formatPrice(displayPrice, displayCurrency)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => handleSearch(query)}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              {t('search.viewAllResults')} &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
