import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
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
      name: 'basePrice',
      title: 'Base Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'originalPrice',
      title: 'Original Price',
      type: 'number',
      description: 'Original price before discount (optional)',
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'XOF',
      options: {
        list: [
          {title: 'West African CFA Franc (XOF)', value: 'XOF'},
          {title: 'US Dollar (USD)', value: 'USD'},
          {title: 'Euro (EUR)', value: 'EUR'},
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'text'}],
      description: 'Product description (can add multiple paragraphs)',
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
      name: 'variants',
      title: 'Product Variants',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Variant Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'priceModifier',
              title: 'Price Modifier',
              type: 'number',
              description: 'Additional cost for this variant (can be negative)',
              initialValue: 0,
            },
            {
              name: 'inventory',
              title: 'Inventory',
              type: 'number',
              initialValue: 0,
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'sku',
              title: 'SKU',
              type: 'string',
            },
            {
              name: 'options',
              title: 'Options',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'name',
                      title: 'Option Name',
                      type: 'string',
                      description: 'e.g., Size, Color, Taille, Couleur',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'value',
                      title: 'Option Value',
                      type: 'string',
                      description: 'e.g., Large, Red, L, Rouge',
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
              options: 'options',
            },
            prepare({title, options}) {
              const optionStr = options
                ?.map((opt: {name: string; value: string}) => `${opt.name}: ${opt.value}`)
                .join(', ')
              return {
                title: title || 'Untitled Variant',
                subtitle: optionStr || 'No options',
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
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
      fields: [
        {
          name: 'length',
          title: 'Length (cm)',
          type: 'number',
        },
        {
          name: 'width',
          title: 'Width (cm)',
          type: 'number',
        },
        {
          name: 'height',
          title: 'Height (cm)',
          type: 'number',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
      price: 'basePrice',
      currency: 'currency',
      inStock: 'inStock',
    },
    prepare({title, media, price, currency, inStock}) {
      return {
        title: title || 'Untitled Product',
        subtitle: `${currency || 'XOF'} ${price || 0}${inStock ? '' : ' (Out of Stock)'}`,
        media,
      }
    },
  },
})
