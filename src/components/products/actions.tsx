'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/format';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ProductActionsProps = {
  product: Product;
};

const ProductActions = ({ product }: ProductActionsProps) => {
  const { addItem } = useCartStore();
  const { currency, convertPrice } = useCurrencyStore();
  const t = useTranslations('products.productDetail');
  const tProducts = useTranslations('products');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // All prices are in XOF, convert to selected currency
  const priceXOF = product.price || 0;
  const finalPrice = useMemo(() => {
    return convertPrice(priceXOF, currency);
  }, [priceXOF, currency, convertPrice]);

  // Check if the product is available for purchase
  const isAvailable = useMemo(() => {
    if (!product.inStock) return false;
    return true;
  }, [product.inStock]);

  const handleAddToCart = async () => {
    if (!isAvailable || isAdding) return;

    setIsAdding(true);

    try {
      addItem(product, quantity);
      // You could add a toast notification here
      console.log('Product added to cart!');
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  return (
    <div className="space-y-6">
      {/* Quantity Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          {t('quantity')}
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => updateQuantity(quantity + 1)}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-center justify-between py-4 border-t border-b">
        <span className="text-lg font-semibold text-gray-900">
          {t('total')}: {formatPrice(finalPrice * quantity, currency)}
        </span>
        {quantity > 1 && (
          <span className="text-sm text-gray-600">
            ({formatPrice(finalPrice, currency)} {t('each')})
          </span>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={!isAvailable || isAdding}
        className="w-full"
        size="lg"
      >
        {isAdding ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('addingToCart')}
          </>
        ) : !isAvailable ? (
          tProducts('outOfStock')
        ) : (
          t('addToCart')
        )}
      </Button>
    </div>
  );
};

export default ProductActions;
