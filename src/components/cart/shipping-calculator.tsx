'use client';

import { useMemo, useEffect, useState } from 'react';
import { Truck, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { useCurrencyStore } from '@/lib/store/currency-store';
import {
  getActiveShippingOptions,
  getGlobalFreeShippingThreshold,
  type ShippingOption,
} from '@/lib/sanity/queries';
import { useTranslations } from 'next-intl';

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
  const { currency, convertPrice } = useCurrencyStore();
  const t = useTranslations('shipping');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [globalFreeShippingThreshold, setGlobalFreeShippingThreshold] =
    useState<{
      enabled: boolean;
      amount?: number;
    } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch shipping options and global free shipping threshold from Sanity
  useEffect(() => {
    async function fetchShippingData() {
      try {
        const [options, globalThreshold] = await Promise.all([
          getActiveShippingOptions(),
          getGlobalFreeShippingThreshold(),
        ]);
        setShippingOptions(options);
        setGlobalFreeShippingThreshold(globalThreshold);
        // Auto-select first option if none selected
        if (!selectedShipping && options.length > 0 && onShippingChange) {
          const firstOption = options[0];
          const price = convertPrice(firstOption.price, currency);
          onShippingChange(firstOption.id, price);
        }
      } catch (error) {
        console.error('Error fetching shipping data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchShippingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get free shipping threshold for current currency (prioritize global threshold)
  const freeShippingThreshold = useMemo(() => {
    // First check global free shipping threshold
    if (
      globalFreeShippingThreshold?.enabled &&
      globalFreeShippingThreshold?.amount !== undefined
    ) {
      // Convert threshold from XOF to current currency
      return convertPrice(globalFreeShippingThreshold.amount, currency);
    }

    // Fall back to per-option threshold (find the first option with free shipping threshold enabled)
    const optionWithThreshold = shippingOptions.find(
      (opt) =>
        opt.freeShippingThreshold?.enabled &&
        opt.freeShippingThreshold?.amount !== undefined
    );
    if (!optionWithThreshold?.freeShippingThreshold?.amount) {
      return null;
    }
    // Convert threshold from XOF to current currency
    return convertPrice(
      optionWithThreshold.freeShippingThreshold.amount,
      currency
    );
  }, [globalFreeShippingThreshold, shippingOptions, currency, convertPrice]);

  const amountForFreeShipping = freeShippingThreshold
    ? Math.max(0, freeShippingThreshold - subtotal)
    : 0;
  const qualifiesForFreeShipping = freeShippingThreshold
    ? subtotal >= freeShippingThreshold
    : false;

  // Check if global free shipping threshold is met
  const globalThresholdMet = useMemo(() => {
    return (
      globalFreeShippingThreshold?.enabled &&
      globalFreeShippingThreshold?.amount !== undefined &&
      subtotal >= convertPrice(globalFreeShippingThreshold.amount, currency)
    );
  }, [globalFreeShippingThreshold, subtotal, currency, convertPrice]);

  // Get available shipping options with prices for current currency
  const availableOptions = useMemo(() => {
    return shippingOptions.map((option) => {
      // Convert price from XOF to current currency
      const basePrice = convertPrice(option.price, currency);

      // If global threshold is met, all shipping is free (but we'll show special UI)
      if (globalThresholdMet) {
        return {
          ...option,
          price: 0,
        };
      }

      // Otherwise, check if this specific option has free shipping threshold enabled
      const optionThreshold =
        option.freeShippingThreshold?.enabled &&
        option.freeShippingThreshold?.amount
          ? convertPrice(option.freeShippingThreshold.amount, currency)
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
  }, [shippingOptions, currency, subtotal, convertPrice, globalThresholdMet]);

  // Update shipping cost when currency or subtotal changes (if option is selected)
  useEffect(() => {
    // If global threshold is met, always set shipping to 0
    if (globalThresholdMet && onShippingChange) {
      onShippingChange('free-shipping', 0);
      return;
    }

    if (selectedShipping && availableOptions.length > 0 && onShippingChange) {
      const option = availableOptions.find(
        (opt) => opt.id === selectedShipping
      );
      if (option) {
        onShippingChange(selectedShipping, option.price);
      }
    }
  }, [
    currency,
    subtotal,
    selectedShipping,
    availableOptions,
    onShippingChange,
    globalThresholdMet,
  ]);

  const selectedOption = globalThresholdMet
    ? availableOptions[0] || { estimatedDays: '' }
    : availableOptions.find((option) => option.id === selectedShipping) ||
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
        <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
      </div>

      {/* Free Shipping Message - When threshold NOT met */}
      {showFreeShippingThreshold &&
        freeShippingThreshold &&
        !qualifiesForFreeShipping &&
        !globalThresholdMet && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              {t('addAmountToEnableFreeShipping', {
                amount: formatPrice(amountForFreeShipping, currency),
              })}
            </p>
          </div>
        )}

      {/* Shipping Options */}
      {globalThresholdMet ? (
        // When global threshold is met, show only Free Shipping option
        <div className="space-y-3 mb-6">
          <label className="block p-4 border-2 border-green-500 bg-green-50 rounded-md cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="shipping"
                  value="free-shipping"
                  checked={true}
                  readOnly
                  className="mr-3 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="font-medium text-gray-900">
                    {t('freeShippingActive')}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('freeShippingActiveDescription')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-green-600">
                  {t('free')}
                </span>
              </div>
            </div>
          </label>
        </div>
      ) : (
        // When threshold not met, show all shipping options
        <div className="space-y-3 mb-6">
          {availableOptions.map((option) => (
            <label
              key={option.id}
              className={`block p-4 border rounded-md cursor-pointer transition-colors ${
                selectedShipping === option.id
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
                          {option.type === 'express' ? t('fast') : t('fastest')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-semibold ${option.price === 0 ? 'text-green-600' : 'text-gray-900'}`}
                  >
                    {option.price === 0
                      ? t('free')
                      : formatPrice(option.price, currency)}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Selected Shipping Details */}
      <div className="border-t pt-4">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {t('estimatedDelivery')}
            </p>
            <p className="text-sm text-gray-600">
              {selectedOption?.estimatedDays ||
                availableOptions[0]?.estimatedDays ||
                ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
