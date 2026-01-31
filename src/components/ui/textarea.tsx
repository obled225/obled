import * as React from 'react';
import { cn } from '@/lib/actions/utils';
import { Label } from './label';

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id: providedId, ...restProps }, ref) => {
    const generatedId = React.useId();
    const textareaId = providedId ?? generatedId;

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={textareaId}>{label}</Label>}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...restProps}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
