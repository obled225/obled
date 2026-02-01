'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus, Share2, ZoomIn, Ruler, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, formatPrice, getProductPrice } from '@/lib/types';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/actions/utils';
import Modal from '@/components/ui/modal';
import { SizeGuideContent } from './size-guide-modal';
import { ShareContent } from './share-modal';
import { PortableText } from '@/components/ui/portable-text';
import { useTranslations } from 'next-intl';
import { FullscreenGallery } from '@/components/products/fullscreen-gallery';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const t = useTranslations('products');
  const { addItem } = useCartStore();
  const { currency } = useCurrencyStore();
  const { success, error } = useToast();
  const isMobile = useIsMobile();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.find((s) => s.available)?.name || ''
  );

  // Business Pack Selection
  const [selectedPack, setSelectedPack] = useState<
    NonNullable<Product['businessPacks']>[number] | null
  >(null);

  // Get color image if available, otherwise use main images
  const getDisplayImages = () => {
    const selectedColorObj = product.colors?.find(
      (c) => c.name === selectedColor
    );
    if (selectedColorObj?.image) {
      // If color has an image, use it as the main image
      return [selectedColorObj.image, ...(product.images || [])];
    }
    return product.images || [product.image].filter(Boolean);
  };

  const displayImages = getDisplayImages();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFullscreenGalleryOpen, setIsFullscreenGalleryOpen] = useState(false);

  // Get price for selected currency
  const currentPrice =
    getProductPrice(product, currency) ||
    getProductPrice(product, 'XOF') ||
    product.prices[0];

  // Calculate display price based on Pack selection
  const baseDisplayPrice = currentPrice?.basePrice || product.price;
  const packDisplayPrice = selectedPack
    ? selectedPack.price || baseDisplayPrice * selectedPack.quantity
    : baseDisplayPrice;

  const displayPrice = packDisplayPrice;
  const displayCurrency = currentPrice?.currency || product.currency;
  const displayOriginalPrice = currentPrice?.originalPrice;

  // Reset selected image when color changes
  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedImage(0); // Reset to first image when color changes
  };

  const router = useRouter();
  const [productUrl, setProductUrl] = useState('');

  // Set product URL on client side
  useEffect(() => {
    setProductUrl(`${window.location.origin}/products/${product.slug}`);
  }, [product.slug]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      if (selectedPack) {
        const base = currentPrice?.basePrice || product.price;
        // Calculate effective unit price in the pack
        const packPrice = selectedPack.price || base * selectedPack.quantity;
        const unitPriceInPack = packPrice / selectedPack.quantity;
        const priceModifier = unitPriceInPack - base;

        const variant = {
          id: `pack-${selectedPack.quantity}`,
          name: selectedPack.label || `Pack ${selectedPack.quantity}`,
          value: String(selectedPack.quantity),
          priceModifier: priceModifier,
          stockQuantity: product.stockQuantity,
          sku: `${product.sku}-PACK-${selectedPack.quantity}`,
          lomiPriceId: selectedPack.lomiPriceId,
          packSize: selectedPack.quantity,
        };

        addItem(product, quantity * selectedPack.quantity, variant);
      } else {
        addItem(product, quantity);
      }
      success('Added to cart!', `${product.name} has been added to your cart.`);
    } catch (err) {
      error('Failed to add to cart', 'Please try again.');
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      if (selectedPack) {
        const base = currentPrice?.basePrice || product.price;
        const packPrice = selectedPack.price || base * selectedPack.quantity;
        const unitPriceInPack = packPrice / selectedPack.quantity;
        const priceModifier = unitPriceInPack - base;

        const variant = {
          id: `pack-${selectedPack.quantity}`,
          name: selectedPack.label || `Pack ${selectedPack.quantity}`,
          value: String(selectedPack.quantity),
          priceModifier: priceModifier,
          stockQuantity: product.stockQuantity,
          sku: `${product.sku}-PACK-${selectedPack.quantity}`,
          lomiPriceId: selectedPack.lomiPriceId,
          packSize: selectedPack.quantity,
        };
        addItem(product, quantity * selectedPack.quantity, variant);
      } else {
        addItem(product, quantity);
      }
      router.push('/checkout');
    } catch (err) {
      error('Failed to proceed to checkout', 'Please try again.');
      console.error('Failed to buy now:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-3/4 overflow-hidden bg-gray-100 rounded-md cursor-pointer group">
            {displayImages.length > 0 && displayImages[selectedImage] ? (
              <>
                {/* Use regular img tag for unoptimized best quality */}
                <Image
                  src={displayImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onClick={() => setIsFullscreenGalleryOpen(true)}
                  width={1000}
                  height={1000}
                  unoptimized
                />
                <button
                  onClick={() => setIsFullscreenGalleryOpen(true)}
                  className="absolute left-4 top-4 rounded-full bg-white/80 p-2 backdrop-blur-sm hover:bg-white transition-colors z-10"
                  aria-label="Zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {displayImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {displayImages.map(
                (image, index) =>
                  image && (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'relative aspect-square overflow-hidden bg-gray-100 rounded-md',
                        selectedImage === index && 'ring-2 ring-blue-600'
                      )}
                    >
                      {/* Use regular img tag for unoptimized best quality */}
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={1000}
                        height={1000}
                        unoptimized
                      />
                    </button>
                  )
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:pt-4">
          <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 leading-tight mb-3 sm:mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-gray-900">
                {formatPrice(displayPrice, displayCurrency)}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(displayOriginalPrice, displayCurrency)}
                </span>
              )}
            </div>
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
                    onClick={() => handleColorChange(color.name)}
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

          {/* Pack Selector (Business Only) */}
          {product.isBusinessProduct &&
            product.businessPacks &&
            product.businessPacks.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {t('pack') || 'Pack'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedPack(null)}
                    className={cn(
                      'flex h-10 px-4 items-center justify-center rounded-md border text-sm font-medium transition-colors',
                      !selectedPack
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-900'
                    )}
                  >
                    Unit (1)
                  </button>
                  {product.businessPacks.map((pack) => (
                    <button
                      key={pack.quantity}
                      onClick={() => setSelectedPack(pack)}
                      className={cn(
                        'flex h-10 px-4 items-center justify-center rounded-md border text-sm font-medium transition-colors',
                        selectedPack?.quantity === pack.quantity
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-900'
                      )}
                    >
                      {pack.label || `Pack ${pack.quantity}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Quantity */}
          <div className="mb-6 sm:mb-8">
            <p className="text-sm font-medium text-gray-900 mb-3">
              {t('productDetail.quantity')}
            </p>
            <div className="inline-flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors touch-target"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 sm:h-12 w-12 sm:w-16 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors touch-target"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6 sm:mb-8">
            <Button
              onClick={handleAddToCart}
              disabled={product.soldOut || isAdding}
              className="w-full h-11 sm:h-12 text-sm font-medium touch-target"
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
                className="w-full h-11 sm:h-12 text-sm font-medium border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors touch-target"
                onClick={handleBuyNow}
              >
                {t('productDetail.buyNow')}
              </Button>
            )}
            
            {/* Business Pack Link */}
            {product.businessPackProduct && !product.isBusinessProduct && (
              <Link href={`/products/${product.businessPackProduct.slug}`}>
                <Button
                  variant="outline"
                  className="w-full h-11 sm:h-12 text-sm font-medium border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors touch-target"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {t('productDetail.viewBusinessPack')}
                </Button>
              </Link>
            )}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mb-8">
              <PortableText
                content={product.description}
                className="text-sm text-gray-900"
              />
            </div>
          )}

          {/* Size Guide & Share Buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200">
            <Button
              variant="ghost"
              className="h-10 px-2 sm:px-3 gap-2 text-xs sm:text-sm touch-target"
              onClick={() => setIsSizeGuideOpen(true)}
              aria-label={t('productDetail.sizeGuide')}
            >
              <Ruler className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">
                {t('productDetail.sizeGuide')}
              </span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <Button
              variant="ghost"
              className="h-10 px-2 sm:px-3 gap-2 text-xs sm:text-sm touch-target"
              onClick={() => setIsShareOpen(true)}
              aria-label={t('productDetail.share')}
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">
                {t('productDetail.share')}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <Modal
        isOpen={isSizeGuideOpen}
        close={() => setIsSizeGuideOpen(false)}
        size="medium"
      >
        <Modal.Body>
          <div className="w-full max-w-full">
            <SizeGuideContent onClose={() => setIsSizeGuideOpen(false)} />
          </div>
        </Modal.Body>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={isShareOpen}
        close={() => setIsShareOpen(false)}
        size="medium"
        position={isMobile ? 'bottom' : 'center'}
      >
        <Modal.Body>
          <div className="w-full max-w-full">
            <ShareContent
              url={productUrl}
              title={product.name}
              onClose={() => setIsShareOpen(false)}
            />
          </div>
        </Modal.Body>
      </Modal>

      {/* Fullscreen Image Gallery */}
      <FullscreenGallery
        images={displayImages}
        initialIndex={selectedImage}
        isOpen={isFullscreenGalleryOpen}
        onClose={() => setIsFullscreenGalleryOpen(false)}
      />
    </div>
  );
}
