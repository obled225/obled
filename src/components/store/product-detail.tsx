'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Minus,
  Plus,
  Share2,
  ZoomIn,
  Ruler,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, formatPrice } from '@/lib/types';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/actions/utils';
import { SizeGuideModalWrapper } from './size-guide-modal';
import { ShareModalWrapper } from './share-modal';
import { PortableText } from '@/components/ui/portable-text';
import { useTranslations } from 'next-intl';
import { FullscreenGallery } from '@/components/products/fullscreen-gallery';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RelatedProducts from '@/components/products/related';
import { normalizeColorName } from '@/lib/utils/color';
import { getTaxSettings, type TaxSettings } from '@/lib/sanity/queries';

// Helper function to capitalize first letter of color name for display
const capitalizeColorName = (name: string): string => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const t = useTranslations('products');
  const { addItem } = useCartStore();
  const { currency, convertPrice } = useCurrencyStore();
  const { success, error } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.find((s) => s.available)?.name || ''
  );
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Business Pack Selection - default to first pack if available
  const [selectedPack, setSelectedPack] = useState<
    NonNullable<Product['businessPacks']>[number] | null
  >((product.isBusinessProduct && product.businessPacks?.[0]) || null);

  // Get color image if available, otherwise use main images
  // Make it reactive so it updates when selectedColor changes
  const displayImages = useMemo(() => {
    const selectedColorObj = product.colors?.find(
      (c) => c.name === selectedColor
    );
    if (selectedColorObj?.image) {
      // If color has an image, use it as the main image
      // Filter out duplicates - remove the color image from product images if it exists there
      const mainImages = (product.images || []).filter(
        (img) => img !== selectedColorObj.image
      );
      return [selectedColorObj.image, ...mainImages];
    }
    return product.images || [product.image].filter(Boolean);
  }, [selectedColor, product.colors, product.images, product.image]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFullscreenGalleryOpen, setIsFullscreenGalleryOpen] = useState(false);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);

  // Fetch tax settings
  useEffect(() => {
    async function fetchTaxSettings() {
      const settings = await getTaxSettings();
      setTaxSettings(settings);
    }
    fetchTaxSettings();
  }, []);

  // Check if sizes are required and if a valid size is selected
  const hasAvailableSizes = useMemo(() => {
    if (!product.sizes || product.sizes.length === 0) {
      return true; // No sizes required, so it's valid
    }
    // Check if there are any available sizes
    return product.sizes.some((size) => size.available);
  }, [product.sizes]);

  const hasValidSizeSelection = useMemo(() => {
    if (!product.sizes || product.sizes.length === 0) {
      return true; // No sizes required, so selection is valid
    }
    // If sizes exist, we need a selected size that is available
    if (!selectedSize) return false;
    const selectedSizeObj = product.sizes.find((s) => s.name === selectedSize);
    return selectedSizeObj?.available === true;
  }, [product.sizes, selectedSize]);

  // Product is out of stock if explicitly marked as soldOut OR if sizes exist but none are available
  const isOutOfStock = useMemo(() => {
    if (product.soldOut) return true;
    // If product has sizes but none are available, it's out of stock
    if (product.sizes && product.sizes.length > 0 && !hasAvailableSizes) {
      return true;
    }
    return false;
  }, [product.soldOut, product.sizes, hasAvailableSizes]);

  // Buttons should be disabled if sizes are required but none are available or none selected
  const isAddToCartDisabled = isOutOfStock || isAdding || !hasAvailableSizes || !hasValidSizeSelection;

  // All prices are in XOF, convert to selected currency
  const basePriceXOF = product.price || 0;

  // Get pack price for selected currency
  const getPackPrice = (pack: {
    quantity: number;
    label?: string;
    price?: number;
    originalPrice?: number;
  }) => {
    const packPriceXOF = pack.price || basePriceXOF * pack.quantity;
    return convertPrice(packPriceXOF, currency);
  };

  // Get pack original price for selected currency (if available)
  const getPackOriginalPrice = (pack: {
    quantity: number;
    label?: string;
    price?: number;
    originalPrice?: number;
  }) => {
    const originalPriceXOF = pack.originalPrice;
    return originalPriceXOF
      ? convertPrice(originalPriceXOF, currency)
      : undefined;
  };

  const baseDisplayPrice = convertPrice(basePriceXOF, currency);
  const packDisplayPrice = selectedPack
    ? getPackPrice(selectedPack)
    : baseDisplayPrice;

  const packOriginalPrice = selectedPack
    ? getPackOriginalPrice(selectedPack)
    : undefined;

  // Base price (before quantity multiplication)
  const basePrice = packDisplayPrice;
  const baseOriginalPriceXOF = packOriginalPrice
    ? (
      selectedPack as {
        quantity: number;
        label?: string;
        price?: number;
        originalPrice?: number;
      } | null
    )?.originalPrice
      ? (
        selectedPack as {
          quantity: number;
          label?: string;
          price?: number;
          originalPrice?: number;
        }
      ).originalPrice
      : product.originalPrice
    : product.originalPrice;
  const baseOriginalPrice = baseOriginalPriceXOF
    ? convertPrice(baseOriginalPriceXOF, currency)
    : undefined;

  // Display price multiplied by quantity (for both packs and non-packs)
  const displayPrice = basePrice * quantity;
  const displayOriginalPrice = baseOriginalPrice
    ? baseOriginalPrice * quantity
    : undefined;

  // Reset selected image when color changes
  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedImage(0); // Reset to first image when color changes
  };

  // Touch handlers for swipe navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSelectedImage((selectedImage + 1) % displayImages.length);
    }
    if (isRightSwipe) {
      setSelectedImage(
        (selectedImage - 1 + displayImages.length) % displayImages.length
      );
    }
  };

  // Fast navigation functions
  const goToNextImage = () => {
    setSelectedImage((selectedImage + 1) % displayImages.length);
  };

  const goToPrevImage = () => {
    setSelectedImage(
      (selectedImage - 1 + displayImages.length) % displayImages.length
    );
  };

  const router = useRouter();
  const [productUrl, setProductUrl] = useState('');

  // Set product URL on client side
  useEffect(() => {
    setProductUrl(`${window.location.origin}/products/${product.slug}`);
  }, [product.slug]);

  const handleAddToCart = async () => {
    // Prevent adding to cart if sizes are required but none are available or selected
    if (product.sizes && product.sizes.length > 0) {
      if (!hasAvailableSizes || !hasValidSizeSelection) {
        error(
          t('productDetail.sizeRequired') || 'Size required',
          t('productDetail.selectAvailableSize') || 'Please select an available size.'
        );
        return;
      }
    }

    setIsAdding(true);
    try {
      // For business products with packs, always use a pack
      if (
        product.isBusinessProduct &&
        product.businessPacks &&
        product.businessPacks.length > 0 &&
        selectedPack
      ) {
        // All prices are in XOF
        const packPriceXOF =
          (
            selectedPack as {
              quantity: number;
              label?: string;
              price?: number;
              originalPrice?: number;
            }
          ).price || basePriceXOF * selectedPack.quantity;

        // Calculate price modifier: pack price minus base unit price (in XOF)
        // The cart calculates: (basePrice + modifier) * quantity
        // For packs: (basePrice + (packPrice - basePrice)) * quantity = packPrice * quantity
        // This ensures 1 pack shows as packPrice, not basePrice * packSize
        const priceModifier = packPriceXOF - basePriceXOF;

        const variant = {
          id: `pack-${selectedPack.quantity}`,
          name: selectedPack.label || `Pack ${selectedPack.quantity}`,
          value: String(selectedPack.quantity),
          priceModifier: priceModifier,
          packSize: selectedPack.quantity,
        };

        // Add packs, not units (quantity = number of packs, should be 1)
        addItem(product, quantity, variant);
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
    // Prevent buying if sizes are required but none are available or selected
    if (product.sizes && product.sizes.length > 0) {
      if (!hasAvailableSizes || !hasValidSizeSelection) {
        error(
          t('productDetail.sizeRequired') || 'Size required',
          t('productDetail.selectAvailableSize') || 'Please select an available size.'
        );
        return;
      }
    }

    try {
      // For business products with packs, always use a pack
      if (
        product.isBusinessProduct &&
        product.businessPacks &&
        product.businessPacks.length > 0 &&
        selectedPack
      ) {
        // All prices are in XOF
        const packPriceXOF =
          (
            selectedPack as {
              quantity: number;
              label?: string;
              price?: number;
              originalPrice?: number;
            }
          ).price || basePriceXOF * selectedPack.quantity;

        // Calculate price modifier: pack price minus base unit price (in XOF)
        // The cart calculates: (basePrice + modifier) * quantity
        // For packs: (basePrice + (packPrice - basePrice)) * quantity = packPrice * quantity
        // This ensures 1 pack shows as packPrice, not basePrice * packSize
        const priceModifier = packPriceXOF - basePriceXOF;

        const variant = {
          id: `pack-${selectedPack.quantity}`,
          name: selectedPack.label || `Pack ${selectedPack.quantity}`,
          value: String(selectedPack.quantity),
          priceModifier: priceModifier,
          packSize: selectedPack.quantity,
        };
        // Add packs, not units (quantity = number of packs)
        addItem(product, quantity, variant);
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
          {/* Main Image - adapts to image aspect ratio */}
          <div
            className="relative w-full bg-transparent rounded-md cursor-pointer group"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {displayImages.length > 0 && displayImages[selectedImage] ? (
              <>
                {/* Image adapts to its natural aspect ratio */}
                <Image
                  src={displayImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-auto rounded-md"
                  onClick={() => setIsFullscreenGalleryOpen(true)}
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                  loading="eager"
                  width={1200}
                  height={1600}
                  unoptimized
                  priority={selectedImage === 0}
                />
                <button
                  onClick={() => setIsFullscreenGalleryOpen(true)}
                  className="absolute left-4 top-4 rounded-md bg-white/80 p-2 backdrop-blur-sm hover:bg-white transition-colors z-10"
                  aria-label="Zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <span>No image available</span>
              </div>
            )}
          </div>

          {/* Image Navigation */}
          {displayImages.length > 1 && (
            <>
              {/* Mobile: Arrow Navigation */}
              <div className="flex items-center justify-center gap-3 sm:hidden">
                <button
                  onClick={goToPrevImage}
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-white/80 border border-gray-200 hover:bg-white active:bg-gray-100 transition-colors touch-target"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {selectedImage + 1} / {displayImages.length}
                </span>
                <button
                  onClick={goToNextImage}
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-white/80 border border-gray-200 hover:bg-white active:bg-gray-100 transition-colors touch-target"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Desktop: Thumbnail Gallery */}
              <div className="hidden sm:grid grid-cols-3 gap-3 sm:gap-4">
                {displayImages.map(
                  (image, index) =>
                    image && (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          'relative aspect-square overflow-hidden bg-transparent rounded-md transition-all',
                          selectedImage === index &&
                          'ring-2 ring-blue-600 scale-105'
                        )}
                      >
                        {/* Use object-contain for thumbnails to show full image */}
                        <Image
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-contain"
                          width={300}
                          height={300}
                          quality={90}
                          unoptimized
                        />
                      </button>
                    )
                )}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:pt-4">
          <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 leading-tight mb-3 sm:mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-2">
                {displayOriginalPrice &&
                  displayOriginalPrice > displayPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(displayOriginalPrice, currency)}
                    </span>
                  )}
                <span className="text-lg font-medium text-gray-900">
                  {formatPrice(displayPrice, currency)}
                </span>
              </div>
            </div>
            {/* Only show "All taxes included" when tax is NOT enabled */}
            {(!taxSettings ||
              !taxSettings.isActive ||
              taxSettings.taxRates.length === 0) && (
                <p className="text-xs text-gray-500">
                  {t('productDetail.taxesIncluded')}
                </p>
              )}
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 1 && (
            <div className="mb-6">
              <div className="flex gap-2 mb-3">
                {product.colors.map((color, index) => {
                  const normalizedColor = normalizeColorName(color.name);
                  const isMix = normalizedColor === 'mix';
                  const isWhite =
                    normalizedColor === 'white' ||
                    color.name.toLowerCase() === 'blanc';

                  return (
                    <button
                      key={`${color.name}-${index}`}
                      onClick={() => handleColorChange(color.name)}
                      disabled={!color.available}
                      className={cn(
                        'relative h-8 w-8 rounded-full border-2 transition-all overflow-hidden',
                        selectedColor === color.name
                          ? isWhite
                            ? 'border-gray-900'
                            : 'border-gray-900'
                          : isWhite
                            ? 'border-gray-300'
                            : 'border-gray-200',
                        !color.available && 'opacity-40',
                        isMix && 'bg-white'
                      )}
                      style={
                        !isMix
                          ? { backgroundColor: normalizedColor }
                          : undefined
                      }
                      aria-label={color.name}
                    >
                      {isMix && (
                        <>
                          {/* Half white, half black circle */}
                          <div className="absolute inset-0 bg-white" />
                          <div
                            className="absolute inset-0 bg-black"
                            style={{
                              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
                            }}
                          />
                        </>
                      )}
                      {!color.available && (
                        <span className="absolute inset-0 flex items-center justify-center z-10">
                          <span className="h-px w-8 rotate-45 bg-gray-500" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>
                  {capitalizeColorName(
                    selectedColor || product.colors[0]?.name || ''
                  )}
                </span>
                {product.grammage && (
                  <>
                    <span>•</span>
                    <span>{product.grammage} g/m²</span>
                  </>
                )}
                {product.material && (
                  <>
                    <span>•</span>
                    <span>{product.material}</span>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Product Specifications (Grammage & Material) - Only show if no colors */}
          {(!product.colors || product.colors.length <= 1) &&
            (product.grammage || product.material) && (
              <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                {product.grammage && (
                  <>
                    <span>{product.grammage} g/m²</span>
                    {product.material && <span>•</span>}
                  </>
                )}
                {product.material && (
                  <span>{product.material}</span>
                )}
              </div>
            )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">
                {t('productDetail.size')}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={`${size.name}-${index}`}
                    onClick={() => size.available && setSelectedSize(size.name)}
                    disabled={!size.available}
                    className={cn(
                      'relative flex h-10 min-w-[48px] items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors',
                      selectedSize === size.name
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-blue-600',
                      !size.available &&
                      'cursor-not-allowed border-gray-200 text-gray-400 opacity-50'
                    )}
                  >
                    {size.name}
                    {!size.available && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="h-px w-full rotate-45 bg-gray-500" />
                      </span>
                    )}
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
                  {product.businessPacks.map((pack) => (
                    <button
                      key={pack.quantity}
                      onClick={() => setSelectedPack(pack)}
                      className={cn(
                        'flex h-10 px-4 items-center justify-center rounded-md border text-sm font-medium transition-colors',
                        selectedPack?.quantity === pack.quantity
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-blue-600'
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
              disabled={isAddToCartDisabled}
              className="w-full h-11 sm:h-12 text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 touch-target"
            >
              {isAdding
                ? t('productDetail.adding')
                : isOutOfStock
                  ? t('outOfStock')
                  : !hasAvailableSizes || !hasValidSizeSelection
                    ? t('productDetail.noSizeAvailable') || 'No size available'
                    : t('productDetail.addToCart')}
            </Button>
            {!isOutOfStock && (
              <Button
                variant="outline"
                className="w-full h-11 sm:h-12 text-sm font-medium border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors touch-target"
                onClick={handleBuyNow}
                disabled={!hasAvailableSizes || !hasValidSizeSelection}
              >
                {t('productDetail.buyNow')}
              </Button>
            )}

            {/* Business Pack Link */}
            {product.businessPackProduct && !product.isBusinessProduct && (
              <Link href={`/products/${product.businessPackProduct.slug}`}>
                <Button
                  variant="outline"
                  className="w-full h-11 sm:h-12 text-sm font-medium border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors touch-target"
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
      <SizeGuideModalWrapper
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Share Modal */}
      <ShareModalWrapper
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={productUrl}
        title={product.name}
      />

      {/* Fullscreen Image Gallery */}
      <FullscreenGallery
        images={displayImages}
        initialIndex={selectedImage}
        isOpen={isFullscreenGalleryOpen}
        onClose={() => setIsFullscreenGalleryOpen(false)}
      />

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <RelatedProducts
            products={product.relatedProducts}
            title={t('productDetail.relatedProducts') || 'Related Products'}
          />
        </div>
      )}
    </div>
  );
}
