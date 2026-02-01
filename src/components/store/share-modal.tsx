'use client';

import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { WhatsAppIcon, InstagramIcon } from '@/components/ui/icons';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { cn } from '@/lib/actions/utils';

interface ShareContentProps {
  url: string;
  title: string;
  onClose?: () => void;
}

interface ShareModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareModalWrapper({
  isOpen,
  onClose,
  url,
  title,
}: ShareModalWrapperProps) {
  // Always call hooks unconditionally at the top - this ensures consistent hook order
  const isMobile = useIsMobile();
  const t = useTranslations('products');

  // Use Sheet for both mobile and desktop, but with different sides and styling
  // This ensures consistent hook order across renders
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        floating={!isMobile}
        hideCloseButton={isMobile}
        className={cn(
          'flex flex-col overflow-hidden p-0',
          isMobile ? 'w-full max-h-[90vh]' : 'w-full sm:max-w-xl max-h-[90vh]'
        )}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg sm:text-xl font-bold tracking-wider">
            {t('share.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <ShareContent url={url} title={title} onClose={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
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
      {/* Title is now handled by SheetHeader on mobile, so hide it here on mobile */}
      <div className="hidden md:flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-wider">
          {t('share.title')}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded touch-target"
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
