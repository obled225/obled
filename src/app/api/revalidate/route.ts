import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tags, paths } = await request.json();

    // Revalidate specific tags
    if (tags && Array.isArray(tags)) {
      tags.forEach((tag: string) => {
        revalidateTag(tag, 'max');
        console.log(`Revalidated tag: ${tag}`);
      });
    }

    // Revalidate specific paths
    if (paths && Array.isArray(paths)) {
      paths.forEach((path: string) => {
        revalidatePath(path);
        console.log(`Revalidated path: ${path}`);
      });
    }

    // Default revalidation for common content
    if (!tags && !paths) {
      revalidateTag('products', 'max');
      revalidateTag('categories', 'max');
      revalidateTag('homepage', 'max');
      revalidatePath('/');
      revalidatePath('/products');
      console.log('Revalidated all common content');
    }

    return NextResponse.json({
      success: true,
      message: 'Revalidation completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in manual revalidation:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
