'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { formatPrice, cn } from '@/lib/actions/utils';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCartPricing } from '@/lib/hooks/use-cart-pricing';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const t = useTranslations('header.cart');
  const { cart, updateQuantity, removeItem } = useCartStore();
  const { currency, convertPrice } = useCurrencyStore();
  const isMobile = useIsMobile();

  // Use centralized cart pricing hook
  const { taxSettings, cartSummary: summary } = useCartPricing({
    shippingCost: 0,
  });

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
                      </h3>
                      {item.selectedVariant && (
                        <p className="text-sm sm:text-xs text-muted-foreground">
                          {`${item.selectedVariant.name}${item.selectedVariant.value ? `: ${item.selectedVariant.value}` : ''}`}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div className="flex flex-col gap-1">
                        {(() => {
                          const basePriceXOF = item.product.price || 0;
                          const variantPriceXOF =
                            item.selectedVariant?.priceModifier || 0;
                          const unitPriceXOF = basePriceXOF + variantPriceXOF;
                          const unitPrice = convertPrice(
                            unitPriceXOF,
                            currency
                          );
                          const originalPriceXOF = item.product.originalPrice;
                          const originalPrice = originalPriceXOF
                            ? convertPrice(originalPriceXOF, currency)
                            : undefined;

                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                {originalPrice && originalPrice > unitPrice && (
                                  <span className="text-sm sm:text-xs text-muted-foreground line-through">
                                    {formatPrice(originalPrice, currency)}
                                  </span>
                                )}
                                <span className="text-base sm:text-sm font-semibold">
                                  {formatPrice(unitPrice, currency)}
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
                  {taxSettings?.taxRates?.[0]?.type === 'percentage' ? (
                    <>
                      {formatPrice(summary.tax, currency)}{' '}
                      <span className="text-muted-foreground text-xs">
                        (
                        {((taxSettings.taxRates[0].rate || 0) * 100).toFixed(1)}
                        %)
                      </span>
                    </>
                  ) : (
                    formatPrice(summary.tax, currency)
                  )}
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
