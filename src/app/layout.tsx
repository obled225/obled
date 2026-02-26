import type { Metadata } from 'next';
import { Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { PageLayout } from '@/components/layout/page-layout';
import { TranslationProvider } from '@/lib/translations/provider';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { Analytics } from '@vercel/analytics/next';
import { siteUrl } from '@/lib/utils/config';
import { getMetadataBaseUrl } from '@/lib/utils/metadata-base-url';
import { getHeaderCategories, getShowAboutInNav } from '@/lib/sanity/queries';

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
  const [locale, baseUrl] = await Promise.all([getLocale(), getMetadataBaseUrl()]);
  const isFrench = locale === 'fr';

  const title = isFrench
    ? "O'bled | Vêtements & Accessoires"
    : "O'bled | Clothing & Accessories";

  const description =
    "Porter O'bled c'est pas juste un habit. C'est notre langage, notre fierté. Vêtements et accessoires inspirés du Nouchi et fabriqués entièrement en Côte d'Ivoire.";

  const keywords =
    "O'bled, vêtements Côte d'Ivoire, vêtements Abidjan, marque ivoirienne, Nouchi, culture ivoirienne, vêtements made in Côte d'Ivoire, accessoires Abidjan, mode Abidjan, textile Côte d'Ivoire, Inspiré du Nouchi vers le monde, Nouchi-inspired to the world, tout pour la culture, héritage création";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | O'bled",
    },
    description,
    keywords,
    authors: [
      {
        name: "O'bled",
      },
    ],
    creator: "O'bled",
    publisher: "O'bled",
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
      url: baseUrl,
      siteName: "O'bled",
      title,
      description,
      images: [
        {
          url: '/banner.png',
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
      images: ['/banner.png'],
      creator: '@obled225',
    },
    alternates: {
      languages: {
        'fr-FR': `${baseUrl}/fr`,
        'en-US': `${baseUrl}/en`,
        'x-default': baseUrl,
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
    name: "O'bled",
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+225-07-78-03-41-42',
      contactType: 'Customer Service',
      areaServed: 'Worldwide',
      availableLanguage: ['French', 'English'],
    },
    sameAs: [
      'https://www.instagram.com/obled225',
      'https://www.facebook.com/Obled225',
    ],
  };

  const [categories, showAboutInNav] = await Promise.all([
    getHeaderCategories(),
    getShowAboutInNav(),
  ]);

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#business`,
    name: "O'bled",
    image: `${siteUrl}/icon.png`,
    url: siteUrl,
    telephone: '+225-07-78-03-41-42',
    email: 'contact@obled225.com',
    address: {
      '@type': 'PostalAddress',
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
            <Analytics />
            <PageLayout categories={categories} showAboutInNav={showAboutInNav}>
              {children}
            </PageLayout>
            <Toaster />
          </TranslationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
