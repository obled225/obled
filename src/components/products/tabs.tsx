'use client';

import { Truck, RotateCcw, Shield } from 'lucide-react';
import Accordion from '@/components/ui/Accordion';
import { Product } from '@/lib/types';
import { PortableText } from '@/components/ui/portable-text';
import { useTranslations } from 'next-intl';

type ProductTabsProps = {
  product: Product;
};

const ProductTabs = ({ product }: ProductTabsProps) => {
  const t = useTranslations('products.productTabs');
  const tabs = [
    {
      label: t('productInformation'),
      component: <ProductInfoTab product={product} />,
    },
    {
      label: t('shippingReturns'),
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
  const t = useTranslations('products.productTabs');
  const tProducts = useTranslations('products');
  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">{t('category')}</span>
            <p className="text-gray-700">{product.category.name || '-'}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">{t('stockStatus')}</span>
            <p
              className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}
            >
              {product.inStock ? t('inStock') : tProducts('outOfStock')}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <span className="font-semibold">{t('description')}</span>
        <div className="mt-2 text-gray-700 prose prose-sm max-w-none">
          {product.description ? (
            <PortableText content={product.description} />
          ) : (
            t('noDescriptionAvailable')
          )}
        </div>
      </div>
    </div>
  );
};

const ShippingInfoTab = () => {
  const t = useTranslations('products.productTabs');
  return (
    <div className="py-4">
      <div className="grid grid-cols-1 gap-y-6">
        <div className="flex items-start gap-x-3">
          <Truck className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <span className="font-semibold text-gray-900">
              {t('fastDelivery.title')}
            </span>
            <p className="max-w-sm text-gray-700 mt-1">
              {t('fastDelivery.description')}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <RotateCcw className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <span className="font-semibold text-gray-900">
              {t('easyReturns.title')}
            </span>
            <p className="max-w-sm text-gray-700 mt-1">
              {t('easyReturns.description')}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <span className="font-semibold text-gray-900">
              {t('qualityGuarantee.title')}
            </span>
            <p className="max-w-sm text-gray-700 mt-1">
              {t('qualityGuarantee.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
