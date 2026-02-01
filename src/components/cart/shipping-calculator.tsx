'use client';

import { useMemo, useEffect, useState } from 'react';
import { Truck, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { getActiveShippingOptions, type ShippingOption } from '@/lib/sanity/queries';

interface ShippingCalculatorProps {
  subtotal: number;
  selectedShipping?: string;
  onShippingChange?: (shippingId: string, cost: number) => void;
  showFreeShippingThreshold?: boolean;
}

export function ShippingCalculator({
  subtotal,
  selectedShipping,
  onShippingChange,
  showFreeShippingThreshold = true,
}: ShippingCalculatorProps) {
  const { currency } = useCurrencyStore();
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get price for current currency
  const getPriceForCurrency = (
    option: ShippingOption,
    curr: string
  ): number => {
    const priceObj = option.prices.find((p) => p.currency === curr);
    return priceObj?.price || option.prices[0]?.price || 0;
  };

  // Fetch shipping options from Sanity
  useEffect(() => {
    async function fetchShippingOptions() {
      try {
        const options = await getActiveShippingOptions();
        setShippingOptions(options);
        // Auto-select first option if none selected
        if (!selectedShipping && options.length > 0 && onShippingChange) {
          const firstOption = options[0];
          const price = getPriceForCurrency(firstOption, currency);
          onShippingChange(firstOption.id, price);
        }
      } catch (error) {
        console.error('Error fetching shipping options:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchShippingOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get free shipping threshold for current currency
  const freeShippingThreshold = useMemo(() => {
    // Find the first option with free shipping threshold enabled
    const optionWithThreshold = shippingOptions.find(
      (opt) =>
        opt.freeShippingThreshold?.enabled &&
        opt.freeShippingThreshold?.thresholds?.length
    );
    if (!optionWithThreshold?.freeShippingThreshold?.thresholds) {
      return null;
    }
    const threshold = optionWithThreshold.freeShippingThreshold.thresholds.find(
      (t) => t.currency === currency
    );
    return threshold?.amount || null;
  }, [shippingOptions, currency]);

  const amountForFreeShipping = freeShippingThreshold
    ? Math.max(0, freeShippingThreshold - subtotal)
    : 0;
  const qualifiesForFreeShipping = freeShippingThreshold
    ? subtotal >= freeShippingThreshold
    : false;

  // Get available shipping options with prices for current currency
  const availableOptions = useMemo(() => {
    return shippingOptions.map((option) => {
      const basePrice = getPriceForCurrency(option, currency);
      
      // Check if this specific option has free shipping threshold enabled
      const optionThreshold = option.freeShippingThreshold?.enabled
        ? option.freeShippingThreshold.thresholds?.find(
            (t) => t.currency === currency
          )?.amount
        : null;
      
      // Apply free shipping if this option's threshold is met
      const isFreeShippingEligible =
        optionThreshold !== null && optionThreshold !== undefined
          ? subtotal >= optionThreshold
          : false;

      return {
        ...option,
        price: isFreeShippingEligible ? 0 : basePrice,
      };
    });
  }, [shippingOptions, currency, subtotal]);

  // Update shipping cost when currency or subtotal changes (if option is selected)
  useEffect(() => {
    if (selectedShipping && availableOptions.length > 0 && onShippingChange) {
      const option = availableOptions.find((opt) => opt.id === selectedShipping);
      if (option) {
        onShippingChange(selectedShipping, option.price);
      }
    }
  }, [currency, subtotal, selectedShipping, availableOptions, onShippingChange]);

  const selectedOption =
    availableOptions.find((option) => option.id === selectedShipping) ||
    availableOptions[0];

  const handleShippingChange = (shippingId: string) => {
    const option = availableOptions.find((opt) => opt.id === shippingId);
    if (option && onShippingChange) {
      onShippingChange(shippingId, option.price);
    }
  };

  // Don't show anything if loading or no options available
  if (loading || availableOptions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-6">
      <div className="flex items-center mb-4">
        <Truck className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Shipping options
        </h3>
      </div>

      {/* Free Shipping Progress */}
      {showFreeShippingThreshold &&
        freeShippingThreshold &&
        !qualifiesForFreeShipping && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Add {formatPrice(amountForFreeShipping, currency)} more for FREE
                shipping!
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-md h-2">
              <div
                className="bg-blue-600 h-2 rounded-md transition-all duration-300"
                style={{
                  width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-700 mt-1">
              <span>{formatPrice(subtotal, currency)} spent</span>
              <span>
                {formatPrice(freeShippingThreshold, currency)} for free shipping
              </span>
            </div>
          </div>
        )}

      {/* Shipping Options */}
      <div className="space-y-3 mb-6">
        {availableOptions.map((option) => (
          <label
            key={option.id}
            className={`block p-4 border rounded-md cursor-pointer transition-colors ${selectedShipping === option.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="shipping"
                  value={option.id}
                  checked={selectedShipping === option.id}
                  onChange={() => handleShippingChange(option.id)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-2">
                      {option.name}
                    </span>
                    {(option.type === 'express' ||
                      option.type === 'overnight') && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md">
                        {option.type === 'express' ? 'Fast' : 'Fastest'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {option.price === 0
                    ? 'FREE'
                    : formatPrice(option.price, currency)}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Selected Shipping Details */}
      <div className="border-t pt-4">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Estimated Delivery
            </p>
            <p className="text-sm text-gray-600">
              {selectedOption.estimatedDays}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
