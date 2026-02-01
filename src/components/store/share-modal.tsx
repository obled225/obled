'use client';

import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { WhatsAppIcon, InstagramIcon } from '@/components/ui/icons';
import { useToast } from '@/lib/hooks/use-toast';

interface ShareContentProps {
  url: string;
  title: string;
  onClose?: () => void;
}

export function ShareContent({ url, title, onClose }: ShareContentProps) {
  const t = useTranslations('products');
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
    onClose?.();
  };

  const handleShareInstagram = () => {
    // Open Instagram for manual sharing
    window.open('https://www.instagram.com/', '_blank');
    onClose?.();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success(t('share.copySuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-wider">
          {t('share.title')}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-100 rounded touch-target"
            aria-label="Close share"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* URL Display */}
      <div className="pb-4 border-b border-gray-200">
        <div className="relative bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-900 break-all pr-8">{url}</p>
          <button
            onClick={handleCopyUrl}
            className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors"
            aria-label={t('share.copyButton')}
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleShareWhatsApp}
          className="flex-1 h-12 flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          aria-label={t('share.whatsappButton')}
        >
          <WhatsAppIcon className="w-5 h-5" fill="currentColor" />
          {t('share.whatsappButton')}
        </button>
        <button
          onClick={handleShareInstagram}
          className="flex-1 h-12 flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          aria-label={t('share.instagramButton')}
        >
          <InstagramIcon className="w-5 h-5" />
          {t('share.instagramButton')}
        </button>
      </div>
    </div>
  );
}
