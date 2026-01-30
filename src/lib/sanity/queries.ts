import { sanityClient } from './sanity';
import { Product, ProductVariant, ProductCategory } from '@/lib/types/sanity';
import { getSanityImageUrl } from './sanity';
import type { SanityProductExpanded } from '@/lib/types/sanity';

// Helper to transform Sanity product to Product type
function transformSanityProduct(doc: SanityProductExpanded): Product {
  const images =
    doc.images
      ?.map((img) =>
        img.asset ? getSanityImageUrl(img.asset, 800, 600) : null
      )
      .filter((url): url is string => url !== null) || [];

  const variants: ProductVariant[] =
    doc.variants?.map((variant, index: number) => ({
      id: variant._key || `variant-${index}`,
      name: variant.title || 'Variant',
      value: variant.options?.map((opt) => opt.value).join(' - ') || '',
      priceModifier: variant.priceModifier || 0,
      stockQuantity: variant.inventory || 0,
      sku:
        variant.sku ||
        `${doc.slug?.current || doc._id}-${variant._key || index}`,
    })) || [];

  // Extract colors and sizes from variants if they exist
  const colors: { name: string; value: string; available: boolean }[] = [];
  const sizes: { name: string; available: boolean }[] = [];

  doc.variants?.forEach((variant) => {
    variant.options?.forEach((opt) => {
      if (!opt.name || !opt.value) return;
      if (
        opt.name.toLowerCase() === 'color' ||
        opt.name.toLowerCase() === 'couleur'
      ) {
        const existingColor = colors.find((c) => c.name === opt.value);
        if (!existingColor && opt.value) {
          colors.push({
            name: opt.value,
            value: opt.value.toLowerCase().replace(/\s+/g, '-'),
            available: (variant.inventory || 0) > 0,
          });
        }
      }
      if (
        opt.name.toLowerCase() === 'size' ||
        opt.name.toLowerCase() === 'taille'
      ) {
        const existingSize = sizes.find((s) => s.name === opt.value);
        if (!existingSize && opt.value) {
          sizes.push({
            name: opt.value,
            available: (variant.inventory || 0) > 0,
          });
        }
      }
    });
  });

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

  return {
    id: doc._id,
    name: doc.name || '',
    price: doc.basePrice || 0,
    originalPrice: doc.originalPrice,
    currency: doc.currency || 'XOF',
    image: images[0] || '',
    images: images.length > 0 ? images : undefined,
    soldOut: !doc.inStock || (doc.stockQuantity || 0) === 0,
    inStock: doc.inStock || false,
    stockQuantity: doc.stockQuantity || 0,
    colors: colors.length > 0 ? colors : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    description: doc.description
      ? Array.isArray(doc.description)
        ? doc.description.filter((d): d is string => typeof d === 'string')
        : typeof doc.description === 'string'
          ? [doc.description]
          : undefined
      : undefined,
    category,
    variants: variants.length > 0 ? variants : undefined,
    sku: doc.sku || doc._id,
    weight: doc.weight,
    dimensions: doc.dimensions
      ? {
          length: doc.dimensions.length || 0,
          width: doc.dimensions.width || 0,
          height: doc.dimensions.height || 0,
        }
      : undefined,
    tags: doc.tags || [],
    createdAt: doc._createdAt ? new Date(doc._createdAt) : new Date(),
    updatedAt: doc._updatedAt ? new Date(doc._updatedAt) : new Date(),
  };
}

// GROQ query to get all products
const ALL_PRODUCTS_QUERY = `*[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
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

// GROQ query to get a single product by slug
const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
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
const PRODUCTS_BY_CATEGORY_QUERY = `*[_type == "product" && $categoryId in categories[]._ref && !(_id in path("drafts.**"))] | order(_createdAt desc) {
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

// GROQ query to get featured products
const FEATURED_PRODUCTS_QUERY = `*[_type == "product" && featured == true && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...$limit] {
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
    const query = `*[_type == "product" && _id == $id && !(_id in path("drafts.**"))][0] {
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
    const doc = await sanityClient.fetch(query, { id });
    if (!doc) return null;
    return transformSanityProduct(doc);
  } catch (error) {
    console.error(`Error fetching product by ID "${id}" from Sanity:`, error);
    return null;
  }
}

// GROQ query to get about page content
const ABOUT_PAGE_QUERY = `*[_type == "aboutPage" && !(_id in path("drafts.**"))][0] {
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
const ANNOUNCEMENT_BAR_QUERY = `*[_type == "announcementBar" && !(_id in path("drafts.**"))][0] {
  _id,
  announcements[] {
    text,
    link
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
  text: string;
  link?: string;
}

export interface AnnouncementBarData {
  announcements?: Announcement[];
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
export async function getAnnouncementBar(): Promise<AnnouncementBarData | null> {
  try {
    const doc = await sanityClient.fetch(ANNOUNCEMENT_BAR_QUERY);
    if (!doc) return null;
    return doc;
  } catch (error) {
    console.error('Error fetching announcement bar from Sanity:', error);
    return null;
  }
}
