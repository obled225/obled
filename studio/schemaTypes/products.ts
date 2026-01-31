import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'products',
  title: 'Products',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'prices',
      title: 'Prices',
      type: 'array',
      description: 'Product prices in different currencies with lomi. price IDs',
      validation: (Rule) => Rule.required().min(1).error('At least one price is required'),
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
              name: 'basePrice',
              title: 'Base Price',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: 'originalPrice',
              title: 'Original Price',
              type: 'number',
              description: 'Original price before discount (optional)',
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'lomiPriceId',
              title: 'lomi. Price ID',
              type: 'string',
              description: 'The price ID from lomi. payment processor for this currency',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              currency: 'currency',
              basePrice: 'basePrice',
              originalPrice: 'originalPrice',
            },
            prepare({currency, basePrice, originalPrice}) {
              const priceDisplay = originalPrice
                ? `${basePrice} (was ${originalPrice})`
                : `${basePrice}`;
              return {
                title: `${currency}: ${priceDisplay}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [],
          },
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Bullet', value: 'bullet'},
            {title: 'Number', value: 'number'},
          ],
        },
      ],
      description: 'Rich text product description with support for bullet points, headings, and formatting',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      validation: (Rule) => Rule.min(1).error('At least one image is required'),
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Stock Keeping Unit',
    }),
    defineField({
      name: 'colors',
      title: 'Colors',
      type: 'array',
      description: 'Available colors for this product',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Color Name',
              type: 'string',
              description: 'e.g., Red, Blue, Noir, Blanc',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'value',
              title: 'Color Value',
              type: 'string',
              description: 'Hex color code (e.g., #FF0000) or color identifier',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'image',
              title: 'Color Image',
              type: 'image',
              description: 'Optional image showing this color variant',
              options: {
                hotspot: true,
              },
            },
            {
              name: 'available',
              title: 'Available',
              type: 'boolean',
              description: 'Whether this color is currently available',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              name: 'name',
              value: 'value',
              available: 'available',
            },
            prepare({name, value, available}) {
              return {
                title: name || 'Unnamed Color',
                subtitle: `${value}${available ? '' : ' (Unavailable)'}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'sizes',
      title: 'Sizes',
      type: 'array',
      description: 'Available sizes for this product',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Size Name',
              type: 'string',
              description: 'e.g., XS, S, M, L, XL, XXL',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'available',
              title: 'Available',
              type: 'boolean',
              description: 'Whether this size is currently available',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              name: 'name',
              available: 'available',
            },
            prepare({name, available}) {
              return {
                title: name || 'Unnamed Size',
                subtitle: available ? 'Available' : 'Unavailable',
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'categories'}]}],
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
      description: 'Show this product in featured sections',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'weight',
      title: 'Weight (kg)',
      type: 'number',
      description: 'Product weight in kilograms',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'object',
      description: 'Product dimensions in centimeters',
      fields: [
        {
          name: 'length',
          title: 'Length (cm)',
          type: 'number',
          description: 'Length in centimeters',
        },
        {
          name: 'width',
          title: 'Width (cm)',
          type: 'number',
          description: 'Width in centimeters',
        },
        {
          name: 'height',
          title: 'Height (cm)',
          type: 'number',
          description: 'Height in centimeters',
        },
      ],
    }),
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      description: 'Product variants (combinations of options)',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Variant Title',
              type: 'string',
              description: 'Display name for this variant',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'priceModifier',
              title: 'Price Modifier',
              type: 'number',
              description: 'Additional price for this variant (can be negative)',
              initialValue: 0,
            },
            {
              name: 'inventory',
              title: 'Stock Quantity',
              type: 'number',
              description: 'Stock quantity for this specific variant',
              initialValue: 0,
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'sku',
              title: 'Variant SKU',
              type: 'string',
              description: 'Stock Keeping Unit for this specific variant',
            },
            {
              name: 'options',
              title: 'Options',
              type: 'array',
              description: 'Specific options that define this variant',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'name',
                      title: 'Option Name',
                      type: 'string',
                      description: 'e.g., Color, Size',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'value',
                      title: 'Option Value',
                      type: 'string',
                      description: 'e.g., Red, Large',
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'title',
              priceModifier: 'priceModifier',
              inventory: 'inventory',
            },
            prepare({title, priceModifier, inventory}) {
              return {
                title: title || 'Unnamed Variant',
                subtitle: `${inventory || 0} in stock${priceModifier ? ` (+$${priceModifier})` : ''}`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
      prices: 'prices',
      inStock: 'inStock',
    },
    prepare({title, media, prices, inStock}) {
      const firstPrice = prices?.[0];
      const priceDisplay = firstPrice
        ? `${firstPrice.currency || 'XOF'} ${firstPrice.basePrice || 0}`
        : 'No price';
      return {
        title: title || 'Untitled Product',
        subtitle: `${priceDisplay}${inStock ? '' : ' (Out of Stock)'}`,
        media,
      };
    },
  },
})
