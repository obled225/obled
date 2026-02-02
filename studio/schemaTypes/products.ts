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
      title: 'Is this a business product?',
      type: 'boolean',
      description: 'Business products appear on /business page, regular products appear on /shop',
      initialValue: false,
    }),
    defineField({
      name: 'currentPrice',
      title: 'Current price',
      type: 'number',
      description: 'Current selling price in F CFA (West African CFA Franc). This is the price customers pay. Currency conversion is handled automatically.',
      hidden: ({document}) => Boolean(document?.isBusinessProduct),
      validation: (Rule) => Rule.custom((value, context) => {
        const isBusiness = (context.document as { isBusinessProduct?: boolean })?.isBusinessProduct;
        if (isBusiness) {
          return true; // Not required for business products
        }
        if (value === undefined || value === null) {
          return 'Current price is required';
        }
        if (value < 0) {
          return 'Current price must be greater than or equal to 0';
        }
        return true;
      }),
    }),
    defineField({
      name: 'basePrice',
      title: 'Base price',
      type: 'number',
      description: 'Base price in F CFA (shown with strikethrough). This number should be BIGGER than the current price.',
      hidden: ({document}) => Boolean(document?.isBusinessProduct),
      validation: (Rule) => Rule.min(0),
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
              name: 'currentPrice',
              title: 'Current pack price',
              type: 'number',
              description: 'Current selling price for this pack in F CFA. This is the price customers pay. Currency conversion is handled automatically.',
              validation: (Rule) => Rule.required().min(0),
              options: {
                controls: false,
              },
            },
            {
              name: 'basePrice',
              title: 'Base pack price',
              type: 'number',
              description: 'Base price for this pack in F CFA (shown with strikethrough). This number should be BIGGER than the current price.',
              validation: (Rule) => Rule.min(0),
              options: {
                controls: false,
              },
            },
          ],
          preview: {
            select: {
              quantity: 'quantity',
              label: 'label',
              currentPrice: 'currentPrice',
              basePrice: 'basePrice',
            },
            prepare({quantity, label, currentPrice, basePrice}) {
              const priceDisplay = basePrice && basePrice > currentPrice
                ? `${basePrice} → ${currentPrice} F CFA`
                : currentPrice !== undefined
                ? `${currentPrice} F CFA`
                : 'No price set';
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
      name: 'grammage',
      title: 'Grammage',
      type: 'string',
      description: 'Fabric weight (e.g., 180 g/m², 200 g/m²) for filtering purposes.',
      options: {
        list: [
          {title: '160 g/m²', value: '160'},
          { title: '180 g/m²', value: '180' },
          { title: '190 g/m²', value: '190' },
          {title: '200 g/m²', value: '200'},
          {title: '220 g/m²', value: '220'},
          {title: '240 g/m²', value: '250'},
        ],
      },
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      description: 'Fabric composition (e.g., 100% coton, 100% coton PK) for filtering purposes as well.',
      options: {
        list: [
          {title: '100% coton', value: '100% coton'},
          {title: '100% coton PK', value: '100% coton PK'},
          {title: 'Coton/Polyester', value: 'Coton/Polyester'},
          {title: 'Autre', value: 'Autre'},
        ],
      },
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Product categories for filtering and organization (e.g., T-Shirts, Long Sleeves, Specials, etc.)',
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
      currentPrice: 'currentPrice',
      basePrice: 'basePrice',
      businessPacks: 'businessPacks',
      isBusinessProduct: 'isBusinessProduct',
      inStock: 'inStock',
    },
    prepare({title, media, currentPrice, basePrice, businessPacks, isBusinessProduct, inStock}) {
      let priceDisplay = 'No price';
      
      if (isBusinessProduct && businessPacks && businessPacks.length > 0) {
        // For business products, get price from first pack
        const firstPack = businessPacks[0];
        const packPrice = firstPack?.currentPrice;
        if (packPrice !== undefined) {
          priceDisplay = `${packPrice} F CFA`;
        }
      } else if (currentPrice !== undefined) {
        // For regular products, get price
        if (basePrice && basePrice > currentPrice) {
          priceDisplay = `${basePrice} → ${currentPrice} F CFA`;
        } else {
          priceDisplay = `${currentPrice} F CFA`;
        }
      }
      
      return {
        title: title || 'Untitled Product',
        subtitle: `${priceDisplay}${inStock ? '' : ' (Out of Stock)'}`,
        media,
      };
    },
  },
})
