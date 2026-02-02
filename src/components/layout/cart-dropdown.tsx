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
import { useCurrencyStore } from '@/lib/store/currency-store';
import { formatPrice } from '@/lib/utils/format';
import Image from 'next/image';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, removeItem, getCartSummary } = useCartStore();
  const { currency, convertPrice } = useCurrencyStore();
  const cartSummary = getCartSummary(currency);

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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-md w-5 h-5 flex items-center justify-center">
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
            className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-[calc(100vw-2rem)] sm:w-96 max-w-sm z-50"
          >
            <div className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Shopping Cart
              </h3>

              {cart.items.length > 0 ? (
                <>
                  <div className="max-h-64 sm:max-h-80 overflow-y-auto space-y-3 sm:space-y-4">
                    {cart.items.map((item) => {
                      // All prices are in XOF, convert to selected currency
                      const priceXOF = item.product.price || 0;
                      const basePrice = convertPrice(priceXOF, currency);

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 sm:gap-4"
                        >
                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
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
                                <span className="text-gray-400 text-xs">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs sm:text-sm line-clamp-1">
                              {item.product.name}
                            </h4>
                            {item.selectedVariant && (
                              <p className="text-xs text-gray-600 line-clamp-1">
                                {item.selectedVariant.name}
                              </p>
                            )}
                            <p className="text-xs sm:text-sm">
                              Qty: {item.quantity}
                            </p>
                            <p className="font-medium text-xs sm:text-sm">
                              {formatPrice(
                                (basePrice +
                                  (item.selectedVariant?.priceModifier || 0)) *
                                item.quantity,
                                currency
                              )}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 hover:bg-gray-100 rounded shrink-0 touch-target"
                            aria-label="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <span className="font-medium text-sm sm:text-base">
                        Subtotal:
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        {formatPrice(cartSummary.subtotal, currency)}
                      </span>
                    </div>

                    <Link href="/checkout">
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base h-10 sm:h-11">
                        Checkout
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="bg-gray-100 w-10 h-10 sm:w-12 sm:h-12 rounded-md flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Your cart is empty
                  </p>
                  <Link href="/">
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base h-10 sm:h-11">
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
