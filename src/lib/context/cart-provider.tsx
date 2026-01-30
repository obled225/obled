'use client';

import { ReactNode } from 'react';

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  // For now, we're using Zustand which doesn't need a React context provider
  // This component is here for future expansion if needed
  return <>{children}</>;
}
