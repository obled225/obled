'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cart, clearCart } = useCartStore();

  if (cart.items.length === 0) {
    return (
      <main className="grow bg-gray-50 min-h-[calc(100vh-4rem)]">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Looks like you haven&apos;t added anything to your cart yet.
              Discover our products and find something you love.
            </p>
            <Link href="/shop">
              <Button size="lg" className="h-12 px-8">
                Start Shopping
              </Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="grow bg-gray-50 min-h-[calc(100vh-4rem)]">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Shopping Cart ({cart.itemCount} items)
          </h1>
          <Button
            variant="ghost"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            <div className="flex justify-between items-center pt-4">
              <Link href="/shop">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
                  ← Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <CartSummary
                showCheckoutButton={true}
                showContinueShopping={false}
                className="bg-white shadow-sm rounded-lg"
              />

              <div className="mt-6 text-center text-xs text-gray-500">
                <p>Secure Checkout powered by lomi.</p>
                <div className="flex justify-center gap-2 mt-2 opacity-60">
                  {/* Payment icons could go here */}
                  <span>🔒 Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
