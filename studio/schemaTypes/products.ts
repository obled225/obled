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
      name: 'lomiProductId',
      title: 'lomi. Product ID',
      type: 'string',
      description: 'Optional: The product ID from lomi. payment processor',
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
              description: 'Image to show when this color is selected',
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
      title: 'Available Sizes',
      type: 'object',
      description: 'Check the sizes available for this product',
      options: {
        columns: 2,
      },
      fields: [
        {
          name: 'xxs',
          title: 'XXS',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'xs',
          title: 'XS',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 's',
          title: 'S',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'm',
          title: 'M',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'l',
          title: 'L',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'xl',
          title: 'XL',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'xxl',
          title: 'XXL',
          type: 'boolean',
          initialValue: false,
        },
      ],
    }),
    defineField({
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      description: 'Determines where this product appears: Business products go to /business, Normal and Collab products go to /shop',
      options: {
        list: [
          {title: 'Normal', value: 'normal'},
          {title: 'Collab', value: 'collab'},
          {title: 'Business (B2B)', value: 'business'},
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Product categories for filtering and organization (e.g., T-Shirts, Long Sleeves, etc.)',
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
      name: 'dimensions',
      title: 'Dimensions',
      type: 'object',
      description: 'Product dimensions and weight',
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
        {
          name: 'weight',
          title: 'Weight (kg)',
          type: 'number',
          description: 'Product weight in kilograms',
        },
      ],
    }),
    defineField({
      name: 'variant',
      title: 'Variant Product',
      type: 'reference',
      to: [{type: 'products'}],
      description: 'Link to a related product variant (e.g., if this is short sleeves, link to the long sleeves variant)',
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
