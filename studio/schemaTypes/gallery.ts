import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  description: 'Images shown on the gallery page. Add multiple images at once; each keeps its natural aspect ratio.',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Add images to the gallery. You can add or upload multiple at once.',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: {
        layout: 'grid',
      },
    }),
  ],
  preview: {
    select: { count: 'images' },
    prepare({ count }) {
      const n = Array.isArray(count) ? count.length : 0;
      return {
        title: 'Gallery',
        subtitle: n ? `${n} image${n === 1 ? '' : 's'}` : 'No images',
      };
    },
  },
});
