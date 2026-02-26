import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'shippingAndTaxes',
  title: 'Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'showAboutInNav',
      title: 'Show About in navigation',
      type: 'boolean',
      description: 'When enabled, the About / Contact link appears in the header. When disabled, it is hidden.',
      initialValue: true,
    }),
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
          description: 'Cart subtotal amount needed for free shipping in F CFA (e.g., 100000 for 100,000 F CFA). When an order exceeds this amount, all shipping options become free.',
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
      initialValue: [
        {
          name: 'Standard',
          estimatedDays: {
            minDays: 5,
            maxDays: 7,
          },
          price: 2500,
          isActive: true,
        },
        {
          name: 'Express',
          estimatedDays: {
            minDays: 2,
            maxDays: 5,
          },
          price: 5000,
          isActive: true,
        },
        {
          name: 'International',
          estimatedDays: {
            minDays: 12,
            maxDays: 25,
          },
          price: 20000,
          isActive: true,
        },
      ],
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
              name: 'estimatedDays',
              title: 'Estimated Delivery Days',
              type: 'object',
              description: 'Delivery time range in days (e.g., min: 5, max: 7 for "5-7 business days")',
              fields: [
                {
                  name: 'minDays',
                  title: 'Minimum Days',
                  type: 'number',
                  description: 'Minimum delivery days (e.g., 5)',
                  validation: (Rule) => Rule.required().integer().min(1),
                },
                {
                  name: 'maxDays',
                  title: 'Maximum Days',
                  type: 'number',
                  description: 'Maximum delivery days (e.g., 7)',
                  validation: (Rule) =>
                    Rule.required()
                      .integer()
                      .min(1)
                      .custom((maxDays, context) => {
                        const minDays = (context.parent as {minDays?: number})?.minDays;
                        if (
                          typeof minDays === 'number' &&
                          minDays > 0 &&
                          typeof maxDays === 'number' &&
                          maxDays > 0 &&
                          maxDays < minDays
                        ) {
                          return 'Maximum days must be greater than or equal to minimum days';
                        }
                        return true;
                      }),
                },
              ],
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
          ],
          preview: {
            select: {
              title: 'name',
              price: 'price',
              isActive: 'isActive',
            },
            prepare({title, price, isActive}) {
              const priceDisplay = price !== undefined
                ? `${price} F CFA`
                : 'No price set';
              return {
                title: title || 'Untitled Shipping Option',
                subtitle: `${priceDisplay}${isActive ? '' : ' (Inactive)'}`,
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
          title: 'Tax rates',
          type: 'array',
          description: 'Configure up to 2 tax rates. Can be percentage-based or fixed amount. All rates are in F CFA - currency conversion is handled automatically.',
          validation: (Rule) => Rule.max(2).error('Maximum 2 tax rates allowed'),
          of: [
              {
                type: 'object',
                fields: [
                  {
                    name: 'name',
                    title: 'Tax name',
                    type: 'string',
                    description: 'Name of the tax (e.g., VAT, Sales Tax, Service Tax)',
                    validation: (Rule) => Rule.required(),
                  },
                  {
                    name: 'type',
                    title: 'Tax type',
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
                    name: 'name',
                    type: 'type',
                    rate: 'rate',
                  },
                  prepare({name, type, rate}) {
                    const displayRate =
                      type === 'percentage'
                        ? `${(rate * 100).toFixed(1)}%`
                        : `${rate} F CFA`;
                    return {
                      title: name || 'Untitled Tax',
                      subtitle: `${displayRate} • ${type === 'percentage' ? 'Percentage' : 'Fixed Amount'}`,
                    };
                  },
                },
            },
          ],
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
