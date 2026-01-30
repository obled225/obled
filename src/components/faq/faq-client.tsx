'use client';

import { useTranslations } from 'next-intl';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';
import { cn } from '@/lib/actions/utils';

export function FaqClient() {
  const t = useTranslations('faq');

  // Define FAQ items with their keys and content
  const faqItems = [
    { key: 'whoWeAre', hasList: false },
    { key: 'location', hasList: false },
    { key: 'products', hasList: false },
    { key: 'productionTime', hasList: false },
    { key: 'samples', hasList: false },
    { key: 'visits', hasList: false },
    { key: 'fabrics', hasList: false },
    { key: 'services', hasList: true },
    { key: 'minimumOrder', hasList: false },
    { key: 'localDelivery', hasList: false },
    { key: 'internationalShipping', hasList: false },
    { key: 'brandLaunch', hasList: false },
    { key: 'cuts', hasList: false },
    { key: 'fileFormats', hasList: false },
    { key: 'quality', hasList: false },
  ];

  // First 3 questions should be open by default, rest closed
  const defaultOpenItems = faqItems.slice(0, 3).map((item) => item.key);

  const renderAnswer = (item: { key: string; hasList: boolean }) => {
    if (item.hasList) {
      return (
        <ul className="list-disc pl-6 mb-6">
          {t.raw(`${item.key}.answer`).map((service: string, index: number) => (
            <li key={index} className="leading-relaxed mb-2">
              {service}
            </li>
          ))}
        </ul>
      );
    }

    const answer = t(`${item.key}.answer`);
    if (item.key === 'productionTime') {
      return (
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-foreground/80 text-sm leading-relaxed text-left whitespace-pre-line"
        >
          {answer}
        </motion.p>
      );
    }

    return (
      <motion.p
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-foreground/80 text-sm leading-relaxed text-left"
      >
        {answer}
      </motion.p>
    );
  };

  return (
    <main className="grow">
      <section className="mx-auto max-w-4xl px-4 pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-medium text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Find answers to frequently asked questions about our products and
            services.
          </p>
        </div>

        {/* How to Order Section */}
        <div className="bg-background border border-border rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl sm:text-2xl font-medium mb-4">
              {t('howToOrder.title')}
            </h2>
            <p className="text-sm sm:text-lg leading-relaxed mb-4">
              {t('howToOrder.content')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {t.raw('howToOrder.steps').map((step: string, index: number) => (
                <li
                  key={index}
                  className="leading-relaxed text-sm sm:text-base"
                >
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <AccordionPrimitive.Root
            type="multiple"
            defaultValue={defaultOpenItems}
          >
            {faqItems.map((item, index) => (
              <AccordionPrimitive.Item
                key={item.key}
                value={item.key}
                className={cn(
                  'group',
                  'transition-all duration-200 ease-in-out',
                  'hover:bg-muted/50',
                  index !== faqItems.length - 1 && 'border-b border-border'
                )}
              >
                <AccordionPrimitive.Header className="px-0">
                  <AccordionPrimitive.Trigger
                    className={cn(
                      'w-full px-6 py-5 h-auto hover:bg-transparent items-start flex-wrap sm:flex-nowrap text-left'
                    )}
                  >
                    <h3
                      className={cn(
                        'text-base sm:text-lg font-medium transition-colors duration-200 text-left leading-relaxed',
                        'text-foreground',
                        'group-hover:text-foreground/90',
                        'wrap-break-word whitespace-normal word-break hyphens-auto flex-1'
                      )}
                    >
                      {t(`${item.key}.question`)}
                    </h3>
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content
                  className={cn(
                    'overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down px-6'
                  )}
                >
                  <div className="pb-5 pt-2">{renderAnswer(item)}</div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
          </AccordionPrimitive.Root>
        </div>
      </section>
    </main>
  );
}
