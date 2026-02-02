'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { formatPrice, cn } from '@/lib/actions/utils';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import {
  getTaxSettings,
  calculateTax,
  type TaxSettings,
} from '@/lib/sanity/queries';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const t = useTranslations('header.cart');
  const { cart, updateQuantity, removeItem, getCartSummary } = useCartStore();
  const { currency, convertPrice } = useCurrencyStore();
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);

  // Fetch tax settings
  useEffect(() => {
    async function fetchTaxSettings() {
      const settings = await getTaxSettings();
      setTaxSettings(settings);
    }
    fetchTaxSettings();
  }, []);

  // Calculate tax when subtotal or currency changes (using useMemo instead of useEffect)
  // Tax should be calculated on the discounted subtotal, not the full subtotal
  const taxAmount = useMemo(() => {
    if (!taxSettings) return 0;

    // First, calculate the subtotal and discount
    const tempSummary = getCartSummary(currency, 0, 0);
    const discountedSubtotal = tempSummary.subtotal - tempSummary.discount;

    // Calculate tax on the discounted subtotal
    return calculateTax(discountedSubtotal, currency, taxSettings);
  }, [taxSettings, currency, getCartSummary]);

  const summary = getCartSummary(currency, taxAmount, 0);
  const isMobile = useIsMobile();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        floating={!isMobile}
        hideCloseButton={isMobile}
        className="flex flex-col w-full sm:max-w-md max-h-[70vh] sm:max-h-[calc(100vh-2rem)] overflow-hidden p-4"
      >
        <SheetHeader className="pb-1 space-y-0 hidden sm:block">
          <SheetTitle className="mb-0 text-base">
            {t('title')}
            {cart.itemCount > 1 ? ` (${cart.itemCount})` : ''}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t('summary')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pt-0 pb-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full space-y-4 text-center">
              <div className="p-4 bg-muted/30 rounded-md">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t('empty')}</p>
              <Button variant="outline" onClick={onClose}>
                {t('continueShopping')}
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {cart.items.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex gap-3 sm:gap-4 py-3 sm:py-2',
                    index < cart.items.length - 1 && 'border-b border-gray-200'
                  )}
                >
                  <div className="relative h-24 w-24 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                        <ShoppingCart className="h-6 w-6 sm:h-6 sm:w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2 sm:gap-0">
                    <div className="grid gap-1">
                      <h3 className="font-medium line-clamp-2 text-base sm:text-sm">
                        {item.product.name}
                        {item.selectedVariant?.packSize && (
                          <span className="text-muted-foreground font-normal">
                            {' · '}
                            {item.selectedVariant.name}
                          </span>
                        )}
                      </h3>
                      {item.selectedVariant &&
                        !item.selectedVariant.packSize && (
                          <p className="text-sm sm:text-xs text-muted-foreground">
                            {`${item.selectedVariant.name}${item.selectedVariant.value ? `: ${item.selectedVariant.value}` : ''}`}
                          </p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div className="flex flex-col gap-1">
                        {/* Get pack original price if it's a pack variant */}
                        {(() => {
                          // All prices are in XOF, convert to selected currency
                          const basePriceXOF = item.product.price || 0;
                          const variantPriceXOF =
                            item.selectedVariant?.priceModifier || 0;
                          const packPriceXOF = basePriceXOF + variantPriceXOF;
                          const packPrice = convertPrice(
                            packPriceXOF,
                            currency
                          );

                          // Find original price for pack if it exists
                          let originalPriceXOF: number | undefined;
                          if (
                            item.selectedVariant?.packSize &&
                            item.product.businessPacks
                          ) {
                            const pack = item.product.businessPacks.find(
                              (p) =>
                                p.quantity === item.selectedVariant?.packSize
                            ) as
                              | {
                                quantity: number;
                                label?: string;
                                price?: number;
                                originalPrice?: number;
                              }
                              | undefined;
                            originalPriceXOF = pack?.originalPrice;
                          } else {
                            originalPriceXOF = item.product.originalPrice;
                          }
                          const originalPrice = originalPriceXOF
                            ? convertPrice(originalPriceXOF, currency)
                            : undefined;

                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                {originalPrice && originalPrice > packPrice && (
                                  <span className="text-sm sm:text-xs text-muted-foreground line-through">
                                    {formatPrice(originalPrice, currency)}
                                  </span>
                                )}
                                <span className="text-base sm:text-sm font-semibold">
                                  {formatPrice(packPrice, currency)}
                                  {item.selectedVariant?.packSize && (
                                    <span className="text-xs text-muted-foreground ml-1 font-normal">
                                      {t('pack')}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-1 ml-auto sm:ml-0">
                        <button
                          type="button"
                          className="h-7 w-7 sm:h-6 sm:w-6 flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors touch-target"
                          onClick={() => {
                            if (item.quantity === 1) {
                              removeItem(item.id);
                            } else {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-red-500" />
                          ) : (
                            <Minus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                          )}
                        </button>
                        <span className="w-7 sm:w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="h-7 w-7 sm:h-6 sm:w-6 flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors touch-target"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('subtotal')}</span>
              {summary.originalSubtotal &&
                summary.originalSubtotal > summary.subtotal ? (
                <span className="text-sm text-gray-500">
                  {formatPrice(summary.originalSubtotal, currency)}
                </span>
              ) : (
                <span className="text-sm font-medium">
                  {formatPrice(summary.subtotal, currency)}
                </span>
              )}
            </div>
            {summary.discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('discount')}</span>
                <span className="text-green-600">
                  {formatPrice(summary.discount, currency)}
                </span>
              </div>
            )}
            {summary.tax > 0 ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {taxSettings?.taxRates?.[0]?.name || t('tax')}
                </span>
                <span className="font-medium">
                  {formatPrice(summary.tax, currency)}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('taxesIncluded')}</span>
                <span className="text-gray-500 text-xs">0</span>
              </div>
            )}
            <div className="flex items-center justify-between font-semibold pt-2 border-t">
              <span>{t('total')}</span>
              <span>{formatPrice(summary.total, currency)}</span>
            </div>
            <Button
              variant="outline"
              className="w-full h-11 sm:h-12 text-sm font-medium border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors touch-target"
              onClick={handleCheckout}
            >
              {t('checkout')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
