import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/actions/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
        <Image
          src={
            (product.images && product.images[0]) || '/placeholder-product.jpg'
          }
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {!product.inStock && (
          <span className="absolute bottom-4 left-4 rounded-sm bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">
            Out of Stock
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-normal text-gray-900 leading-snug group-hover:underline">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-sm font-medium text-gray-900">
            {product.originalPrice && product.originalPrice > product.price
              ? `From ${formatPrice(product.price)}`
              : formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
