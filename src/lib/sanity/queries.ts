import { sanityClient } from './sanity';
import {
  Product,
  ProductCategory,
  ProductPrice,
  PortableTextBlock,
} from '@/lib/types/sanity';
import { getSanityImageUrl } from './sanity';
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
          const url = getSanityImageUrl(asset, 800, 600);
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
  const colors = (doc.colors || []).map((color) => ({
    name: color.name || '',
    value: color.value || '',
    available: color.available !== false,
    image: color.image?.asset
      ? getSanityImageUrl(color.image.asset) || undefined
      : undefined,
  }));

  // Transform sizes array
  const sizes = (doc.sizes || []).map((size) => ({
    name: size.name || '',
    available: size.available !== false,
  }));

  // Transform variants array
  const variants = (doc.variants || []).map(
    (
      variant: {
        _key?: string;
        title?: string;
        priceModifier?: number;
        inventory?: number;
        sku?: string;
        options?: Array<{ name?: string; value?: string }>;
      },
      index: number
    ) => ({
      id: variant._key || `variant-${index}`,
      name: variant.title || '',
      value: variant.options?.[0]?.value || '',
      priceModifier: variant.priceModifier || 0,
      stockQuantity: variant.inventory || 0,
      sku: variant.sku || '',
    })
  );

  const category: ProductCategory = doc.categories?.[0]
    ? {
        id: doc.categories[0]._id || doc.categories[0].slug?.current || '',
        name: doc.categories[0].title || '',
        description: doc.categories[0].description,
        image: doc.categories[0].image?.asset
          ? getSanityImageUrl(doc.categories[0].image.asset) || undefined
          : undefined,
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
    soldOut: !doc.inStock || (doc.stockQuantity || 0) === 0,
    inStock: doc.inStock || false,
    stockQuantity: doc.stockQuantity || 0,
    colors: colors.length > 0 ? colors : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    description: doc.description as PortableTextBlock[] | undefined,
    category,
    sku: doc.sku || doc._id,
    weight: doc.weight,
    dimensions: doc.dimensions,
    variants: variants.length > 0 ? variants : undefined,
    tags: doc.tags || [],
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
  prices[] {
    currency,
    basePrice,
    originalPrice,
    lomiPriceId
  },
  description,
  inStock,
  stockQuantity,
  sku,
  weight,
  dimensions,
  tags,
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
  sizes[] {
    name,
    available
  },
  "variants": variants[] {
    _key,
    title,
    priceModifier,
    inventory,
    sku,
    "options": options[] {
      name,
      value
    }
  }
}`;

// GROQ query to get a single product by slug
const PRODUCT_BY_SLUG_QUERY = `*[_type == "products" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
  _id,
  _createdAt,
  _updatedAt,
  name,
  "slug": slug.current,
  basePrice,
  originalPrice,
  currency,
  description,
  inStock,
  stockQuantity,
  sku,
  weight,
  dimensions,
  tags,
  "images": images[].asset->,
  "categories": categories[]->{
    _id,
    "slug": slug.current,
    title,
    description,
    "image": image.asset->
  },
  "variants": variants[] {
    _key,
    title,
    priceModifier,
    inventory,
    sku,
    "options": options[] {
      name,
      value
    }
  }
}`;

// GROQ query to get products by category
const PRODUCTS_BY_CATEGORY_QUERY = `*[_type == "products" && $categoryId in categories[]._ref && !(_id in path("drafts.**"))] | order(_createdAt desc) {
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
  description,
  inStock,
  stockQuantity,
  sku,
  weight,
  dimensions,
  tags,
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
  sizes[] {
    name,
    available
  },
  "variants": variants[] {
    _key,
    title,
    priceModifier,
    inventory,
    sku,
    "options": options[] {
      name,
      value
    }
  }
}`;

// GROQ query to get featured products
const FEATURED_PRODUCTS_QUERY = `*[_type == "products" && featured == true && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...$limit] {
  _id,
  _createdAt,
  _updatedAt,
  name,
  "slug": slug.current,
  basePrice,
  originalPrice,
  currency,
  description,
  inStock,
  stockQuantity,
  sku,
  weight,
  dimensions,
  tags,
  "images": images[].asset->,
  "categories": categories[]->{
    _id,
    "slug": slug.current,
    title,
    description,
    "image": image.asset->
  },
  "variants": variants[] {
    _key,
    title,
    priceModifier,
    inventory,
    sku,
    "options": options[] {
      name,
      value
    }
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
      prices[] {
        currency,
        basePrice,
        originalPrice,
        lomiPriceId
      },
      description,
      inStock,
      stockQuantity,
      sku,
      weight,
      dimensions,
      tags,
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
      sizes[] {
        name,
        available
      },
      "variants": variants[] {
        _key,
        title,
        priceModifier,
        inventory,
        sku,
        "options": options[] {
          name,
          value
        }
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
