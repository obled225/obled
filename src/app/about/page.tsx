import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / About',
};

export default function AboutPage() {
  return (
    <main className="grow">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">🏭</div>
          <h1 className="mt-8 text-3xl font-medium text-foreground">
            About KYS Factory
          </h1>
        </div>

        <div className="mt-12 prose prose-lg max-w-none text-foreground">
          <p className="text-lg leading-relaxed">
            <strong>KYS Factory</strong> is a manufacturer and supplier of blank
            t-shirts based in Abidjan, Ivory Coast. We specialize in the
            production of high-quality t-shirts, 100% cotton, designed to meet
            the needs of brands and businesses.
          </p>

          <h2 className="text-xl font-medium mt-8 mb-4">Our Products</h2>
          <ul className="space-y-2 text-foreground">
            <li className="flex items-start gap-2">
              <span>•</span>
              T-shirts 100% Coton - Made in Abidjan
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              Different thicknesses: 180 gsm and 220 gsm (Premium)
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              Oversized Boxy Cut with dropped shoulders (Drop Shoulder)
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              Standard cut available
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              Sizes XS to 4XL
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              Suitable for men and women
            </li>
          </ul>

          <h2 className="text-xl font-medium mt-8 mb-4">B2B Offers</h2>
          <p className="leading-relaxed">
            We offer packs of blank t-shirts from 5 to 50 pieces, ideal for
            brands that want to customize their products. Contact us for
            wholesale orders and preferential rates.
          </p>

          <h2 className="text-xl font-medium mt-8 mb-4">Why choose us?</h2>
          <ul className="space-y-2 text-foreground">
            <li className="flex items-start gap-2">
              <span>•</span>
              Local manufacturing in Abidjan
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              Superior quality guaranteed
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              Competitive prices for wholesale orders
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              Responsive customer service via WhatsApp
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
