import { Metadata } from 'next';
import Link from 'next/link';
import { mockProducts } from '@/lib/data/mock-products';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';

// Get unique categories from products
const getCategories = () => {
  const categoryMap = new Map();

  mockProducts.forEach((product) => {
    if (!categoryMap.has(product.category.id)) {
      categoryMap.set(product.category.id, {
        ...product.category,
        productCount: 0,
        image:
          (product.images && product.images[0]) || '/placeholder-product.jpg',
      });
    }
    categoryMap.get(product.category.id).productCount++;
  });

  return Array.from(categoryMap.values());
};

export const metadata: Metadata = {
  title: 'Categories | KYSFactory',
  description: 'Browse our product categories',
};

export default function CategoriesPage() {
  const categories = getCategories();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Categories
            </h1>
            <p className="text-gray-600">
              Explore our product categories to find exactly what you&apos;re
              looking for for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-4/3 relative overflow-hidden">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      width={500}
                      height={500}
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-colors" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90">
                      {category.productCount}{' '}
                      {category.productCount === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
