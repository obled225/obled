import type { Metadata } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import { FaqClient } from '@/components/faq/faq-client';
import { FaqData } from '@/lib/types';
import { siteUrl } from '@/lib/utils/config';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: 'FAQ',
    description: isFrench
      ? 'Réponses à vos questions sur nos produits, commandes, livraison et plus.'
      : 'Answers to your questions about our products, orders, delivery and more.',
    openGraph: {
      url: `${siteUrl}/faq`,
    },
    alternates: {
      canonical: `${siteUrl}/faq`,
    },
  };
}

export default async function FaqPage() {
  const messages = await getMessages();
  const faq = messages.faq as FaqData;

  // Build FAQ structured data
  const faqItems = [
    'whoWeAre',
    'location',
    'products',
    'productionTime',
    'visits',
    'minimumOrder',
    'localDelivery',
    'internationalShipping',
    'brandLaunch',
    'quality',
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems
      .map((key) => {
        const question = faq[key]?.question || '';
        let answer = '';

        if (faq[key]?.answer) {
          if (Array.isArray(faq[key].answer)) {
            answer = faq[key].answer.join(', ');
          } else {
            answer = faq[key].answer;
          }
        }

        return {
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        };
      })
      .filter((item) => item.name && item.acceptedAnswer.text),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <FaqClient />
    </>
  );
}
