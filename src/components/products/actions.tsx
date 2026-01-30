'use client';

import { useState, useMemo } from 'react';
import { Product, ProductVariant } from '@/lib/types';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/actions/utils';
import { Loader2 } from 'lucide-react';

type ProductActionsProps = {
  product: Product;
};

const ProductActions = ({ product }: ProductActionsProps) => {
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Calculate the final price including variant modifier
  const finalPrice = useMemo(() => {
    return product.price + (selectedVariant?.priceModifier || 0);
  }, [product.price, selectedVariant]);

  // Check if the product is available for purchase
  const isAvailable = useMemo(() => {
    if (!product.inStock) return false;
    if (selectedVariant && selectedVariant.stockQuantity < quantity)
      return false;
    if (!selectedVariant && product.stockQuantity < quantity) return false;
    return true;
  }, [product.inStock, product.stockQuantity, selectedVariant, quantity]);

  const handleAddToCart = async () => {
    if (!isAvailable || isAdding) return;

    setIsAdding(true);

    try {
      addItem(product, quantity, selectedVariant || undefined);
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
    const maxQuantity =
      selectedVariant?.stockQuantity || product.stockQuantity || 99;
    if (newQuantity > maxQuantity) return;
    setQuantity(newQuantity);
  };

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      {product.variants && product.variants.length > 1 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Options</h3>
          <div className="space-y-3">
            {product.variants.map((variant) => (
              <label
                key={variant.id}
                className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedVariant?.id === variant.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="variant"
                      value={variant.id}
                      checked={selectedVariant?.id === variant.id}
                      onChange={() => setSelectedVariant(variant)}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        {variant.name}: {variant.value}
                      </span>
                      {variant.priceModifier !== 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                          {variant.priceModifier > 0 ? '+' : ''}$
                          {variant.priceModifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {variant.stockQuantity} available
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
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
            disabled={
              quantity >=
              (selectedVariant?.stockQuantity || product.stockQuantity || 99)
            }
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-center justify-between py-4 border-t border-b">
        <span className="text-lg font-semibold text-gray-900">
          Total: {formatPrice(finalPrice * quantity)}
        </span>
        {quantity > 1 && (
          <span className="text-sm text-gray-600">
            ({formatPrice(finalPrice)} each)
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
            Adding to Cart...
          </>
        ) : !isAvailable ? (
          'Out of Stock'
        ) : (
          'Add to Cart'
        )}
      </Button>

      {/* Stock Status */}
      <div className="text-sm text-gray-600">
        {selectedVariant ? (
          <>
            {selectedVariant.stockQuantity} {selectedVariant.name.toLowerCase()}{' '}
            available
          </>
        ) : (
          <>{product.stockQuantity} available</>
        )}
      </div>
    </div>
  );
};

export default ProductActions;
