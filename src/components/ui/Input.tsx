import * as React from 'react';
import { cn } from '@/lib/actions/utils';
import { Label } from './label';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string | React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id: providedId, ...restProps }, ref) => {
    const generatedId = React.useId();
    const inputId = providedId ?? generatedId;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId}>
            {typeof label === 'string' ? label : label}
          </Label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...restProps}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
