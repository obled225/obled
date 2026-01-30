'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, Share2, ZoomIn, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, formatPrice } from '@/lib/types';
import { useCartStore } from '@/lib/store/cart-store';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/actions/utils';
import Modal from '@/components/ui/modal';
import { SizeGuideContent } from './size-guide-modal';
import { useTranslations } from 'next-intl';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const t = useTranslations('products');
  const { addItem } = useCartStore();
  const { success, error } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.find((s) => s.available)?.name || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const images = product.images || [product.image];

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addItem(product, quantity);
      success('Added to cart!', `${product.name} has been added to your cart.`);
    } catch (err) {
      error('Failed to add to cart', 'Please try again.');
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
            <Image
              src={images[selectedImage] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <button
              className="absolute left-4 top-4 rounded-full bg-white/80 p-2 backdrop-blur-sm hover:bg-white transition-colors"
              aria-label="Zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative aspect-square overflow-hidden bg-gray-100',
                    selectedImage === index && 'ring-2 ring-blue-600'
                  )}
                >
                  <Image
                    src={image || '/placeholder-product.jpg'}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:pt-4">
          <h1 className="text-3xl font-normal text-gray-900 leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-lg font-medium text-gray-900">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.soldOut && (
              <span className="rounded-sm bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                Out of Stock
              </span>
            )}
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">
                {t('productDetail.color')}: {selectedColor}
              </p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    disabled={!color.available}
                    className={cn(
                      'relative h-8 w-8 rounded-full border-2 transition-all',
                      selectedColor === color.name
                        ? 'border-gray-900'
                        : 'border-gray-200',
                      !color.available && 'opacity-40'
                    )}
                    style={{ backgroundColor: color.value }}
                    aria-label={color.name}
                  >
                    {color.value === '#FFFFFF' && (
                      <span className="absolute inset-1 rounded-full border border-gray-300" />
                    )}
                    {!color.available && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-px w-8 rotate-45 bg-gray-500" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">
                {t('productDetail.size')}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => size.available && setSelectedSize(size.name)}
                    disabled={!size.available}
                    className={cn(
                      'flex h-10 min-w-[48px] items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors',
                      selectedSize === size.name
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-900',
                      !size.available &&
                        'cursor-not-allowed border-gray-200 text-gray-400 line-through opacity-50'
                    )}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-900 mb-3">
              {t('productDetail.quantity')}
            </p>
            <div className="inline-flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-12 w-12 items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-12 w-16 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-12 w-12 items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <Button
              onClick={handleAddToCart}
              disabled={product.soldOut || isAdding}
              className="w-full h-12 text-sm font-medium"
            >
              {isAdding
                ? t('productDetail.adding')
                : product.soldOut
                  ? t('outOfStock')
                  : t('productDetail.addToCart')}
            </Button>
            {!product.soldOut && (
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-medium border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              >
                {t('productDetail.buyNow')}
              </Button>
            )}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mb-8">
              <ul className="space-y-2 text-sm text-gray-900">
                {product.description.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-900">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Size Guide & Share Buttons */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-200">
            <Button
              variant="ghost"
              className="h-10 px-3 gap-2"
              onClick={() => setIsSizeGuideOpen(true)}
              aria-label={t('productDetail.sizeGuide')}
            >
              <Ruler className="h-5 w-5" />
              <span className="text-sm">{t('productDetail.sizeGuide')}</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <Button
              variant="ghost"
              className="h-10 px-3 gap-2"
              aria-label={t('productDetail.share')}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm">{t('productDetail.share')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <Modal
        isOpen={isSizeGuideOpen}
        close={() => setIsSizeGuideOpen(false)}
        size="medium"
        noBackdrop={true}
      >
        <Modal.Body>
          <SizeGuideContent onClose={() => setIsSizeGuideOpen(false)} />
        </Modal.Body>
      </Modal>
    </div>
  );
}
