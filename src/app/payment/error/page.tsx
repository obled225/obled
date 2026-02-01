'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">
          {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {status === 'cancelled'
            ? 'Your payment was cancelled. No charges were made.'
            : 'There was an issue processing your payment. Please try again.'}
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Order ID:{' '}
            <span className="font-mono text-xs">
              {orderId.substring(0, 8)}...
            </span>
          </p>
        )}
        <div className="space-y-4">
          <Link href="/checkout" className="w-full">
            <Button className="w-full">Try Again</Button>
          </Link>
          <Link href="/cart" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Cart
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          If you continue to experience issues, please contact our support team.
        </p>
      </div>
    </div>
  );
}
