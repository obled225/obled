import type { Metadata } from 'next';
import { Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { PageLayout } from '@/components/layout/page-layout';
import { TranslationProvider } from '@/lib/translations/provider';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { siteUrl } from '@/lib/utils/config';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  const title = isFrench
    ? "KYS Factory | Fournisseur de t-shirts vierges made in Côte d'Ivoire"
    : "KYS Factory | Blank t-shirts manufacturer made in Côte d'Ivoire";

  const description = isFrench
    ? 'Fabricant textile local à Abidjan spécialisé dans la production de t-shirts vierges de haute qualité pour professionnels.'
    : 'Local textile manufacturer in Abidjan specialized in high-quality blank t-shirt production for professionals.';

  // Combined keywords in both French and English for better SEO coverage
  const keywords =
    "fabricant textile Abidjan, textile manufacturer Abidjan, t-shirt vierge Côte d'Ivoire, blank t-shirt Côte d'Ivoire, production textile locale, local textile production, t-shirt blank Abidjan, B2B textile, fabrication textile Côte d'Ivoire, textile manufacturing Côte d'Ivoire, t-shirt made in Côte d'Ivoire, atelier textile Abidjan, textile workshop Abidjan, production textile flexible, flexible textile production, marque textile Abidjan, textile brand Abidjan, t-shirt oversized, t-shirt coton 100%, 100% cotton t-shirt, production textile rapide, fast textile production, livraison internationale, international shipping, Africa textile, textile Afrique, worldwide shipping";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: '%s | KYS Factory',
    },
    description,
    keywords,
    authors: [{ name: 'KYS Factory' }],
    creator: 'KYS Factory',
    publisher: 'KYS Factory',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: [
      {
        rel: 'icon',
        url: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        url: '/icon.png',
      },
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon.png',
      },
    ],
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? 'en_US' : 'fr_FR',
      url: siteUrl,
      siteName: 'KYS Factory',
      title,
      description,
      images: [
        {
          url: `${siteUrl}/banner.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/banner.png`],
      creator: '@kysfactoryciv',
    },
    alternates: {
      languages: {
        'fr-FR': `${siteUrl}/fr`,
        'en-US': `${siteUrl}/en`,
        'x-default': siteUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();

  // Structured Data - Organization & LocalBusiness
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KYS Factory',
    url: siteUrl,
    logo: `${siteUrl}/icon.webp`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+225-07-13-51-64-17',
      contactType: 'Customer Service',
      areaServed: 'Worldwide',
      availableLanguage: ['French', 'English'],
    },
    sameAs: ['https://www.instagram.com/kysfactoryciv'],
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#business`,
    name: 'KYS Factory',
    image: `${siteUrl}/icon.webp`,
    url: siteUrl,
    telephone: '+225-07-13-51-64-17',
    email: 'contact@kysfactory.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Riviéra Palmeraie',
      addressLocality: 'Abidjan',
      addressCountry: 'CI',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '5.3600',
      longitude: '-4.0083',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    priceRange: '$$',
    servesCuisine: false,
  };

  return (
    <html lang={locale}>
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <TranslationProvider>
            <MetaPixel />
            <PageLayout>{children}</PageLayout>
            <Toaster />
          </TranslationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
