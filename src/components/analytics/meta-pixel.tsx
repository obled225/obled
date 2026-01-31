'use client';

import { useEffect } from 'react';
import type { FbqCommand, FbqFunction } from '@/lib/types';

type FbqArgs = [FbqCommand, ...unknown[]];

interface ExtendedFbqFunction extends FbqFunction {
  callMethod?: (...args: FbqArgs) => void;
  queue?: unknown[][];
  push: ExtendedFbqFunction;
  loaded?: boolean;
  version?: string;
}

export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    if (!pixelId) {
      // Silently return if Meta Pixel ID is not configured
      return;
    }

    // Initialize Facebook Pixel
    if (typeof window !== 'undefined' && !window.fbq) {
      // Load Facebook Pixel script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);

      // Initialize fbq
      const fbqFunction: ExtendedFbqFunction = function (
        command: FbqCommand,
        ...args: unknown[]
      ) {
        if (fbqFunction.callMethod) {
          fbqFunction.callMethod(command, ...args);
        } else {
          fbqFunction.queue?.push([command, ...args]);
        }
      } as ExtendedFbqFunction;

      fbqFunction.push = fbqFunction;
      fbqFunction.loaded = true;
      fbqFunction.version = '2.0';
      fbqFunction.queue = [];

      window.fbq = fbqFunction;

      // Initialize pixel
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }
  }, [pixelId]);

  return null;
}
