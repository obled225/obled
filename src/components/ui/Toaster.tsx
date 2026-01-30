'use client';

import { useToast } from '@/lib/hooks/use-toast';
import { Toast } from '@/components/ui/toast';

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
