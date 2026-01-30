import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { mockProducts } from '@/lib/data/mock-products';
import { ProductDetail } from '@/components/store/product-detail';
import { SizeGuideModal } from '@/components/store/size-guide-modal';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  // Generate static params for all products
  return mockProducts.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const product = mockProducts.find((p) => p.id === params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | KYSFactory`,
    description: product.description?.join(' ') || '',
    openGraph: {
      title: `${product.name} | KYSFactory`,
      description: product.description?.join(' ') || '',
      images:
        product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const product = mockProducts.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <main className="grow">
        <ProductDetail product={product} />
      </main>

      <SizeGuideModal />
    </>
  );
}
