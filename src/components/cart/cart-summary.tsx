import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/actions/utils';
import { ShippingCalculator } from './shipping-calculator';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  showContinueShopping?: boolean;
  showShippingCalculator?: boolean;
  className?: string;
}

export function CartSummary({
  showCheckoutButton = true,
  showContinueShopping = true,
  showShippingCalculator = false,
  className = '',
}: CartSummaryProps) {
  const { cart } = useCartStore();
  const cartSummary = useCartStore().getCartSummary();
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [shippingCost, setShippingCost] = useState(0);

  const handleShippingChange = (shippingId: string, cost: number) => {
    setSelectedShipping(shippingId);
    setShippingCost(cost);
  };

  const finalTotal =
    cartSummary.subtotal +
    cartSummary.tax +
    shippingCost -
    cartSummary.discount;

  return (
    <div className={`space-y-6 ${className}`}>
      {showShippingCalculator && (
        <ShippingCalculator
          subtotal={cartSummary.subtotal}
          selectedShipping={selectedShipping}
          onShippingChange={handleShippingChange}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Subtotal ({cart.itemCount} items)
            </span>
            <span className="font-medium">
              {formatPrice(cartSummary.subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shippingCost === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">{formatPrice(cartSummary.tax)}</span>
          </div>

          {cartSummary.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(cartSummary.discount)}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>

        {cartSummary.subtotal < 50 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              Add {formatPrice(50 - cartSummary.subtotal)} more for free
              shipping!
            </p>
          </div>
        )}

        {showCheckoutButton && (
          <Link href="/checkout" className="block mb-3">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        )}

        {showContinueShopping && (
          <Link href="/products">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
