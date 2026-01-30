import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / Cart',
};

export default function PanierPage() {
  return (
    <main className="grow">
      <section className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">
            Your cart is empty
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover our products and add them to your cart.
          </p>
          <Link href="/shop">
            <Button className="mt-8 h-12 px-8 bg-foreground text-background hover:bg-foreground/90">
              Continue shopping
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
