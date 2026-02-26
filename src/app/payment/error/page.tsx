'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { XCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');
  const isCancelled = status === 'cancelled';
  const t = useTranslations('payment.error');

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <div className="flex justify-center items-center w-full">
        <div className="bg-background border border-border rounded-md overflow-hidden max-w-md w-full shadow-sm">
          <div className="p-4 sm:p-5 text-center">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div
                className={`rounded-full p-2.5 ${
                  isCancelled
                    ? 'bg-red-50 dark:bg-red-950/20'
                    : 'bg-orange-50 dark:bg-orange-950/20'
                }`}
              >
                {isCancelled ? (
                  <XCircle className="h-9 w-9 sm:h-10 sm:w-10 text-red-500" />
                ) : (
                  <AlertCircle className="h-9 w-9 sm:h-10 sm:w-10 text-orange-500" />
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 sm:mb-3">
              {isCancelled ? t('titleCancelled') : t('titleFailed')}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-5">
              {isCancelled ? t('descriptionCancelled') : t('descriptionFailed')}
            </p>

            {/* Order ID */}
            {orderId && (
              <div className="mb-4 sm:mb-5 p-2.5 sm:p-3 bg-muted rounded-md border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">
                  {t('orderId')}
                </p>
                <p className="font-mono text-xs sm:text-sm text-foreground break-all">
                  {orderId}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
              <Link href="/checkout" className="block w-full">
                <Button className="w-full">{t('tryAgain')}</Button>
              </Link>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Link href="/checkout" className="block w-full">
                  <Button variant="outline" className="w-full">
                    {t('backToCheckout')}
                  </Button>
                </Link>
                <Link href="/" className="block w-full">
                  <Button variant="outline" className="w-full">
                    {t('continueShopping')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Support Message */}
            <p className="text-xs text-muted-foreground">{t('support')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
