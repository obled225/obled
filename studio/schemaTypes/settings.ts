import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'shippingAndTaxes',
  title: 'Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'globalFreeShippingThreshold',
      title: 'Free shipping threshold',
      type: 'object',
      description: 'When enabled, all shipping options become free when cart subtotal reaches this threshold. This applies globally to all shipping options.',
      fields: [
        {
          name: 'enabled',
          title: 'Enable Global Free Shipping',
          type: 'boolean',
          initialValue: false,
          description: 'Enable free shipping for all orders above the threshold amount',
        },
        {
          name: 'amount',
          title: 'Threshold amount',
          type: 'number',
          hidden: ({parent}) => !parent?.enabled,
          options: {
            controls: false,
          },
          description: 'Cart subtotal amount needed for free shipping in F CFA (e.g., 100000 for 100,000 XOF). When an order exceeds this amount, all shipping options become free.',
          validation: (Rule) => Rule.required().min(0),
        },
      ],
    }),

    // Shipping Options Section
    defineField({
      name: 'shippingOptions',
      title: 'Shipping options',
      type: 'array',
      description: 'Configure up to 3 shipping options',
      validation: (Rule) => Rule.max(3).error('Maximum 3 shipping options allowed'),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Shipping option name',
              type: 'string',
              description: 'e.g., Standard, Express',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'type',
              title: 'Shipping type',
              type: 'string',
              options: {
                list: [
                  {title: 'Standard', value: 'standard'},
                  {title: 'Express', value: 'express'},
                  {title: 'Overnight', value: 'overnight'},
                  {title: 'International', value: 'international'},
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              description: 'Brief description of the shipping option (e.g., "Delivered in 5-7 business days")',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'estimatedDays',
              title: 'Estimated Delivery Days',
              type: 'string',
              description: 'e.g., "5-7 business days" or "2-3 business days"',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'price',
              title: 'Price',
              type: 'number',
              options: {
                controls: false,
              },
              description: 'Shipping cost in F CFA (West African CFA Franc).',
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: 'isActive',
              title: 'Active',
              type: 'boolean',
              description: 'Whether this shipping option is currently available',
              initialValue: true,
            },
            {
              name: 'sortOrder',
              title: 'Sort Order',
              type: 'number',
              description: 'Lower numbers appear first. Used to control the display order of shipping options.',
              initialValue: 0,
              validation: (Rule) => Rule.integer().min(0),
            },
            {
              name: 'freeShippingThreshold',
              title: 'Free Shipping Threshold (Optional)',
              type: 'object',
              description: 'If set, this shipping option becomes free when cart subtotal reaches the threshold',
              fields: [
                {
                  name: 'enabled',
                  title: 'Enable Free Shipping Threshold',
                  type: 'boolean',
                  initialValue: false,
                },
                {
                  name: 'amount',
                  title: 'Threshold amount',
                  type: 'number',
                  hidden: ({parent}) => !parent?.enabled,
                  options: {
                    controls: false,
                  },
                  description: 'Cart subtotal amount needed for free shipping in F CFA.',
                  validation: (Rule) => Rule.required().min(0),
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'name',
              type: 'type',
              price: 'price',
              isActive: 'isActive',
            },
            prepare({title, type, price, isActive}) {
              const priceDisplay = price !== undefined
                ? `${price} F CFA`
                : 'No price set';
              return {
                title: title || 'Untitled Shipping Option',
                subtitle: `${type || 'standard'} • ${priceDisplay}${isActive ? '' : ' (Inactive)'}`,
              };
            },
          },
        },
      ],
    }),

    // Tax Settings Section
    defineField({
      name: 'taxSettings',
      title: 'Tax Settings',
      type: 'object',
      fields: [
        {
          name: 'isActive',
          title: 'Active',
          type: 'boolean',
          description: 'Whether tax is currently enabled',
          initialValue: true,
        },
        {
          name: 'taxRates',
          title: 'Tax Rates',
          type: 'array',
          description: 'Configure up to 2 tax rates. Can be percentage-based or fixed amount. All rates are in F CFA - currency conversion is handled automatically.',
          validation: (Rule) => Rule.max(2).error('Maximum 2 tax rates allowed'),
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'type',
                  title: 'Tax Type',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Percentage', value: 'percentage'},
                      {title: 'Fixed Amount', value: 'fixed'},
                    ],
                  },
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'rate',
                  title: 'Tax rate',
                  type: 'number',
                  options: {
                    controls: false,
                  },
                  description: 'For percentage: enter as decimal (e.g., 0.1 for 10%). For fixed: enter the amount in F CFA.',
                  validation: (Rule) => Rule.required().min(0),
                },
              ],
              preview: {
                select: {
                  type: 'type',
                  rate: 'rate',
                },
                prepare({type, rate}) {
                  const displayRate =
                    type === 'percentage'
                      ? `${(rate * 100).toFixed(1)}%`
                      : `${rate} F CFA`;
                  return {
                    title: displayRate,
                    subtitle: type === 'percentage' ? 'Percentage' : 'Fixed Amount',
                  };
                },
              },
            },
          ],
        },
        {
          name: 'displayMessage',
          title: 'Display Message (Optional)',
          type: 'string',
          description: 'Custom message to display when tax is 0 or included (e.g., "Taxes included in price")',
          initialValue: 'Taxes included in price',
        },
      ],
    }),
  ],
  preview: {
    select: {
      shippingOptions: 'shippingOptions',
      taxSettings: 'taxSettings',
    },
    prepare({shippingOptions, taxSettings}) {
      const shippingCount = shippingOptions?.length || 0;
      const taxCount = taxSettings?.taxRates?.length || 0;
      const taxActive = taxSettings?.isActive !== false;
      return {
        title: 'Settings',
        subtitle: `${shippingCount} shipping option(s), ${taxCount} tax rate(s)${taxActive ? '' : ' (Tax inactive)'}`,
      };
    },
  },
})
