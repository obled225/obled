'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Phone, Mail, Play } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon } from '@/components/ui/icons';
import { ContactForm } from './contact-form';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

interface SectionImage {
  url?: string;
  caption?: string;
  position: string;
}

interface AboutClientProps {
  heroVideoUrl?: string;
  sectionImages?: SectionImage[];
}

export function AboutClient({
  heroVideoUrl,
  sectionImages = [],
}: AboutClientProps) {
  const t = useTranslations('about');
  const tContact = useTranslations('contact');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
  };

  // Check if device is mobile
  const isMobile = useIsMobile();

  // Helper function to render section with optional images
  const renderSectionWithImages = (
    sectionKey: string,
    content: React.ReactNode
  ) => {
    const sectionImagesForKey = sectionImages.filter(
      (img) => img.position === sectionKey
    );

    return (
      <div className="mb-12">
        {content}
        {sectionImagesForKey.length > 0 && (
          <div className="mt-6 space-y-4">
            {sectionImagesForKey.map((image, index) => (
              <div
                key={`${sectionKey}-${index}`}
                className="rounded-lg overflow-hidden"
              >
                {image.url && (
                  <Image
                    src={image.url}
                    alt={image.caption || ''}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                )}
                {image.caption && (
                  <p className="text-xs text-muted-foreground mt-2 italic text-right">
                    {image.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="grow">
      <section className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {heroVideoUrl && (
            <div className="mb-6 rounded-lg overflow-hidden max-w-2xl mx-auto shadow-lg relative">
              <video
                ref={videoRef}
                className="w-full h-[500px] md:h-[1000px] object-cover"
                controls={!isMobile}
                preload="metadata"
                playsInline
                aria-label="About KYS Factory video"
                onEnded={handleVideoEnd}
              >
                <source src={heroVideoUrl} type="video/mp4" />
                <source src={heroVideoUrl} type="video/webm" />
                <p>
                  Your browser does not support the video tag.{' '}
                  <a href={heroVideoUrl}>Download the video</a> instead.
                </p>
              </video>

              {/* Mobile Play Button Overlay */}
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 md:hidden">
                  <button
                    onClick={handlePlayVideo}
                    className="bg-white/90 hover:bg-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105"
                    aria-label="Play video"
                  >
                    <Play
                      className="w-8 h-8 text-black ml-1"
                      fill="currentColor"
                    />
                  </button>
                </div>
              )}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-medium text-foreground mt-8 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-foreground/80 mb-3">
            {t('subtitle')}
          </p>
          <p className="text-base sm:text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-foreground">
          {/* Who We Are Section */}
          {renderSectionWithImages(
            'whoWeAre',
            <>
              <h2 className="text-xl sm:text-2xl font-medium mb-4">
                {t('whoWeAre.title')}
              </h2>
              <h3 className="text-lg sm:text-xl font-medium mb-6 text-foreground/80">
                {t('whoWeAre.subtitle')}
              </h3>
              <p className="text-sm sm:text-lg leading-relaxed">
                {t('whoWeAre.content')}
              </p>
            </>
          )}

          {/* B2B Solutions Section */}
          {renderSectionWithImages(
            'b2b',
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl sm:text-2xl font-medium mb-4">
                  {t('b2b.title')}
                </h2>
                <h3 className="text-lg sm:text-xl font-medium mb-6 text-foreground/80">
                  {t('b2b.subtitle')}
                </h3>
                <p className="text-sm sm:text-lg leading-relaxed mb-6">
                  {t('b2b.content')}
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  {t.raw('b2b.targets').map((target: string, index: number) => (
                    <li
                      key={index}
                      className="leading-relaxed text-sm sm:text-lg"
                    >
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
          )}

          {/* Production Section */}
          {renderSectionWithImages(
            'production',
            <>
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
                    <li
                      key={index}
                      className="leading-relaxed text-sm sm:text-lg"
                    >
                      {project}
                    </li>
                  ))}
              </ul>
            </>
          )}

          {/* Responsiveness Section */}
          {renderSectionWithImages(
            'responsiveness',
            <>
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
                    <li
                      key={index}
                      className="leading-relaxed text-sm sm:text-lg"
                    >
                      {feature}
                    </li>
                  ))}
              </ul>
              <p className="text-sm sm:text-lg leading-relaxed font-medium">
                {t('responsiveness.urgency')}
              </p>
            </>
          )}

          {/* Support Section */}
          {renderSectionWithImages(
            'support',
            <>
              <h2 className="text-xl sm:text-2xl font-medium mb-6">
                {t('support.title')}
              </h2>
              <p className="text-sm sm:text-lg leading-relaxed mb-6">
                {t('support.intro')}
              </p>
              <p className="text-sm sm:text-lg leading-relaxed mb-6">
                {t('support.content')}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                {t
                  .raw('support.services')
                  .map((service: string, index: number) => (
                    <li
                      key={index}
                      className="leading-relaxed text-sm sm:text-lg"
                    >
                      {service}
                    </li>
                  ))}
              </ul>
            </>
          )}

          {/* Commitment Section */}
          {renderSectionWithImages(
            'commitment',
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl sm:text-2xl font-medium mb-6">
                  {t('commitment.title')}
                </h2>
                <p className="text-sm sm:text-lg leading-relaxed">
                  {t('commitment.content')}
                </p>
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-medium mb-6">
              {tContact('title')}
            </h2>

            {/* Contact Form */}
            <ContactForm />

            <p className="text-sm sm:text-lg leading-relaxed mb-6 text-foreground/80">
              {tContact('description')}
            </p>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
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
                      bgColor: '#E4405F',
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
                        className="flex items-center gap-2 rounded-lg p-2.5 hover:bg-muted/50 transition-colors group"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-md text-white group-hover:scale-110 transition-transform shrink-0"
                          style={{ backgroundColor: method.bgColor }}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm text-foreground group-hover:text-foreground/90 transition-colors leading-tight">
                            {tContact(`methods.${method.key}.title`)}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-tight">
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
