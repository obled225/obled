'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function CartPage() {
  const { cart, clearCart } = useCartStore();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven&apos;t added any items to your cart yet.
              </p>
              <Link href="/products">
                <Button size="lg">Start Shopping</Button>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                className="sticky top-4"
                showShippingCalculator={true}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
