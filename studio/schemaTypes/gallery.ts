import { defineField, defineType } from 'sanity';

const ASPECT_OPTIONS = [
  { title: '1:1 (Square)', value: '1:1' },
  { title: '4:3', value: '4:3' },
  { title: '3:4', value: '3:4' },
  { title: '16:9', value: '16:9' },
  { title: '9:16', value: '9:16' },
  { title: '3:2', value: '3:2' },
  { title: '2:3', value: '2:3' },
] as const;

export default defineType({
  name: 'gallery',
  title: 'Gallery (brand images)',
  type: 'document',
  description: 'Brand images shown on the gallery page. Upload images and choose an aspect ratio for each to control how they appear in the grid.',
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      description: 'Optional title shown at the top of the gallery page (e.g. "Our World")',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional short line under the title',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Add images and choose an aspect ratio for each. You can upload many and preview the grid in the studio.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'aspectRatio',
              title: 'Aspect ratio',
              type: 'string',
              options: {
                list: ASPECT_OPTIONS,
                layout: 'dropdown',
              },
              initialValue: '1:1',
              description: 'How this image is cropped in the grid (square, landscape, portrait, etc.)',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional caption (e.g. for accessibility or lightbox)',
            },
          ],
          preview: {
            select: { media: 'image', title: 'caption', aspect: 'aspectRatio' },
            prepare({ media, title, aspect }) {
              return {
                title: title || 'Image',
                subtitle: aspect ? `Aspect: ${aspect}` : undefined,
                media,
              };
            },
          },
        },
      ],
      options: {
        layout: 'grid',
      },
    }),
  ],
  preview: {
    select: { title: 'title', count: 'images' },
    prepare({ title, count }) {
      const n = Array.isArray(count) ? count.length : 0;
      return {
        title: title || 'Gallery',
        subtitle: n ? `${n} image${n === 1 ? '' : 's'}` : 'No images',
      };
    },
  },
});
