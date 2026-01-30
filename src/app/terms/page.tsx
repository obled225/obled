import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / Terms',
};

export default function TermsPage() {
  return (
    <main className="grow">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-medium text-foreground text-center mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-lg leading-relaxed mb-6">
            Welcome to KYS FACTORY CIV. By accessing and using our website, you
            agree to comply with and be bound by the following terms and
            conditions.
          </p>

          <h2 className="text-xl font-medium mt-8 mb-4">Use of Our Website</h2>
          <p className="leading-relaxed mb-6">
            Our website provides information about our products and services.
            You may use this website for lawful purposes only and in accordance
            with these terms.
          </p>

          <h2 className="text-xl font-medium mt-8 mb-4">Product Information</h2>
          <p className="leading-relaxed mb-6">
            We strive to provide accurate product information, but we do not
            warrant that product descriptions or other content on this site is
            accurate, complete, or error-free.
          </p>

          <h2 className="text-xl font-medium mt-8 mb-4">Pricing and Payment</h2>
          <p className="leading-relaxed mb-6">
            All prices are subject to change without notice. Payment must be
            made via approved methods as specified in our ordering process.
          </p>

          <h2 className="text-xl font-medium mt-8 mb-4">Contact Information</h2>
          <p className="leading-relaxed mb-6">
            For questions about these terms, please contact us through our
            contact page or via WhatsApp at +225 07 13 51 64 17.
          </p>

          <h2 className="text-xl font-medium mt-8 mb-4">Changes to Terms</h2>
          <p className="leading-relaxed mb-6">
            We reserve the right to modify these terms at any time. Changes will
            be effective immediately upon posting on this website.
          </p>
        </div>
      </section>
    </main>
  );
}
