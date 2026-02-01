import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'products',
  title: 'Products',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product name',
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
              title: 'Base price',
              type: 'number',
              options: {
                controls: false,
              },
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: 'originalPrice',
              title: 'Original price',
              type: 'number',
              options: {
                controls: false,
              },
              description: 'Original price before discount (optional)',
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'lomiPriceId',
              title: 'lomi. price ID',
              type: 'string',
              description: 'The price ID from lomi. payment processor for this currency (optional)',
              validation: (Rule) => 
      Rule.regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
          name: 'UUID', // Error message is "Does not match UUID pattern"
          invert: false, // Don't allow non-matches
        })
        .error('lomi. price ID must be a valid UUID'),
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
      name: 'isBusinessProduct',
      title: 'Is this a business offer product?',
      type: 'boolean',
      description: 'Business products appear on /business page, regular products appear on /shop',
      initialValue: false,
    }),
    defineField({
      name: 'inStock',
      title: 'In stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'stockQuantity',
      title: 'Stock quantity',
      type: 'number',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Stock Keeping Unit (SKU) is a unique identifier for a product',
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
              title: 'Color name',
              type: 'string',
              description: 'e.g., Red, Blue, Noir, Blanc',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'value',
              title: 'Color value',
              type: 'string',
              description: 'Hex color code (e.g., #FF0000) or color identifier',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'image',
              title: 'Color image',
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
      title: 'Available sizes',
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
        {
          name: 'twoXl',
          title: '2XL',
          type: 'boolean',
          initialValue: false,
        }
      ],
    }),
    defineField({
      name: 'businessPacks',
      title: 'Business packs',
      type: 'array',
      description: 'Pack sizes and pricing for business offers',
      hidden: ({document}) => !document?.isBusinessProduct,
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (Rule) => Rule.required().min(2),
            },
            {
              name: 'price',
              title: 'Price',
              type: 'number',
              options: {
                controls: false,
              },
              description: 'Total price for the pack (leave empty to use base price * quantity)',
            },
            {
              name: 'lomiPriceId',
              title: 'lomi. price ID',
              type: 'string',
              description: 'Optional: Specific price ID for this pack from lomi.',
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'e.g., Pack 5',
            },
          ],
          preview: {
            select: {
              quantity: 'quantity',
              price: 'price',
              label: 'label',
            },
            prepare({quantity, price, label}) {
              return {
                title: label || `Pack of ${quantity}`,
                subtitle: price ? `${price}` : 'Base price x Quantity',
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
      description: 'Product categories for filtering and organization (e.g., T-Shirts, Long Sleeves, etc.)',
      of: [{type: 'reference', to: [{type: 'categories'}]}],
    }),
    defineField({
      name: 'featured',
      title: 'Featured product',
      type: 'boolean',
      initialValue: false,
      description: 'Sorting feature: Featured products appear first when "Featured" sort option is selected',
    }),
    defineField({
      name: 'bestSeller',
      title: 'Best seller',
      type: 'boolean',
      initialValue: false,
      description: 'Sorting feature: Best seller products appear first when "Best sellers" sort option is selected',
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
      title: 'Variant product',
      type: 'reference',
      to: [{type: 'products'}],
      description: 'Link to a related product variant (e.g., if this is short sleeves, link to the long sleeves variant)',
    }),
    defineField({
      name: 'businessPackProduct',
      title: 'Business pack product',
      type: 'reference',
      to: [{type: 'products'}],
      description: 'Link to the business pack version of this product (e.g., if this is a single blank t-shirt, link to the pack of blank t-shirts). Only link to products marked as business offers.',
      options: {
        filter: 'isBusinessProduct == true',
      },
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
