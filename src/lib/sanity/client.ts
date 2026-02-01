import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  // Add token if available for browser requests (optional - can also configure CORS in Sanity)
  token: process.env.NEXT_PUBLIC_SANITY_READ_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: Record<string, unknown>) {
  return builder.image(source);
}

// Helper function to get Sanity images
export function getSanityImageUrl(
  image: Record<string, unknown>,
  width = 1200,
  height?: number
) {
  if (!image) return null;
  const imageBuilder = builder.image(image).width(width).quality(90);
  // Only set height if provided, to preserve aspect ratio for square/portrait images
  if (height) {
    return imageBuilder.height(height).fit('max').url();
  }
  // Use fit 'max' to preserve aspect ratio and prevent cropping
  return imageBuilder.fit('max').url();
}

// Helper function to get Sanity file URL
// Sanity file assets typically return full URLs, but this ensures proper URL construction
export function getSanityFileUrl(fileUrl?: string): string | null {
  if (!fileUrl) return null;

  // If URL is already complete (starts with http), return as is
  if (fileUrl.startsWith('http')) {
    return fileUrl;
  }

  // Otherwise, construct the full URL
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const cdnUrl =
    process.env.NODE_ENV === 'production'
      ? `https://cdn.sanity.io/files/${projectId}/${dataset}`
      : `https://cdn.sanity.io/files/${projectId}/${dataset}`;

  // If URL starts with /, it's a relative path
  if (fileUrl.startsWith('/')) {
    return `${cdnUrl}${fileUrl}`;
  }

  return fileUrl;
}
