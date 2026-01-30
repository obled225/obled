'use client';

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { Fragment, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/actions/utils';
import Image from 'next/image';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, removeItem, getCartSummary } = useCartStore();
  const cartSummary = getCartSummary();

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const totalItems = cart.itemCount;

  return (
    <div className="relative">
      <Popover className="relative">
        <PopoverButton
          className="relative p-2 hover:bg-gray-100 rounded-md"
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </PopoverButton>

        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-96 z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>

              {cart.items.length > 0 ? (
                <>
                  <div className="max-h-80 overflow-y-auto space-y-4">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          {item.product.images && item.product.images[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No image
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {item.product.name}
                          </h4>
                          {item.selectedVariant && (
                            <p className="text-xs text-gray-600">
                              {item.selectedVariant.name}
                            </p>
                          )}
                          <p className="text-sm">Qty: {item.quantity}</p>
                          <p className="font-medium text-sm">
                            {formatPrice(
                              (item.product.price +
                                (item.selectedVariant?.priceModifier || 0)) *
                                item.quantity
                            )}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-semibold">
                        {formatPrice(cartSummary.subtotal)}
                      </span>
                    </div>

                    <Link href="/cart">
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        View Cart
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">Your cart is empty</p>
                  <Link href="/products">
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  );
};

export default CartDropdown;
