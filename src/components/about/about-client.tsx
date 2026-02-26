'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Play } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon } from '@/components/ui/icons';
import { ContactForm } from './contact-form';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { PortableText } from '@/components/ui/portable-text';
import type { PortableTextBlock } from '@/lib/types/sanity';

export interface AboutSectionProps {
  title: string;
  subtitle?: string;
  body?: PortableTextBlock[];
  images: Array<{ url?: string; caption?: string }>;
}

interface AboutClientProps {
  heroVideoUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  sections?: AboutSectionProps[];
}

export function AboutClient({
  heroVideoUrl,
  heroTitle,
  heroSubtitle,
  heroDescription,
  sections = [],
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

  const isMobile = useIsMobile();

  // Fallbacks when Sanity has no content
  const displayHeroTitle = heroTitle ?? t('title');
  const displayHeroSubtitle = heroSubtitle ?? t('subtitle');
  const displayHeroDescription = heroDescription ?? t('description');

  return (
    <main className="grow">
      <section className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-16">
          {heroVideoUrl && (
            <div className="mb-6 rounded-md overflow-hidden max-w-2xl mx-auto shadow-lg relative">
              <video
                ref={videoRef}
                className="w-full h-[500px] md:h-[1000px] object-cover"
                controls={!isMobile}
                preload="metadata"
                playsInline
                aria-label="About O'bled video"
                onEnded={handleVideoEnd}
              >
                <source src={heroVideoUrl} type="video/mp4" />
                <source src={heroVideoUrl} type="video/webm" />
                <p>
                  Your browser does not support the video tag.{' '}
                  <a href={heroVideoUrl}>Download the video</a> instead.
                </p>
              </video>
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 md:hidden">
                  <button
                    onClick={handlePlayVideo}
                    className="bg-white/90 hover:bg-white rounded-md p-4 shadow-lg transition-all duration-200 transform hover:scale-105"
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
            {displayHeroTitle}
          </h1>
          {displayHeroSubtitle && (
            <p className="text-lg sm:text-xl text-foreground/80 mb-3">
              {displayHeroSubtitle}
            </p>
          )}
          {displayHeroDescription && (
            <p className="text-base sm:text-lg text-foreground/70 mb-8 max-w-2xl mx-auto whitespace-pre-line">
              {displayHeroDescription}
            </p>
          )}
        </div>

        <div className="prose prose-lg max-w-none text-foreground">
          {sections.map((section, index) => (
            <div key={`${section.title}-${index}`} className="mb-12">
              <h2 className="text-xl sm:text-2xl font-medium mb-4">
                {section.title}
              </h2>
              {section.subtitle && (
                <h3 className="text-lg sm:text-xl font-medium mb-6 text-foreground/80">
                  {section.subtitle}
                </h3>
              )}
              {section.body && section.body.length > 0 && (
                <div className="text-sm sm:text-lg leading-relaxed mb-6">
                  <PortableText content={section.body} />
                </div>
              )}
              {section.images?.length > 0 && (
                <div className="mt-6 space-y-4">
                  {section.images.map((img, imgIndex) => (
                    <div
                      key={`${section.title}-img-${imgIndex}`}
                      className="rounded-md overflow-hidden"
                    >
                      {img.url && (
                        <Image
                          src={img.url}
                          alt={img.caption || ''}
                          width={800}
                          height={600}
                          className="w-full h-auto object-cover"
                          unoptimized
                        />
                      )}
                      {img.caption && (
                        <p className="text-xs text-muted-foreground mt-2 italic text-right">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Contact */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-medium mb-6">
              {tContact('title')}
            </h2>
            <ContactForm />
            <p className="text-sm sm:text-lg leading-relaxed mb-6 text-foreground/80">
              {tContact('description')}
            </p>
            <div className="bg-background border border-border rounded-md overflow-hidden">
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      key: 'whatsapp',
                      href: 'https://wa.me/2250778034142',
                      icon: WhatsAppIcon,
                      bgColor: '#25d366',
                      label: 'WhatsApp',
                      value: '+225 0778034142',
                    },
                    {
                      key: 'phone',
                      href: 'tel:+2250778034142',
                      icon: Phone,
                      bgColor: '#19a7a4',
                      label: 'Téléphone',
                      value: '+225 0778034142',
                    },
                    {
                      key: 'instagram',
                      href: 'https://instagram.com/obled225',
                      icon: InstagramIcon,
                      bgColor: '#E4405F',
                      label: 'Instagram',
                      value: '@obled225',
                    },
                    {
                      key: 'email',
                      href: 'mailto:contact@obled225.com',
                      icon: Mail,
                      bgColor: '#3b82f6',
                      label: 'Email',
                      value: 'contact@obled225.com',
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
                        className="flex items-center gap-2 rounded-md p-2.5 hover:bg-muted/50 transition-colors group"
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
