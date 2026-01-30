import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Award, Users, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About KYSFactory | Premium T-Shirt Manufacturer',
  description:
    "Learn about KYSFactory, your trusted partner for premium cotton t-shirts. Made in Côte d'Ivoire with quality and sustainability in mind.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About KYSFactory
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Premium t-shirt manufacturer and supplier based in Côte
              d&apos;Ivoire. Committed to quality, sustainability, and
              exceptional customer service.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    KYSFactory was founded with a simple mission: to create the
                    highest quality cotton t-shirts that combine comfort, style,
                    and sustainability. Based in the heart of Côte
                    d&apos;Ivoire, we work directly with local artisans and
                    manufacturers to ensure every product meets our rigorous
                    standards.
                  </p>
                  <p>
                    What started as a small workshop has grown into a trusted
                    brand serving customers across West Africa and beyond. We
                    specialize in premium cotton t-shirts with various cuts,
                    from oversized boxy fits to classic standards, all made with
                    100% cotton and manufactured locally.
                  </p>
                  <p>
                    Our commitment to quality means we never compromise on
                    materials or craftsmanship. Every t-shirt is carefully
                    inspected before leaving our facility, ensuring you receive
                    only the best products.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">
                      Workshop Image
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality First</h3>
                <p className="text-gray-600">
                  Every product undergoes rigorous quality control before
                  shipping.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
                <p className="text-gray-600">
                  Eco-friendly practices and materials for a better future.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Local Impact</h3>
                <p className="text-gray-600">
                  Supporting local communities and creating jobs in Côte
                  d&apos;Ivoire.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reliability</h3>
                <p className="text-gray-600">
                  Consistent quality and timely delivery you can count on.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Standard Cut</h3>
                <p className="text-gray-600 mb-4">
                  Classic t-shirt fit perfect for everyday wear
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li>• 100% Cotton</li>
                  <li>• 180 GSM</li>
                  <li>• Pre-shrunk</li>
                  <li>• Reinforced seams</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Oversized Boxy</h3>
                <p className="text-gray-600 mb-4">
                  Trendy oversized fit with dropped shoulders
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li>• 100% Cotton</li>
                  <li>• 180 GSM</li>
                  <li>• Oversized fit</li>
                  <li>• Perfect for layering</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-gray-600 mb-4">
                  220 GSM heavy cotton for maximum comfort
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li>• 100% Cotton</li>
                  <li>• 220 GSM</li>
                  <li>• Ultra soft</li>
                  <li>• Long-lasting</li>
                </ul>
              </div>
            </div>

            <Link href="/products">
              <Button size="lg">View All Products</Button>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Work With Us?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re looking for retail products or wholesale
              opportunities, we&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  Contact Us
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
