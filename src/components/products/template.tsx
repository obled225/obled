import React, { Suspense } from 'react';
import { Product } from '@/lib/types';
import ImageGallery from './image-gallery';
import ProductActions from './actions';
import ProductTabs from './tabs';
import RelatedProducts from './related';
import { SkeletonRelatedProducts } from '@/components/products/skeleton-related';
import { PortableText } from '@/components/ui/portable-text';

type ProductTemplateProps = {
  product: Product;
};

const ProductTemplate: React.FC<ProductTemplateProps> = ({ product }) => {
  // TODO: Get related products from Sanity CMS
  const relatedProducts: Product[] = [];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="order-2 lg:order-1">
            <ImageGallery images={product.images || []} alt={product.name} />
          </div>

          {/* Product Info and Actions */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Product Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-blue-600 mb-4">
                ${product.price.toFixed(2)}
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="ml-2 text-base sm:text-lg text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    product.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.stockQuantity && (
                  <span className="text-sm text-gray-600">
                    {product.stockQuantity} available
                  </span>
                )}
              </div>
              <div className="text-gray-700 leading-relaxed">
                {product.description ? (
                  <PortableText content={product.description} />
                ) : (
                  'No description available'
                )}
              </div>
            </div>

            {/* Product Actions */}
            <ProductActions product={product} />

            {/* Product Tags */}
            {product.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <ProductTabs product={product} />
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts
              products={relatedProducts}
              title="Related Products"
              description="You might also like these products"
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default ProductTemplate;
