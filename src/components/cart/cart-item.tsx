import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/actions/utils';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/types';

interface CartItemProps {
  item: CartItemType;
  showControls?: boolean;
}

export function CartItem({ item, showControls = true }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const itemTotal =
    (item.product.price + (item.selectedVariant?.priceModifier || 0)) *
    item.quantity;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-md overflow-hidden">
          {item.product.images && item.product.images[0] ? (
            <Image
              src={item.product.images[0]}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.product.id}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
          >
            {item.product.name}
          </Link>

          {item.selectedVariant && (
            <p className="text-xs text-gray-500 mt-1">
              {item.selectedVariant.name}: {item.selectedVariant.value}
            </p>
          )}

          <p className="text-sm text-gray-600 mt-1">
            {formatPrice(
              item.product.price + (item.selectedVariant?.priceModifier || 0)
            )}{' '}
            each
          </p>
        </div>

        {showControls && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-3 py-2 text-sm font-medium min-w-12 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-2 hover:bg-gray-50"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(itemTotal)}
          </p>
          {showControls && (
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:text-red-700 p-1 mt-1"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
