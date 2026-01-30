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
  const cdnUrl = process.env.NODE_ENV === 'production' 
    ? `https://cdn.sanity.io/files/${projectId}/${dataset}`
    : `https://cdn.sanity.io/files/${projectId}/${dataset}`;
  
  // If URL starts with /, it's a relative path
  if (fileUrl.startsWith('/')) {
    return `${cdnUrl}${fileUrl}`;
  }
  
  return fileUrl;
}
