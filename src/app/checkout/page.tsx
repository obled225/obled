import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { CheckoutClient } from '@/components/checkout/checkout-client';
import { siteUrl } from '@/lib/utils/config';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'Checkout' : 'Checkout',
    description: isFrench
      ? 'Finalisez votre commande en toute sécurité. Entrez vos informations de livraison et procédez au paiement.'
      : 'Complete your order securely. Enter your shipping information and proceed to payment.',
    openGraph: {
      url: `${siteUrl}/checkout`,
    },
    alternates: {
      canonical: `${siteUrl}/checkout`,
    },
  };
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}
