/**
 * Utility function to trigger manual revalidation
 * Call this after updating content in Sanity to refresh production cache
 */

export async function triggerRevalidation(options?: {
  tags?: string[];
  paths?: string[];
}) {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Revalidation successful:', result);
    return result;
  } catch (error) {
    console.error('Revalidation failed:', error);
    throw error;
  }
}

// Quick revalidation functions for common content types
export const revalidateProducts = () =>
  triggerRevalidation({ tags: ['products'] });
export const revalidateCategories = () =>
  triggerRevalidation({ tags: ['categories'] });
export const revalidateHomepage = () =>
  triggerRevalidation({ tags: ['homepage'] });
export const revalidateShop = () =>
  triggerRevalidation({ paths: ['/shop', '/products'] });
export const revalidateAll = () => triggerRevalidation();
