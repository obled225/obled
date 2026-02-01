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
      name: 'isBusinessProduct',
      title: 'Is this a business offer product?',
      type: 'boolean',
      description: 'Business products appear on /business page, regular products appear on /shop',
      initialValue: false,
    }),
    defineField({
      name: 'prices',
      title: 'Prices',
      type: 'array',
      description: 'Product prices in different currencies with lomi. price IDs',
      hidden: ({document}) => Boolean(document?.isBusinessProduct),
      initialValue: () => [
        {
          currency: 'XOF',
          basePrice: 0,
        },
      ],
      validation: (Rule) => Rule.custom((value, context) => {
        const isBusiness = (context.document as any)?.isBusinessProduct;
        if (isBusiness) {
          return true; // Not required for business products
        }
        if (!value || value.length === 0) {
          return 'At least one price is required';
        }
        return true;
      }),
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
              name: 'originalPrice',
              title: 'Original price',
              type: 'number',
              options: {
                controls: false,
              },
              description: 'The original price before discount. This number should be BIGGER than the base price.',
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'basePrice',
              title: 'Base price (optional)',
              type: 'number',
              options: {
                controls: false,
              },
              description: 'The current/discounted selling price. This is the price customers pay now.',
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: 'lomiPriceId',
              title: 'lomi. price ID',
              type: 'string',
              description: 'The price ID from lomi. payment processor for this currency (optional)',
              validation: (Rule) => 
                Rule.custom((value: string | undefined) => {
                  // If no value provided, it's valid (optional field)
                  if (!value || value.trim() === '') return true;
                  
                  // If value provided, validate UUID format
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                  if (!uuidRegex.test(value)) {
                    return 'lomi. price ID must be a valid UUID format';
                  }
                  
                  return true;
                }),
            },
          ],
          preview: {
            select: {
              currency: 'currency',
              basePrice: 'basePrice',
              originalPrice: 'originalPrice',
            },
            prepare({currency, basePrice, originalPrice}) {
              const priceDisplay = originalPrice && originalPrice > basePrice
                ? `${originalPrice} → ${basePrice}`
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
      options: {
        layout: 'grid',
      },
      validation: (Rule) => Rule.min(1).error('At least one image is required'),
    }),
    defineField({
      name: 'inStock',
      title: 'In stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'colors',
      title: 'Colors',
      type: 'array',
      description: 'Available colors for this product',
      initialValue: () => [
        {name: 'Noir', available: true},
        {name: 'Blanc', available: true},
      ],
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Color name',
              type: 'string',
              description: 'The color name automatically determines the color display. Use CSS color names (e.g., black, white, red, blue, noir, blanc) or "mix" for a half-white, half-black display. French and English color names are supported. Examples: noir, blanc, black, white, red, blue, mix, etc.',
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
              available: 'available',
            },
            prepare({name, available}) {
              return {
                title: name || 'Unnamed Color',
                subtitle: available ? 'Available' : 'Unavailable',
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'sizes',
      title: 'Product sizes',
      type: 'array',
      description: 'Select sizes for this product. Mark as available if in stock, or uncheck to mark as out of stock (rupture). Sizes not listed are not available.',
      initialValue: () => [
        {name: 'S', available: true},
        {name: 'M', available: true},
        {name: 'L', available: true},
        {name: 'XL', available: true},
      ],
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Size name',
              type: 'string',
              options: {
                list: [
                  {title: 'XXS', value: 'XXS'},
                  {title: 'XS', value: 'XS'},
                  {title: 'S', value: 'S'},
                  {title: 'M', value: 'M'},
                  {title: 'L', value: 'L'},
                  {title: 'XL', value: 'XL'},
                  {title: 'XXL', value: 'XXL'},
                  {title: '2XL', value: '2XL'},
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'available',
              title: 'Available (in stock)',
              type: 'boolean',
              description: 'Check if this size is in stock. Uncheck to mark as out of stock (rupture de stock) - it will appear with a vertical slash.',
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
                subtitle: available ? 'In stock' : 'Out of stock (rupture)',
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'businessPacks',
      title: 'Business packs',
      type: 'array',
      description: 'Pack sizes and pricing for business offers. Each pack can have prices in different currencies.',
      hidden: ({document}) => !Boolean(document?.isBusinessProduct),
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
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'e.g., Pack 5',
            },
            {
              name: 'prices',
              title: 'Pack prices by currency',
              type: 'array',
              description: 'Prices for this pack in different currencies',
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
                      name: 'originalPrice',
                      title: 'Original price',
                      type: 'number',
                      options: {
                        controls: false,
                      },
                      description: 'The original price before discount. This number should be BIGGER than the base price.',
                      validation: (Rule) => Rule.min(0),
                    },
                    {
                      name: 'basePrice',
                      title: 'Base price (optional)',
                      type: 'number',
                      options: {
                        controls: false,
                      },
                      description: 'The current/discounted selling price for the pack.',
                      validation: (Rule) => Rule.required().min(0),
                    },
                    {
                      name: 'lomiPriceId',
                      title: 'lomi. price ID',
                      type: 'string',
                      description: 'The price ID from lomi. for this pack in this currency (optional)',
                      validation: (Rule) => 
                        Rule.custom((value: string | undefined) => {
                          // If no value provided, it's valid (optional field)
                          if (!value || value.trim() === '') return true;
                          
                          // If value provided, validate UUID format
                          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                          if (!uuidRegex.test(value)) {
                            return 'lomi. price ID must be a valid UUID format';
                          }
                          
                          return true;
                        }),
                    },
                  ],
                  preview: {
                    select: {
                      currency: 'currency',
                      basePrice: 'basePrice',
                      originalPrice: 'originalPrice',
                    },
                    prepare({currency, basePrice, originalPrice}) {
                      const priceDisplay = originalPrice && originalPrice > basePrice
                        ? `${originalPrice} → ${basePrice}`
                        : `${basePrice}`;
                      return {
                        title: `${currency}: ${priceDisplay}`,
                      };
                    },
                  },
                },
              ],
            },
          ],
          preview: {
            select: {
              quantity: 'quantity',
              label: 'label',
              prices: 'prices',
            },
            prepare({quantity, label, prices}) {
              const priceDisplay = prices && prices.length > 0
                ? `${prices[0].currency} ${prices[0].basePrice}${prices.length > 1 ? ` (+${prices.length - 1} more)` : ''}`
                : 'No prices set';
              return {
                title: label || `Pack of ${quantity}`,
                subtitle: priceDisplay,
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
      name: 'variant',
      title: 'Variant Product',
      type: 'reference',
      to: [{type: 'products'}],
      description: 'Link to the main variant of this product (e.g., if this is short sleeves, link to the long sleeves version, or vice versa). Use for products that are essentially the same but with different attributes.',
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      description: 'Link to other related products (similar products, complementary items, etc.). These will appear in a "You might also like" section.',
      of: [
        {
          type: 'reference',
          to: [{type: 'products'}],
        },
      ],
    }),
    defineField({
      name: 'businessPackProduct',
      title: 'Business pack product',
      type: 'reference',
      to: [{type: 'products'}],
      description: 'Link to the business pack version of this product (e.g., if this is a single blank t-shirt, link to the pack of blank t-shirts). Only link to products marked as business offers.',
      hidden: ({document}) => Boolean(document?.isBusinessProduct),
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
      businessPacks: 'businessPacks',
      isBusinessProduct: 'isBusinessProduct',
      inStock: 'inStock',
    },
    prepare({title, media, prices, businessPacks, isBusinessProduct, inStock}) {
      let priceDisplay = 'No price';
      
      if (isBusinessProduct && businessPacks && businessPacks.length > 0) {
        // For business products, get price from first pack's first price
        const firstPack = businessPacks[0];
        const firstPackPrice = firstPack?.prices?.[0];
        if (firstPackPrice) {
          priceDisplay = `${firstPackPrice.currency || 'XOF'} ${firstPackPrice.basePrice || 0}`;
        }
      } else if (prices && prices.length > 0) {
        // For regular products, get price from prices array
        const firstPrice = prices[0];
        priceDisplay = `${firstPrice.currency || 'XOF'} ${firstPrice.basePrice || 0}`;
      }
      
      return {
        title: title || 'Untitled Product',
        subtitle: `${priceDisplay}${inStock ? '' : ' (Out of Stock)'}`,
        media,
      };
    },
  },
})
