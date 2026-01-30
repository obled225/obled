import type { Metadata } from 'next';
import { Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { PageLayout } from '@/components/layout/page-layout';
import { TranslationProvider } from '@/lib/context/translation-provider';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
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
        className={`${poppins.variable} ${jetbrainsMono.variable} antialiased`}
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
