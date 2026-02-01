import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'shippingAndTaxes',
  title: 'Shipping and Taxes',
  type: 'document',
  fields: [
    // Shipping Options Section
    defineField({
      name: 'shippingOptions',
      title: 'Shipping Options',
      type: 'array',
      description: 'Configure up to 3 shipping options',
      validation: (Rule) => Rule.max(3).error('Maximum 3 shipping options allowed'),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Shipping Option Name',
              type: 'string',
              description: 'e.g., Standard Shipping, Express Shipping',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'type',
              title: 'Shipping Type',
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
              name: 'prices',
              title: 'Prices',
              type: 'array',
              description: 'Shipping prices in different currencies (EUR, USD, XOF)',
              validation: (Rule) => Rule.min(1).error('At least one price is required'),
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'currency',
                      title: 'Currency',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'West African CFA Franc (XOF)', value: 'XOF'},
                          {title: 'US Dollar (USD)', value: 'USD'},
                          {title: 'Euro (EUR)', value: 'EUR'},
                        ],
                      },
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'price',
                      title: 'Price',
                      type: 'number',
                      options: {
                        controls: false,
                      },
                      description: 'Shipping cost in this currency',
                      validation: (Rule) => Rule.required().min(0),
                    },
                  ],
                  preview: {
                    select: {
                      currency: 'currency',
                      price: 'price',
                    },
                    prepare({currency, price}) {
                      return {
                        title: `${currency}: ${price}`,
                      };
                    },
                  },
                },
              ],
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
                  name: 'thresholds',
                  title: 'Thresholds by Currency',
                  type: 'array',
                  hidden: ({parent}) => !parent?.enabled,
                  of: [
                    {
                      type: 'object',
                      fields: [
                        {
                          name: 'currency',
                          title: 'Currency',
                          type: 'string',
                          options: {
                            list: [
                              {title: 'West African CFA Franc (XOF)', value: 'XOF'},
                              {title: 'US Dollar (USD)', value: 'USD'},
                              {title: 'Euro (EUR)', value: 'EUR'},
                            ],
                          },
                          validation: (Rule) => Rule.required(),
                        },
                        {
                          name: 'amount',
                          title: 'Threshold Amount',
                          type: 'number',
                          options: {
                            controls: false,
                          },
                          description: 'Cart subtotal amount needed for free shipping in this currency',
                          validation: (Rule) => Rule.required().min(0),
                        },
                      ],
                      preview: {
                        select: {
                          currency: 'currency',
                          amount: 'amount',
                        },
                        prepare({currency, amount}) {
                          return {
                            title: `${currency}: ${amount}`,
                          };
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'name',
              type: 'type',
              prices: 'prices',
              isActive: 'isActive',
            },
            prepare({title, type, prices, isActive}) {
              const priceDisplay = prices && prices.length > 0
                ? `${prices[0].currency} ${prices[0].price}${prices.length > 1 ? ` (+${prices.length - 1} more)` : ''}`
                : 'No prices set';
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
          title: 'Tax Rates by Currency',
          type: 'array',
          description: 'Configure up to 2 tax rates. Can be percentage-based or fixed amount.',
          validation: (Rule) => Rule.max(2).error('Maximum 2 tax rates allowed'),
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'currency',
                  title: 'Currency',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'West African CFA Franc (XOF)', value: 'XOF'},
                      {title: 'US Dollar (USD)', value: 'USD'},
                      {title: 'Euro (EUR)', value: 'EUR'},
                    ],
                  },
                  validation: (Rule) => Rule.required(),
                },
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
                  title: 'Tax Rate',
                  type: 'number',
                  options: {
                    controls: false,
                  },
                  description: 'For percentage: enter as decimal (e.g., 0.1 for 10%). For fixed: enter the amount.',
                  validation: (Rule) => Rule.required().min(0),
                },
              ],
              preview: {
                select: {
                  currency: 'currency',
                  type: 'type',
                  rate: 'rate',
                },
                prepare({currency, type, rate}) {
                  const displayRate =
                    type === 'percentage'
                      ? `${(rate * 100).toFixed(1)}%`
                      : `${rate}`;
                  return {
                    title: `${currency}: ${displayRate}`,
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
        title: 'Shipping and Taxes',
        subtitle: `${shippingCount} shipping option(s), ${taxCount} tax rate(s)${taxActive ? '' : ' (Tax inactive)'}`,
      };
    },
  },
})
