import * as AccordionPrimitive from '@radix-ui/react-accordion';
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/actions/utils';

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string;
  subtitle?: string;
  description?: string;
  required?: boolean;
  tooltip?: string;
  forceMountContent?: true;
  headingSize?: 'small' | 'medium' | 'large';
  customTrigger?: React.ReactNode;
  complete?: boolean;
  active?: boolean;
  triggerable?: boolean;
  children: React.ReactNode;
};

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>);

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>;
} = ({ children, ...props }) => {
  return (
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  );
};

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  customTrigger = undefined,
  forceMountContent = undefined,
  ...props
}) => {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={cn('border border-gray-200 group', 'py-3', className)}
    >
      <AccordionPrimitive.Header className="px-4">
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-900 font-medium">{title}</span>
            </div>
            <AccordionPrimitive.Trigger className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-md transition-colors">
              {customTrigger || (
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              )}
            </AccordionPrimitive.Trigger>
          </div>
          {subtitle && (
            <span className="mt-1 text-sm text-gray-600">{subtitle}</span>
          )}
        </div>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={cn(
          'overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down px-4'
        )}
      >
        <div className="pb-4 pt-2">
          {description && <p className="mb-4 text-gray-700">{description}</p>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
};

Accordion.Item = Item;

export default Accordion;
