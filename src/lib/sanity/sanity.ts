import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: Record<string, unknown>) {
  return builder.image(source);
}

// Helper function to get Sanity images
export function getSanityImageUrl(
  image: Record<string, unknown>,
  width = 800,
  height = 600
) {
  if (!image) return null;
  return builder.image(image).width(width).height(height).url();
}
