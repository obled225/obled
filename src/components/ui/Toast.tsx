'use client';

import { X } from 'lucide-react';
import { Toast as ToastType } from '@/lib/hooks/use-toast';
import { Button } from './button';

interface ToastProps extends ToastType {
  onRemove: (id: string) => void;
}

export function Toast({ id, title, description, type, onRemove }: ToastProps) {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`p-4 rounded-md border shadow-lg ${getToastStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          {description && <div className="text-sm mt-1">{description}</div>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(id)}
          className="ml-2 p-1 h-auto hover:bg-black hover:bg-opacity-10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
