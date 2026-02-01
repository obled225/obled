import { sanityClient } from './client';
import {
  Product,
  ProductCategory,
  ProductPrice,
  PortableTextBlock,
} from '@/lib/types/sanity';
import { getSanityImageUrl } from './client';
import type { SanityProductExpanded } from '@/lib/types/sanity';

// Helper to transform Sanity product to Product type
function transformSanityProduct(doc: SanityProductExpanded): Product {
  const images =
    doc.images
      ?.map((img) => {
        // Handle different asset structures from GROQ queries
        // When using images[].asset->, the asset is resolved
        // img might be the asset itself, or img.asset might be the asset
        const asset = img?.asset || img;
        if (!asset) return null;

        try {
          // Use higher quality and preserve aspect ratio (don't force 4:3 ratio)
          // Pass undefined for height to preserve original aspect ratio
          const url = getSanityImageUrl(asset, 1200);
          return url;
        } catch (error) {
          console.error('Error generating image URL:', error, { img, asset });
          return null;
        }
      })
      .filter((url): url is string => url !== null && url !== '') || [];

  // Transform prices array
  const prices: ProductPrice[] = (doc.prices || []).map((price) => ({
    currency: (price.currency || 'XOF') as 'XOF' | 'USD' | 'EUR',
    basePrice: price.basePrice || 0,
    originalPrice: price.originalPrice,
    lomiPriceId: price.lomiPriceId || '',
  }));

  // Get first price as default (for backward compatibility)
  const defaultPrice = prices[0] || {
    currency: 'XOF' as const,
    basePrice: 0,
    lomiPriceId: '',
  };

  // Transform colors array
  const colors = (doc.colors || []).map((color) => {
    // Handle different asset structures from GROQ queries
    // When using image.asset->, the asset is already resolved
    // color.image might be the asset itself, or color.image.asset might be the asset
    const imageAsset = color.image?.asset || color.image;
    
    return {
      name: color.name || '',
      available: color.available !== false,
      image: imageAsset
        ? getSanityImageUrl(imageAsset, 1200) || undefined
        : undefined,
    };
  });

  // Transform sizes from array format
  // Handle both old format (object with booleans) and new format (array of objects)
  const sizesArray: Array<{ name: string; available: boolean }> = [];

  if (doc.sizes) {
    if (Array.isArray(doc.sizes)) {
      // New format: array of objects with name and available
      doc.sizes.forEach((size) => {
        if (size && typeof size === 'object' && size.name) {
          sizesArray.push({
            name: size.name,
            available: size.available !== false, // Default to true if not specified
          });
        }
      });
    } else if (typeof doc.sizes === 'object') {
      // Legacy format: object with boolean fields (for backward compatibility)
      const sizeMap: Record<string, string> = {
        xxs: 'XXS',
        xs: 'XS',
        s: 'S',
        m: 'M',
        l: 'L',
        xl: 'XL',
        xxl: 'XXL',
        twoXl: '2XL',
      };
      Object.entries(doc.sizes).forEach(([key, value]) => {
        if (typeof value === 'boolean' && value && sizeMap[key]) {
          sizesArray.push({
            name: sizeMap[key],
            available: true,
          });
        }
      });
    }
  }

  const sizes = sizesArray.length > 0 ? sizesArray : undefined;

  // Handle variant reference (single product reference for variants like short/long sleeves)
  const variant = doc.variant
    ? {
        id: doc.variant._id || '',
        name: doc.variant.name || '',
        slug:
          typeof doc.variant.slug === 'string'
            ? doc.variant.slug
            : doc.variant.slug?.current || '',
      }
    : undefined;

  // Handle relatedProducts array (multiple product references)
  // Transform related products into full Product objects
  const relatedProducts = doc.relatedProducts
    ? doc.relatedProducts
        .filter(
          (ref): ref is NonNullable<typeof ref> =>
            ref !== null && ref !== undefined && !!ref._id
        )
        .map((relatedDoc) => {
          // Transform related product using the same logic
          const relatedImages =
            relatedDoc.images
              ?.map((img) => {
                const asset = img?.asset || img;
                if (!asset) return null;
                try {
                  // Use higher quality and preserve aspect ratio
                  return getSanityImageUrl(asset, 1200);
                } catch {
                  return null;
                }
              })
              .filter((url): url is string => url !== null && url !== '') || [];

          const relatedPrices: ProductPrice[] = (relatedDoc.prices || []).map(
            (price) => ({
              currency: (price.currency || 'XOF') as 'XOF' | 'USD' | 'EUR',
              basePrice: price.basePrice || 0,
              originalPrice: price.originalPrice,
              lomiPriceId: price.lomiPriceId || '',
            })
          );

          const defaultRelatedPrice = relatedPrices[0] || {
            currency: 'XOF' as const,
            basePrice: 0,
            lomiPriceId: '',
          };

          const relatedCategory = relatedDoc.categories?.[0]
            ? {
                id:
                  relatedDoc.categories[0]._id ||
                  relatedDoc.categories[0].slug?.current ||
                  '',
                name: relatedDoc.categories[0].title || '',
                description: relatedDoc.categories[0].description,
              }
            : {
                id: 'uncategorized',
                name: 'Uncategorized',
              };

          return {
            id: relatedDoc._id || '',
            slug:
              typeof relatedDoc.slug === 'string'
                ? relatedDoc.slug
                : relatedDoc.slug?.current || relatedDoc._id || '',
            name: relatedDoc.name || '',
            prices: relatedPrices,
            price: defaultRelatedPrice.basePrice,
            originalPrice: defaultRelatedPrice.originalPrice,
            currency: defaultRelatedPrice.currency,
            image: relatedImages[0] || '',
            images: relatedImages.length > 0 ? relatedImages : undefined,
            soldOut: !relatedDoc.inStock,
            inStock: relatedDoc.inStock || false,
            category: relatedCategory,
            isBusinessProduct: false,
            featured: false,
            bestSeller: false,
            createdAt: relatedDoc._createdAt
              ? new Date(relatedDoc._createdAt)
              : new Date(),
            updatedAt: relatedDoc._updatedAt
              ? new Date(relatedDoc._updatedAt)
              : new Date(),
          } as Product;
        })
    : undefined;

  // Handle businessPackProduct reference (link to business pack version)
  const businessPackProduct = doc.businessPackProduct
    ? {
        id: doc.businessPackProduct._id || '',
        name: doc.businessPackProduct.name || '',
        slug:
          typeof doc.businessPackProduct.slug === 'string'
            ? doc.businessPackProduct.slug
            : doc.businessPackProduct.slug?.current || '',
      }
    : undefined;

  const category: ProductCategory = doc.categories?.[0]
    ? {
        id: doc.categories[0]._id || doc.categories[0].slug?.current || '',
        name: doc.categories[0].title || '',
        description: doc.categories[0].description,
      }
    : {
        id: 'uncategorized',
        name: 'Uncategorized',
      };

  // Ensure we have at least one valid image URL
  const primaryImage = images[0] || null;

  return {
    id: doc._id,
    slug:
      (typeof doc.slug === 'string' ? doc.slug : doc.slug?.current) || doc._id,
    name: doc.name || '',
    prices,
    // Backward compatibility fields (use first price)
    price: defaultPrice.basePrice,
    originalPrice: defaultPrice.originalPrice,
    currency: defaultPrice.currency,
    image: primaryImage || '',
    images: images.length > 0 ? images : undefined,
    soldOut: !doc.inStock,
    inStock: doc.inStock || false,
    colors: colors.length > 0 ? colors : undefined,
    sizes: sizes && sizes.length > 0 ? sizes : undefined,
    description: doc.description as PortableTextBlock[] | undefined,
    category,
    variant,
    relatedProducts,
    businessPackProduct,
    isBusinessProduct: doc.isBusinessProduct || false,
    lomiProductId: doc.lomiProductId,
    featured: doc.featured || false,
    bestSeller: doc.bestSeller || false,
    businessPacks: doc.businessPacks,
    createdAt: doc._createdAt ? new Date(doc._createdAt) : new Date(),
    updatedAt: doc._updatedAt ? new Date(doc._updatedAt) : new Date(),
  };
}

// GROQ query to get all products
const ALL_PRODUCTS_QUERY = `*[_type == "products" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
  _id,
  _createdAt,
  _updatedAt,
  name,
  "slug": slug.current,
  isBusinessProduct,
  lomiProductId,

  businessPacks[] {
    quantity,
    label,
    prices[] {
      currency,
      basePrice,
      originalPrice,
      lomiPriceId
    }
  },
  featured,
  bestSeller,
  prices[] {
    currency,
    basePrice,
    originalPrice,
    lomiPriceId
  },
  description,
  inStock,
  "images": images[].asset->,
  "categories": categories[]->{
    _id,
    "slug": slug.current,
    title,
    description
  },
  colors[] {
    name,
    value,
    available,
    "image": image.asset->
  },
  sizes,
  "variant": variant->{
    _id,
    name,
    "slug": slug.current
  },
  "relatedProducts": relatedProducts[]->{
    _id,
    _createdAt,
    _updatedAt,
    name,
    "slug": slug.current,
    prices[] {
      currency,
      basePrice,
      originalPrice,
      lomiPriceId
    },
    inStock,
    "images": images[].asset->,
    "categories": categories[]->{
      _id,
      "slug": slug.current,
      title,
      description
    }
  },
  "businessPackProduct": businessPackProduct->{
    _id,
    name,
    "slug": slug.current
  }
}`;

// GROQ query to get a single product by slug
const PRODUCT_BY_SLUG_QUERY = `*[_type == "products" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
  _id,
  _createdAt,
  _updatedAt,
  name,
  "slug": slug.current,
  isBusinessProduct,
  lomiProductId,
  businessPacks[] {
    quantity,
    label,
    prices[] {
      currency,
      basePrice,
      originalPrice,
      lomiPriceId
    }
  },
  featured,
  bestSeller,
  prices[] {
    currency,
    basePrice,
    originalPrice,
    lomiPriceId
  },
  description,
  inStock,
  "images": images[].asset->,
  "categories": categories[]->{
    _id,
    "slug": slug.current,
    title,
    description
  },
  colors[] {
    name,
    value,
    available,
    "image": image.asset->
  },
  sizes,
  "variant": variant->{
    _id,
    name,
    "slug": slug.current
  },
  "relatedProducts": relatedProducts[]->{
    _id,
    _createdAt,
    _updatedAt,
    name,
    "slug": slug.current,
    prices[] {
      currency,
      basePrice,
      originalPrice,
      lomiPriceId
    },
    inStock,
    "images": images[].asset->,
    "categories": categories[]->{
      _id,
      "slug": slug.current,
      title,
      description
    }
  },
  "businessPackProduct": businessPackProduct->{
    _id,
    name,
    "slug": slug.current
  }
}`;

// GROQ query to get products by category
const PRODUCTS_BY_CATEGORY_QUERY = `*[_type == "products" && $categoryId in categories[]._ref && !(_id in path("drafts.**"))] | order(_createdAt desc) {
  _id,
  _createdAt,
  _updatedAt,
  name,
  "slug": slug.current,
  isBusinessProduct,
  lomiProductId,
  featured,
  bestSeller,
  prices[] {
    currency,
    basePrice,
    originalPrice,
    lomiPriceId
  },
  description,
  inStock,
  "images": images[].asset->,
  "categories": categories[]->{
    _id,
    "slug": slug.current,
    title,
    description
  },
  colors[] {
    name,
    value,
    available,
    "image": image.asset->
  },
  sizes,
  "variant": variant->{
    _id,
    name,
    "slug": slug.current
  },
  "relatedProducts": relatedProducts[]->{
    _id,
    _createdAt,
    _updatedAt,
    name,
    "slug": slug.current,
    prices[] {
      currency,
      basePrice,
      originalPrice,
      lomiPriceId
    },
    inStock,
    "images": images[].asset->,
    "categories": categories[]->{
      _id,
      "slug": slug.current,
      title,
      description
    }
  },
  "businessPackProduct": businessPackProduct->{
    _id,
    name,
    "slug": slug.current
  }
}`;

// GROQ query to get featured products
const FEATURED_PRODUCTS_QUERY = `*[_type == "products" && featured == true && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...$limit] {
  _id,
  _createdAt,
  _updatedAt,
  name,
  "slug": slug.current,
  isBusinessProduct,
  lomiProductId,
  featured,
  bestSeller,
  prices[] {
    currency,
    basePrice,
    originalPrice,
    lomiPriceId
  },
  description,
  inStock,
  "images": images[].asset->,
  "categories": categories[]->{
    _id,
    "slug": slug.current,
    title,
    description
  },
  colors[] {
    name,
    value,
    available,
    "image": image.asset->
  },
  sizes,
  "variant": variant->{
    _id,
    name,
    "slug": slug.current
  },
  "relatedProducts": relatedProducts[]->{
    _id,
    _createdAt,
    _updatedAt,
    name,
    "slug": slug.current,
    prices[] {
      currency,
      basePrice,
      originalPrice,
      lomiPriceId
    },
    inStock,
    "images": images[].asset->,
    "categories": categories[]->{
      _id,
      "slug": slug.current,
      title,
      description
    }
  },
  "businessPackProduct": businessPackProduct->{
    _id,
    name,
    "slug": slug.current
  }
}`;

/**
 * Get all products from Sanity
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const docs = await sanityClient.fetch(ALL_PRODUCTS_QUERY);
    return docs.map(transformSanityProduct);
  } catch (error) {
    console.error('Error fetching all products from Sanity:', error);
    return [];
  }
}

/**
 * Get products for shop page (excluding business products)
 */
export async function getShopProducts(): Promise<Product[]> {
  try {
    const query = `*[_type == "products" && isBusinessProduct != true && !(_id in path("drafts.**"))] | order(_createdAt desc) {
      _id,
      _createdAt,
      _updatedAt,
      name,
      "slug": slug.current,
      isBusinessProduct,
      lomiProductId,
      featured,
      bestSeller,
  bestSeller,
      prices[] {
        currency,
        basePrice,
        originalPrice,
        lomiPriceId
      },
      description,
      inStock,
      "images": images[].asset->,
      "categories": categories[]->{
        _id,
        "slug": slug.current,
        title,
        description,
        "image": image.asset->
      },
      colors[] {
        name,
        value,
        available,
        "image": image.asset->
      },
      sizes,
      "relatedProducts": relatedProducts[]->{
        _id,
        _createdAt,
        _updatedAt,
        name,
        "slug": slug.current,
        prices[] {
          currency,
          basePrice,
          originalPrice,
          lomiPriceId
        },
        inStock,
        "images": images[].asset->,
        "categories": categories[]->{
          _id,
          "slug": slug.current,
          title,
          description
        }
      },
      "businessPackProduct": businessPackProduct->{
        _id,
        name,
        "slug": slug.current
      }
    }`;
    const docs = await sanityClient.fetch(query);
    return docs.map(transformSanityProduct);
  } catch (error) {
    console.error('Error fetching shop products from Sanity:', error);
    return [];
  }
}

/**
 * Get products for business page (only business products)
 */
export async function getBusinessProducts(): Promise<Product[]> {
  try {
    const query = `*[_type == "products" && isBusinessProduct == true && !(_id in path("drafts.**"))] | order(_createdAt desc) {
      _id,
      _createdAt,
      _updatedAt,
      name,
      "slug": slug.current,
      isBusinessProduct,
      lomiProductId,
      featured,
      bestSeller,
  bestSeller,
      businessPacks[] {
        quantity,
        label,
        prices[] {
          currency,
          basePrice,
          originalPrice,
          lomiPriceId
        }
      },
      prices[] {
        currency,
        basePrice,
        originalPrice,
        lomiPriceId
      },
      description,
      inStock,
      "images": images[].asset->,
      "categories": categories[]->{
        _id,
        "slug": slug.current,
        title,
        description,
        "image": image.asset->
      },
      colors[] {
        name,
        value,
        available,
        "image": image.asset->
      },
      sizes,
      "relatedProducts": relatedProducts[]->{
        _id,
        _createdAt,
        _updatedAt,
        name,
        "slug": slug.current,
        prices[] {
          currency,
          basePrice,
          originalPrice,
          lomiPriceId
        },
        inStock,
        "images": images[].asset->,
        "categories": categories[]->{
          _id,
          "slug": slug.current,
          title,
          description
        }
      },
      "businessPackProduct": businessPackProduct->{
        _id,
        name,
        "slug": slug.current
      }
    }`;
    const docs = await sanityClient.fetch(query);
    return docs.map(transformSanityProduct);
  } catch (error) {
    console.error('Error fetching business products from Sanity:', error);
    return [];
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const doc = await sanityClient.fetch(PRODUCT_BY_SLUG_QUERY, { slug });
    if (!doc) return null;
    return transformSanityProduct(doc);
  } catch (error) {
    console.error(
      `Error fetching product by slug "${slug}" from Sanity:`,
      error
    );
    return null;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  try {
    const docs = await sanityClient.fetch(PRODUCTS_BY_CATEGORY_QUERY, {
      categoryId,
    });
    return docs.map(transformSanityProduct);
  } catch (error) {
    console.error(
      `Error fetching products by category "${categoryId}" from Sanity:`,
      error
    );
    return [];
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(
  limit: number = 6
): Promise<Product[]> {
  try {
    const docs = await sanityClient.fetch(FEATURED_PRODUCTS_QUERY, { limit });
    return docs.map(transformSanityProduct);
  } catch (error) {
    console.error('Error fetching featured products from Sanity:', error);
    return [];
  }
}

/**
 * Get a product by ID (Sanity document ID)
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const query = `*[_type == "products" && _id == $id && !(_id in path("drafts.**"))][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      "slug": slug.current,
      isBusinessProduct,
      lomiProductId,
      businessPacks[] {
        quantity,
        label,
        prices[] {
          currency,
          basePrice,
          originalPrice,
          lomiPriceId
        }
      },
      prices[] {
        currency,
        basePrice,
        originalPrice,
        lomiPriceId
      },
      description,
      inStock,
      "images": images[].asset->,
      "categories": categories[]->{
        _id,
        "slug": slug.current,
        title,
        description,
        "image": image.asset->
      },
      colors[] {
        name,
        value,
        available,
        "image": image.asset->
      },
      sizes,
      "relatedProducts": relatedProducts[]->{
        _id,
        _createdAt,
        _updatedAt,
        name,
        "slug": slug.current,
        prices[] {
          currency,
          basePrice,
          originalPrice,
          lomiPriceId
        },
        inStock,
        "images": images[].asset->,
        "categories": categories[]->{
          _id,
          "slug": slug.current,
          title,
          description
        }
      },
      "businessPackProduct": businessPackProduct->{
        _id,
        name,
        "slug": slug.current
      }
    }`;
    const doc = await sanityClient.fetch(query, { id });
    if (!doc) return null;
    return transformSanityProduct(doc);
  } catch (error) {
    console.error(`Error fetching product by ID "${id}" from Sanity:`, error);
    return null;
  }
}

// GROQ query to get about page content
const ABOUT_PAGE_QUERY = `*[_type == "about" && !(_id in path("drafts.**"))][0] {
  _id,
  "heroVideoUrl": heroVideo.asset->url,
  sectionImages[] {
    image {
      _id,
      asset->{
        _id,
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      }
    },
    caption,
    position
  }
}`;

// GROQ query to get announcement bar content
const ANNOUNCEMENT_BAR_QUERY = `*[_type == "announcements" && !(_id in path("drafts.**"))][0] {
  _id,
  announcements[] {
    text,
    promoCode,
    link
  },
  floatingAnnouncement {
    text,
    isActive
  }
}`;

// GROQ query to get floating announcement content
const FLOATING_ANNOUNCEMENT_QUERY = `*[_type == "announcements" && !(_id in path("drafts.**"))][0] {
  floatingAnnouncement {
    text,
    isActive
  }
}`;

export interface AboutSectionImage {
  image: {
    _id?: string;
    asset?: {
      _id?: string;
      url?: string;
      metadata?: {
        dimensions?: {
          width?: number;
          height?: number;
        };
      };
    };
  };
  caption?: string;
  position: string;
}

export interface AboutPageData {
  heroVideoUrl?: string;
  sectionImages?: AboutSectionImage[];
}

export interface Announcement {
  text: PortableTextBlock[] | string;
  link?: string;
}

export interface AnnouncementBarData {
  announcements?: Announcement[];
  floatingAnnouncement?: FloatingAnnouncementData;
}

export interface FloatingAnnouncementData {
  text: PortableTextBlock[] | string;
  isActive: boolean;
}

/**
 * Get about page content from Sanity
 */
export async function getAboutPage(): Promise<AboutPageData | null> {
  try {
    const doc = await sanityClient.fetch(ABOUT_PAGE_QUERY);
    if (!doc) return null;
    return doc;
  } catch (error) {
    console.error('Error fetching about page from Sanity:', error);
    return null;
  }
}

/**
 * Get announcement bar content from Sanity
 */
export async function getAnnouncements(): Promise<AnnouncementBarData | null> {
  try {
    const doc = await sanityClient.fetch(ANNOUNCEMENT_BAR_QUERY);
    if (!doc) return null;
    return doc;
  } catch (error) {
    console.error('Error fetching announcement bar from Sanity:', error);
    return null;
  }
}

/**
 * Get floating announcement content from Sanity
 */
export async function getFloatingAnnouncement(): Promise<FloatingAnnouncementData | null> {
  try {
    const doc = await sanityClient.fetch(FLOATING_ANNOUNCEMENT_QUERY);
    if (!doc?.floatingAnnouncement) return null;
    return doc.floatingAnnouncement;
  } catch (error) {
    console.error('Error fetching floating announcement from Sanity:', error);
    return null;
  }
}

/**
 * Get all categories from Sanity
 */
export async function getAllCategories(): Promise<ProductCategory[]> {
  try {
    const query = `*[_type == "categories" && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      description,
      "slug": slug.current,
      badgeText,
      badgeColor
    }`;
    const docs = await sanityClient.fetch(query);
    return docs.map(
      (doc: {
        slug: string;
        _id: string;
        title: string;
        description: string;
        badgeText?: string;
        badgeColor?: string;
      }) => ({
        id: doc.slug || doc._id,
        name: doc.title,
        description: doc.description,
        badgeText: doc.badgeText,
        badgeColor: doc.badgeColor,
      })
    );
  } catch (error) {
    console.error('Error fetching all categories from Sanity:', error);
    return [];
  }
}

/**
 * Get categories for the header (max 3, showInHeader=true, only categories with products)
 */
export async function getHeaderCategories(): Promise<ProductCategory[]> {
  try {
    // First get all header categories
    const categoriesQuery = `*[_type == "categories" && showInHeader == true && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      description,
      "slug": slug.current,
      badgeText,
      badgeColor
    }`;
    const categories = await sanityClient.fetch(categoriesQuery);

    // Filter categories that have at least one non-business product
    const categoriesWithProducts = await Promise.all(
      categories.map(
        async (cat: {
          slug: string;
          _id: string;
          title: string;
          description: string;
          badgeText?: string;
          badgeColor?: string;
        }) => {
          // Check if this category has any products (excluding business products)
          const productCountQuery = `count(*[_type == "products" && $categoryId in categories[]._ref && isBusinessProduct != true && !(_id in path("drafts.**"))])`;
          const count = await sanityClient.fetch(productCountQuery, {
            categoryId: cat._id,
          });

          return count > 0
            ? {
                id: cat.slug || cat._id,
                name: cat.title,
                description: cat.description,
                badgeText: cat.badgeText,
                badgeColor: cat.badgeColor,
              }
            : null;
        }
      )
    );

    // Filter out null values and limit to 3
    return categoriesWithProducts
      .filter((cat): cat is ProductCategory => cat !== null)
      .slice(0, 3);
  } catch (error) {
    console.error('Error fetching header categories from Sanity:', error);
    return [];
  }
}

/**
 * Get a category by slug
 */
export async function getCategoryBySlug(
  slug: string
): Promise<ProductCategory | null> {
  try {
    const query = `*[_type == "categories" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      _id,
      title,
      description,
      "slug": slug.current,
      badgeText,
      badgeColor
    }`;
    const doc = await sanityClient.fetch(query, { slug });
    if (!doc) return null;
    return {
      id: doc.slug || doc._id,
      name: doc.title,
      description: doc.description,
      badgeText: doc.badgeText,
      badgeColor: doc.badgeColor,
    };
  } catch (error) {
    console.error(
      `Error fetching category by slug "${slug}" from Sanity:`,
      error
    );
    return null;
  }
}

/**
 * Get products by category slug (excluding business products)
 */
export async function getProductsByCategorySlug(
  slug: string
): Promise<Product[]> {
  try {
    // Find the category document _id by matching slug
    const categoryQuery = `*[_type == "categories" && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`;
    const categoryId = await sanityClient.fetch(categoryQuery, { slug });

    if (!categoryId) return [];

    // Get products by category _id, excluding business products (consistent with shop page)
    const query = `*[_type == "products" && $categoryId in categories[]._ref && isBusinessProduct != true && !(_id in path("drafts.**"))] | order(_createdAt desc) {
      _id,
      _createdAt,
      _updatedAt,
      name,
      "slug": slug.current,
      isBusinessProduct,
      lomiProductId,
      featured,
      bestSeller,
      prices[] {
        currency,
        basePrice,
        originalPrice,
        lomiPriceId
      },
      description,
      inStock,
      "images": images[].asset->,
      "categories": categories[]->{
        _id,
        "slug": slug.current,
        title,
        description,
        "image": image.asset->
      },
      colors[] {
        name,
        value,
        available,
        "image": image.asset->
      },
      sizes,
      "variant": variant->{
        _id,
        name,
        "slug": slug.current
      },
      "relatedProducts": relatedProducts[]->{
        _id,
        _createdAt,
        _updatedAt,
        name,
        "slug": slug.current,
        prices[] {
          currency,
          basePrice,
          originalPrice,
          lomiPriceId
        },
        inStock,
        "images": images[].asset->,
        "categories": categories[]->{
          _id,
          "slug": slug.current,
          title,
          description
        }
      },
      "businessPackProduct": businessPackProduct->{
        _id,
        name,
        "slug": slug.current
      }
    }`;
    const docs = await sanityClient.fetch(query, { categoryId });
    return docs.map(transformSanityProduct);
  } catch (error) {
    console.error(
      `Error fetching products by category slug "${slug}" from Sanity:`,
      error
    );
    return [];
  }
}

// GROQ query to get shipping and taxes document
const SHIPPING_AND_TAXES_QUERY = `*[_type == "shippingAndTaxes" && !(_id in path("drafts.**"))][0] {
  _id,
  _createdAt,
  _updatedAt,
  shippingOptions[] {
    name,
    type,
    description,
    estimatedDays,
    prices[] {
      currency,
      price
    },
    isActive,
    sortOrder,
    freeShippingThreshold {
      enabled,
      thresholds[] {
        currency,
        amount
      }
    }
  },
  taxSettings {
    isActive,
    taxRates[] {
      currency,
      type,
      rate
    },
    displayMessage
  }
}`;

export interface ShippingPrice {
  currency: 'XOF' | 'USD' | 'EUR';
  price: number;
}

export interface FreeShippingThreshold {
  currency: 'XOF' | 'USD' | 'EUR';
  amount: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  type: 'standard' | 'express' | 'overnight' | 'international';
  description: string;
  estimatedDays: string;
  prices: ShippingPrice[];
  isActive: boolean;
  sortOrder: number;
  freeShippingThreshold?: {
    enabled: boolean;
    thresholds?: FreeShippingThreshold[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Sanity document types
interface SanityShippingPrice {
  currency?: string;
  price?: number;
}

interface SanityFreeShippingThreshold {
  currency?: string;
  amount?: number;
}

interface SanityShippingOptionItem {
  name?: string;
  type?: string;
  description?: string;
  estimatedDays?: string;
  prices?: SanityShippingPrice[];
  isActive?: boolean;
  sortOrder?: number;
  freeShippingThreshold?: {
    enabled?: boolean;
    thresholds?: SanityFreeShippingThreshold[];
  };
}

interface SanityTaxRate {
  currency?: string;
  type?: string;
  rate?: number;
}

interface SanityTaxSettings {
  isActive?: boolean;
  taxRates?: SanityTaxRate[];
  displayMessage?: string;
}

interface SanityShippingAndTaxesDocument {
  _id?: string;
  _createdAt?: string;
  _updatedAt?: string;
  shippingOptions?: SanityShippingOptionItem[];
  taxSettings?: SanityTaxSettings;
}

/**
 * Transform Sanity shipping option item to ShippingOption type
 */
function transformSanityShippingOption(
  item: SanityShippingOptionItem,
  documentId: string,
  createdAt: string,
  updatedAt: string
): ShippingOption {
  return {
    id: `${documentId}-${item.name || 'shipping'}`,
    name: item.name || '',
    type: (item.type || 'standard') as ShippingOption['type'],
    description: item.description || '',
    estimatedDays: item.estimatedDays || '',
    prices: (item.prices || []).map((price) => ({
      currency: (price.currency || 'XOF') as 'XOF' | 'USD' | 'EUR',
      price: price.price || 0,
    })),
    isActive: item.isActive !== false,
    sortOrder: item.sortOrder || 0,
    freeShippingThreshold: item.freeShippingThreshold
      ? {
          enabled: item.freeShippingThreshold.enabled || false,
          thresholds: (item.freeShippingThreshold.thresholds || []).map(
            (threshold) => ({
              currency: (threshold.currency ||
                'XOF') as 'XOF' | 'USD' | 'EUR',
              amount: threshold.amount || 0,
            })
          ),
        }
      : undefined,
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
  };
}

/**
 * Get all shipping options from Sanity
 */
export async function getAllShippingOptions(): Promise<ShippingOption[]> {
  try {
    const doc = await sanityClient.fetch<SanityShippingAndTaxesDocument>(
      SHIPPING_AND_TAXES_QUERY
    );
    if (!doc || !doc.shippingOptions) return [];
    
    return doc.shippingOptions
      .map((item) =>
        transformSanityShippingOption(
          item,
          doc._id || '',
          doc._createdAt || '',
          doc._updatedAt || ''
        )
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error('Error fetching shipping options from Sanity:', error);
    return [];
  }
}

/**
 * Get active shipping options from Sanity
 */
export async function getActiveShippingOptions(): Promise<ShippingOption[]> {
  try {
    const doc = await sanityClient.fetch<SanityShippingAndTaxesDocument>(
      SHIPPING_AND_TAXES_QUERY
    );
    if (!doc || !doc.shippingOptions) return [];
    
    return doc.shippingOptions
      .filter((item) => item.isActive !== false)
      .map((item) =>
        transformSanityShippingOption(
          item,
          doc._id || '',
          doc._createdAt || '',
          doc._updatedAt || ''
        )
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error('Error fetching active shipping options from Sanity:', error);
    return [];
  }
}

/**
 * Get a shipping option by name (since we now use array items)
 */
export async function getShippingOptionByName(
  name: string
): Promise<ShippingOption | null> {
  try {
    const doc = await sanityClient.fetch<SanityShippingAndTaxesDocument>(
      SHIPPING_AND_TAXES_QUERY
    );
    if (!doc || !doc.shippingOptions) return null;
    
    const item = doc.shippingOptions.find((opt) => opt.name === name);
    if (!item) return null;
    
    return transformSanityShippingOption(
      item,
      doc._id || '',
      doc._createdAt || '',
      doc._updatedAt || ''
    );
  } catch (error) {
    console.error(
      `Error fetching shipping option by name "${name}" from Sanity:`,
      error
    );
    return null;
  }
}

// Tax settings are now part of the shippingAndTaxes document

export interface TaxRate {
  currency: 'XOF' | 'USD' | 'EUR';
  type: 'percentage' | 'fixed';
  rate: number;
}

export interface TaxSettings {
  id: string;
  isActive: boolean;
  taxRates: TaxRate[];
  displayMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform Sanity tax settings to TaxSettings type
 */
function transformSanityTaxSettings(
  taxSettings: SanityTaxSettings,
  documentId: string,
  createdAt: string,
  updatedAt: string
): TaxSettings | null {
  if (!taxSettings) return null;
  
  return {
    id: documentId || '',
    isActive: taxSettings.isActive !== false,
    taxRates: (taxSettings.taxRates || []).map((rate) => ({
      currency: (rate.currency || 'XOF') as 'XOF' | 'USD' | 'EUR',
      type: (rate.type || 'percentage') as 'percentage' | 'fixed',
      rate: rate.rate || 0,
    })),
    displayMessage: taxSettings.displayMessage || 'Taxes included in price',
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
  };
}

/**
 * Get tax settings from Sanity
 */
export async function getTaxSettings(): Promise<TaxSettings | null> {
  try {
    const doc = await sanityClient.fetch<SanityShippingAndTaxesDocument>(
      SHIPPING_AND_TAXES_QUERY
    );
    if (!doc || !doc.taxSettings) return null;
    
    return transformSanityTaxSettings(
      doc.taxSettings,
      doc._id || '',
      doc._createdAt || '',
      doc._updatedAt || ''
    );
  } catch (error) {
    console.error('Error fetching tax settings from Sanity:', error);
    return null;
  }
}

/**
 * Calculate tax amount based on subtotal and currency
 */
export function calculateTax(
  subtotal: number,
  currency: 'XOF' | 'USD' | 'EUR',
  taxSettings: TaxSettings | null
): number {
  if (!taxSettings || !taxSettings.isActive) {
    return 0;
  }

  const taxRate = taxSettings.taxRates.find((r) => r.currency === currency);
  if (!taxRate) {
    return 0;
  }

  if (taxRate.type === 'percentage') {
    return subtotal * taxRate.rate;
  } else {
    // Fixed amount
    return taxRate.rate;
  }
}
