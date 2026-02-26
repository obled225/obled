'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { supabase } from '@/lib/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { CartSummary } from '@/components/cart/cart-summary';
import { CartItem } from '@/components/cart/cart-item';
import { useToast } from '@/lib/hooks/use-toast';
import CheckoutPhoneNumberInput from './phone-number-input';
import { useTranslations } from 'next-intl';
import { useCartPricing } from '@/lib/hooks/use-cart-pricing';

export function CheckoutClient() {
  const router = useRouter();
  const { error: showError } = useToast();
  const { cart } = useCartStore();
  const { currency, convertPrice } = useCurrencyStore();
  const t = useTranslations('checkout');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);

  // Use centralized cart pricing hook
  const { taxAmount, cartSummary } = useCartPricing({
    shippingCost,
  });

  // Form state
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    userOrganization: '',
    shippingAddress: '',
    shippingCity: '',
    shippingCountry: '',
    shippingPostalCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, userPhone: value || '' }));
  };

  const handleCountryChange = (countryName: string) => {
    // Optionally store country name in formData or localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_country_name', countryName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (
        !formData.userName ||
        !formData.userEmail ||
        !formData.userPhone ||
        !formData.shippingAddress ||
        !formData.shippingCity ||
        !formData.shippingCountry ||
        !formData.shippingPostalCode
      ) {
        showError('Error', t('errors.fillAllFields'));
        setIsSubmitting(false);
        return;
      }

      // Prepare cart items for the edge function
      const cartItems = cart.items.map((item) => {
        // All prices are in XOF, convert to selected currency for display/processing
        const basePriceXOF = item.product.price || 0;
        const variantPriceXOF = item.selectedVariant?.priceModifier || 0;
        const totalPriceXOF = basePriceXOF + variantPriceXOF;
        const convertedPrice = convertPrice(totalPriceXOF, currency);

        return {
          productId: item.product.id,
          productTitle: item.product.name,
          productSlug: item.product.slug,
          variantId: item.selectedVariant?.id,
          // For packs: send pack label only (e.g. "Pack of 5"). For size/color: "Size - M"
          variantTitle: item.selectedVariant
            ? item.selectedVariant.packSize
              ? item.selectedVariant.name
              : `${item.selectedVariant.name} - ${item.selectedVariant.value}`
            : undefined,
          quantity: item.quantity,
          price: convertedPrice, // Price in selected currency
          productImageUrl: item.product.image,
        };
      });

      // Use shipping cost from CartSummary (managed by ShippingCalculator)
      const shippingFee = shippingCost;

      // Call the edge function to create lomi. checkout session
      // Ensure currency code is always XOF, EUR, or USD (never F CFA)
      const currencyCode = currency.toUpperCase() as 'XOF' | 'EUR' | 'USD';

      const { data, error } = await supabase.functions.invoke('checkout', {
        body: {
          cartItems,
          currencyCode: currencyCode, // Always XOF, EUR, or USD - never F CFA
          userName: formData.userName,
          userEmail: formData.userEmail,
          userPhone: formData.userPhone,
          userOrganization: formData.userOrganization || undefined,
          shippingAddress: {
            name: formData.userName,
            address: formData.shippingAddress,
            city: formData.shippingCity,
            country: formData.shippingCountry,
            postalCode: formData.shippingPostalCode,
            phone: formData.userPhone,
          },
          shippingFee,
          taxAmount: taxAmount,
          discountAmount: cartSummary.discount,
          successUrlPath: '/payment/success',
          cancelUrlPath: '/payment/error',
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        let message = error.message || t('errors.checkoutSessionFailed');
        // Parse response body when function returns 4xx (e.g. OUT_OF_STOCK)
        if (error instanceof FunctionsHttpError) {
          try {
            const body = (await error.context.json()) as {
              code?: string;
              error?: string;
            };
            if (body?.code === 'OUT_OF_STOCK') {
              message = t('errors.outOfStock');
            } else if (body?.error) {
              message = body.error;
            }
          } catch {
            // ignore parse failure, use message above
          }
        }
        showError('Error', message);
        setIsSubmitting(false);
        return;
      }

      if (data?.checkout_url) {
        // Redirect to lomi. checkout page
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.unexpectedError');
      console.error('Checkout error:', error);
      showError('Error', errorMessage);
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">{t('emptyCartTitle')}</h1>
          <p className="text-gray-600 mb-8">{t('emptyCartDescription')}</p>
          <Button onClick={() => router.push('/')}>
            {t('continueShopping')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer info & shipping address in one box */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
              {/* Customer Information */}
              <h2 className="text-lg font-semibold mb-4">
                {t('yourInformation')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="userName"
                  label={
                    <span>
                      {t('fullName')} <span className="text-red-500">*</span>
                    </span>
                  }
                  type="text"
                  required
                  value={formData.userName}
                  onChange={handleInputChange}
                />
                <Input
                  name="userEmail"
                  label={
                    <span>
                      {t('email')} <span className="text-red-500">*</span>
                    </span>
                  }
                  type="email"
                  required
                  value={formData.userEmail}
                  onChange={handleInputChange}
                />
                <div className="space-y-2">
                  <Label>
                    <span>
                      {t('phoneNumber')} <span className="text-red-500">*</span>
                    </span>
                  </Label>
                  <CheckoutPhoneNumberInput
                    value={formData.userPhone}
                    onChange={handlePhoneChange}
                    onCountryChange={handleCountryChange}
                  />
                </div>
                <Input
                  name="userOrganization"
                  label={t('organization')}
                  type="text"
                  value={formData.userOrganization}
                  onChange={handleInputChange}
                />
              </div>

              {/* Separator */}
              <hr className="my-6 border-gray-200" />

              {/* Shipping Address */}
              <h2 className="text-lg font-semibold mb-4">
                {t('shippingAddress')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="shippingCity"
                  label={
                    <span>
                      {t('city')} <span className="text-red-500">*</span>
                    </span>
                  }
                  type="text"
                  required
                  value={formData.shippingCity}
                  onChange={handleInputChange}
                />
                <Input
                  name="shippingCountry"
                  label={
                    <span>
                      {t('country')} <span className="text-red-500">*</span>
                    </span>
                  }
                  type="text"
                  required
                  value={formData.shippingCountry}
                  onChange={handleInputChange}
                />
                <Input
                  name="shippingAddress"
                  label={
                    <span>
                      {t('streetAddress')}{' '}
                      <span className="text-red-500">*</span>
                    </span>
                  }
                  type="text"
                  required
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                />
                <Input
                  name="shippingPostalCode"
                  label={
                    <span>
                      {t('postalCode')} <span className="text-red-500">*</span>
                    </span>
                  }
                  type="text"
                  required
                  value={formData.shippingPostalCode}
                  onChange={handleInputChange}
                />
              </div>

              {/* Separator */}
              <hr className="my-6 border-gray-200" />

              {/* Your Order */}
              <h2 className="text-lg font-semibold mb-4">{t('yourOrder')}</h2>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} showControls={false} />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors touch-target"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('processing') : t('proceedToPayment')}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            showCheckoutButton={false}
            showContinueShopping={false}
            showShippingCalculator={true}
            onShippingCostChange={setShippingCost}
          />
        </div>
      </div>
    </div>
  );
}
