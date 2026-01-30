'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');
  const [orderNumber] = useState<string | null>(null);

  useEffect(() => {
    // If order_id is provided, you could fetch order details here
    // For now, we'll just show a success message
    if (orderId && status === 'success') {
      // You could fetch order number from Supabase here
      // setOrderNumber(orderData.order_number);
    }
  }, [orderId, status]);

  if (status !== 'success') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Status Unknown</h1>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t determine the payment status. Please contact
            support if you have any questions.
          </p>
          <div className="space-y-4">
            <Button onClick={() => router.push('/')}>Go Home</Button>
            <Button variant="outline" onClick={() => router.push('/cart')}>
              View Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-lg text-gray-600 mb-2">Thank you for your order.</p>
        {orderNumber && (
          <p className="text-sm text-gray-500 mb-8">
            Order Number: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}
        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Order ID:{' '}
            <span className="font-mono text-xs">
              {orderId.substring(0, 8)}...
            </span>
          </p>
        )}
        <p className="text-gray-600 mb-8">
          We&apos;ve sent a confirmation email with your order details. You will
          receive another email once your order has been shipped.
        </p>
        <div className="space-y-4">
          <Link href="/products" className="w-full">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
