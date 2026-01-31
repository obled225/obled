'use client';

import { useState, useMemo } from 'react';
import { Truck, MapPin, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { useCurrencyStore } from '@/lib/store/currency-store';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  type: 'standard' | 'express' | 'overnight';
}

const shippingOptions: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivered in 5-7 business days',
    price: 0, // Free shipping over $50
    estimatedDays: '5-7 business days',
    type: 'standard',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivered in 2-3 business days',
    price: 12.99,
    estimatedDays: '2-3 business days',
    type: 'express',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Delivered tomorrow',
    price: 24.99,
    estimatedDays: 'Next business day',
    type: 'overnight',
  },
];

interface ShippingCalculatorProps {
  subtotal: number;
  selectedShipping?: string;
  onShippingChange?: (shippingId: string, cost: number) => void;
  showFreeShippingThreshold?: boolean;
}

export function ShippingCalculator({
  subtotal,
  selectedShipping = 'standard',
  onShippingChange,
  showFreeShippingThreshold = true,
}: ShippingCalculatorProps) {
  const { currency } = useCurrencyStore();
  const [zipCode, setZipCode] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate free shipping threshold
  const freeShippingThreshold = 50;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  // Get available shipping options based on subtotal
  const availableOptions = useMemo(() => {
    return shippingOptions.map((option) => ({
      ...option,
      price:
        option.id === 'standard' && qualifiesForFreeShipping ? 0 : option.price,
    }));
  }, [qualifiesForFreeShipping]);

  const selectedOption =
    availableOptions.find((option) => option.id === selectedShipping) ||
    availableOptions[0];

  const handleShippingChange = (shippingId: string) => {
    const option = availableOptions.find((opt) => opt.id === shippingId);
    if (option && onShippingChange) {
      onShippingChange(shippingId, option.price);
    }
  };

  const handleCalculateShipping = async () => {
    if (!zipCode.trim()) return;

    setIsCalculating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsCalculating(false);

    // In a real app, this would call a shipping API
    console.log(`Calculated shipping for ZIP: ${zipCode}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Truck className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Shipping Options
        </h3>
      </div>

      {/* Free Shipping Progress */}
      {showFreeShippingThreshold && !qualifiesForFreeShipping && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Add {formatPrice(amountForFreeShipping, currency)} more for FREE shipping!
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-700 mt-1">
            <span>{formatPrice(subtotal, currency)} spent</span>
            <span>{formatPrice(freeShippingThreshold, currency)} for free shipping</span>
          </div>
        </div>
      )}

      {/* Shipping Options */}
      <div className="space-y-3 mb-6">
        {availableOptions.map((option) => (
          <label
            key={option.id}
            className={`block p-4 border rounded-lg cursor-pointer transition-colors ${selectedShipping === option.id
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
                    {option.type === 'express' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Express
                      </span>
                    )}
                    {option.type === 'overnight' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Overnight
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
                  {option.price === 0 ? 'FREE' : formatPrice(option.price, currency)}
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

      {/* ZIP Code Calculator (Optional) */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Calculate exact shipping
          </span>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) =>
              setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={5}
          />
          <button
            onClick={handleCalculateShipping}
            disabled={!zipCode || zipCode.length !== 5 || isCalculating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Get accurate shipping rates for your location
        </p>
      </div>
    </div>
  );
}
