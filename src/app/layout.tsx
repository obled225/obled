import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { PageLayout } from '@/components/layout/page-layout';
import { TranslationProvider } from '@/lib/context/translation-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV',
  description:
    "KYS FACTORY CIV - Fournisseur de T-shirt Vierge made in Côte d'Ivoire. Quality blank t-shirts manufactured locally.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <TranslationProvider>
            <PageLayout>{children}</PageLayout>
            <Toaster />
          </TranslationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
