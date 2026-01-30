'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon } from '@/components/ui/icons';

export function AboutClient() {
  const t = useTranslations('about');
  const tContact = useTranslations('contact');

  return (
    <main className="grow">
      <section className="mx-auto max-w-4xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">🏭</div>
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-foreground/80 mb-6">{t('subtitle')}</p>
          <p className="text-base sm:text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-foreground">
          {/* Who We Are Section */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-medium mb-4">{t('whoWeAre.title')}</h2>
            <h3 className="text-lg sm:text-xl font-medium mb-6 text-foreground/80">
              {t('whoWeAre.subtitle')}
            </h3>
            <p className="text-sm sm:text-lg leading-relaxed">{t('whoWeAre.content')}</p>
          </div>

          {/* B2B Solutions Section */}
          <div className="bg-background border border-border rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl sm:text-2xl font-medium mb-4">{t('b2b.title')}</h2>
              <h3 className="text-lg sm:text-xl font-medium mb-6 text-foreground/80">
                {t('b2b.subtitle')}
              </h3>
              <p className="text-sm sm:text-lg leading-relaxed mb-6">{t('b2b.content')}</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t.raw('b2b.targets').map((target: string, index: number) => (
                  <li key={index} className="leading-relaxed text-sm sm:text-lg">
                    {target}
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <Link
                  href="/business"
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
                >
                  {t('b2b.cta')}
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>

          {/* Production Section */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-medium mb-4">
              {t('production.title')}
            </h2>
            <h3 className="text-lg sm:text-xl font-medium mb-6 text-foreground/80">
              {t('production.subtitle')}
            </h3>
            <p className="text-sm sm:text-lg leading-relaxed mb-6">
              {t('production.content')}
            </p>
            <p className="text-sm sm:text-lg leading-relaxed mb-6">
              {t('production.strength')}
            </p>
            <p className="text-sm sm:text-lg leading-relaxed mb-6">
              Nous produisons des vêtements adaptés à tous types de projets :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {t
                .raw('production.projects')
                .map((project: string, index: number) => (
                  <li key={index} className="leading-relaxed text-sm sm:text-lg">
                    {project}
                  </li>
                ))}
            </ul>
          </div>

          {/* Responsiveness Section */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-medium mb-6">
              {t('responsiveness.title')}
            </h2>
            <p className="text-sm sm:text-lg leading-relaxed mb-6">
              {t('responsiveness.content')}
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              {t
                .raw('responsiveness.features')
                .map((feature: string, index: number) => (
                  <li key={index} className="leading-relaxed text-sm sm:text-lg">
                    {feature}
                  </li>
                ))}
            </ul>
            <p className="text-sm sm:text-lg leading-relaxed font-medium">
              {t('responsiveness.urgency')}
            </p>
          </div>

          {/* Support Section */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-medium mb-6">{t('support.title')}</h2>
            <p className="text-sm sm:text-lg leading-relaxed mb-6">{t('support.intro')}</p>
            <p className="text-sm sm:text-lg leading-relaxed mb-6">
              {t('support.content')}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {t
                .raw('support.services')
                .map((service: string, index: number) => (
                  <li key={index} className="leading-relaxed text-sm sm:text-lg">
                    {service}
                  </li>
                ))}
            </ul>
          </div>

          {/* Commitment Section */}
          <div className="bg-background border border-border rounded-lg overflow-hidden mb-12">
            <div className="p-6">
              <h2 className="text-xl sm:text-2xl font-medium mb-6">
                {t('commitment.title')}
              </h2>
              <p className="text-sm sm:text-lg leading-relaxed">
                {t('commitment.content')}
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-medium mb-6">{tContact('title')}</h2>
            <p className="text-sm sm:text-lg leading-relaxed mb-6 text-foreground/80">
              {tContact('description')}
            </p>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    {
                      key: 'whatsapp',
                      href: 'https://wa.me/22507135164117',
                      icon: WhatsAppIcon,
                      bgColor: '#25d366',
                      label: 'WhatsApp',
                      value: '+225 07 13 51 64 17',
                    },
                    {
                      key: 'phone',
                      href: 'tel:+22507135164117',
                      icon: Phone,
                      bgColor: '#19a7a4',
                      label: 'Téléphone',
                      value: '+225 07 13 51 64 17',
                    },
                    {
                      key: 'instagram',
                      href: 'https://instagram.com/kysfactoryciv',
                      icon: InstagramIcon,
                      bgColor: '#e56969',
                      label: 'Instagram',
                      value: '@kysfactoryciv',
                    },
                    {
                      key: 'email',
                      href: 'mailto:contact@kysfactory.com',
                      icon: Mail,
                      bgColor: '#3b82f6',
                      label: 'Email',
                      value: 'contact@kysfactory.com',
                    },
                  ].map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <Link
                        key={method.key}
                        href={method.href}
                        target={
                          method.key === 'whatsapp' ||
                            method.key === 'instagram'
                            ? '_blank'
                            : undefined
                        }
                        rel={
                          method.key === 'whatsapp' ||
                            method.key === 'instagram'
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        className="flex items-center gap-4 rounded-lg p-6 hover:bg-muted/50 transition-colors group"
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-md text-white group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: method.bgColor }}
                        >
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground group-hover:text-foreground/90 transition-colors">
                            {tContact(`methods.${method.key}.title`)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {tContact(`methods.${method.key}.value`)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
