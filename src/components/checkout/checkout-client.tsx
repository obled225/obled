'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { CartSummary } from '@/components/cart/cart-summary';
import { CartItem } from '@/components/cart/cart-item';
import { useToast } from '@/lib/hooks/use-toast';
import { getProductPrice } from '@/lib/types';
import {
  getTaxSettings,
  calculateTax,
  type TaxSettings,
} from '@/lib/sanity/queries';

export function CheckoutClient() {
  const router = useRouter();
  const { error: showError } = useToast();
  const { cart, getCartSummary } = useCartStore();
  const { currency } = useCurrencyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);

  // Fetch tax settings
  useEffect(() => {
    async function fetchTaxSettings() {
      const settings = await getTaxSettings();
      setTaxSettings(settings);
    }
    fetchTaxSettings();
  }, []);

  // Calculate tax when subtotal or currency changes (using useMemo instead of useEffect)
  const taxAmount = useMemo(() => {
    if (!taxSettings) return 0;
    
    const subtotal = cart.items.reduce((total, item) => {
      const priceObj = item.product.prices?.find((p) => p.currency === currency) || item.product.prices?.[0];
      const basePrice = priceObj?.basePrice || item.product.price;
      const variantPrice = item.selectedVariant?.priceModifier || 0;
      return total + (basePrice + variantPrice) * item.quantity;
    }, 0);
    
    return calculateTax(subtotal, currency, taxSettings);
  }, [taxSettings, currency, cart.items]);

  const cartSummary = getCartSummary(currency, taxAmount, shippingCost);

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
        showError('Error', 'Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      // Prepare cart items for the edge function
      const cartItems = cart.items.map((item) => {
        // Find price for the selected currency from the currency store
        const priceObj = getProductPrice(item.product, currency);

        // Fallback to first available price if selected currency not found
        const effectivePrice = priceObj || item.product.prices?.[0];
        const basePrice = effectivePrice?.basePrice || item.product.price;
        const baseLomiId = effectivePrice?.lomiPriceId;

        // Determine price ID and quantity
        const variantLomiId = item.selectedVariant?.lomiPriceId;

        // If variant has a lomi ID (e.g. Pack Price), use it. Otherwise use base ID.
        const effectiveLomiId = variantLomiId || baseLomiId;

        // If we are using a Pack Price ID, the quantity sent to lomi should be number of packs
        // item.quantity is now the number of packs (not units), so use it directly
        const quantityToSend = item.quantity;

        return {
          productId: item.product.id,
          productTitle: item.product.name,
          productSlug: item.product.slug,
          variantId: item.selectedVariant?.id,
          variantTitle: item.selectedVariant
            ? `${item.selectedVariant.name} - ${item.selectedVariant.value}`
            : undefined,
          quantity: quantityToSend,
          price: basePrice + (item.selectedVariant?.priceModifier || 0),
          productImageUrl: item.product.image,
          lomiPriceId: effectiveLomiId,
        };
      });

      // Use shipping cost from CartSummary (managed by ShippingCalculator)
      const shippingFee = shippingCost;

      // Call the edge function to create lomi. checkout session
      const { data, error } = await supabase.functions.invoke('checkout', {
        body: {
          cartItems,
          currencyCode: currency, // Use the selected currency from the store
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
        showError(
          'Error',
          error.message ||
          'Failed to create checkout session. Please try again.'
        );
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
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';
      console.error('Checkout error:', error);
      showError('Error', errorMessage);
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Add some items to your cart before checking out.
          </p>
          <Button onClick={() => router.push('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Your information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="userName"
                  label={
                    <span>
                      Full Name <span className="text-red-500">*</span>
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
                      Email <span className="text-red-500">*</span>
                    </span>
                  }
                  type="email"
                  required
                  value={formData.userEmail}
                  onChange={handleInputChange}
                />
                <Input
                  name="userPhone"
                  label={
                    <span>
                      Phone Number <span className="text-red-500">*</span>
                    </span>
                  }
                  type="tel"
                  required
                  value={formData.userPhone}
                  onChange={handleInputChange}
                />
                <Input
                  name="userOrganization"
                  label="Organization / Company"
                  type="text"
                  value={formData.userOrganization}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="shippingCity"
                  label={
                    <span>
                      City <span className="text-red-500">*</span>
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
                      Country <span className="text-red-500">*</span>
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
                      Street Address <span className="text-red-500">*</span>
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
                      Postal Code <span className="text-red-500">*</span>
                    </span>
                  }
                  type="text"
                  required
                  value={formData.shippingPostalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <h2 className="text-lg font-semibold mb-4">Your order</h2>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} showControls={false} />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Proceed to payment'}
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
