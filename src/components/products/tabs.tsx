'use client';

import { Truck, RotateCcw, Shield } from 'lucide-react';
import Accordion from '@/components/ui/accordion';
import { Product } from '@/lib/types';

type ProductTabsProps = {
  product: Product;
};

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: 'Product Information',
      component: <ProductInfoTab product={product} />,
    },
    {
      label: 'Shipping & Returns',
      component: <ShippingInfoTab />,
    },
  ];

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">SKU</span>
            <p className="text-gray-700">{product.sku || '-'}</p>
          </div>
          <div>
            <span className="font-semibold">Category</span>
            <p className="text-gray-700">{product.category.name || '-'}</p>
          </div>
          <div>
            <span className="font-semibold">Tags</span>
            <p className="text-gray-700">{product.tags?.join(', ') || '-'}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p className="text-gray-700">
              {product.weight ? `${product.weight} g` : '-'}
            </p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p className="text-gray-700">
              {product.dimensions
                ? `${product.dimensions.length}L x ${product.dimensions.width}W x ${product.dimensions.height}H`
                : '-'}
            </p>
          </div>
          <div>
            <span className="font-semibold">Stock Status</span>
            <p
              className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}
            >
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <span className="font-semibold">Description</span>
        <div className="mt-2 text-gray-700 prose prose-sm max-w-none">
          {product.description
            ? product.description.join(' ')
            : 'No description available'}
        </div>
      </div>
    </div>
  );
};

const ShippingInfoTab = () => {
  return (
    <div className="py-4">
      <div className="grid grid-cols-1 gap-y-6">
        <div className="flex items-start gap-x-3">
          <Truck className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <span className="font-semibold text-gray-900">Fast Delivery</span>
            <p className="max-w-sm text-gray-700 mt-1">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <RotateCcw className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <span className="font-semibold text-gray-900">Easy Returns</span>
            <p className="max-w-sm text-gray-700 mt-1">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <span className="font-semibold text-gray-900">
              Quality Guarantee
            </span>
            <p className="max-w-sm text-gray-700 mt-1">
              We stand behind our products. If you&apos;re not completely
              satisfied, we&apos;ll make it right.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
