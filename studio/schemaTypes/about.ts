import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'about',
  title: 'About (page)',
  type: 'document',
  fields: [
    defineField({
      name: 'heroVideo',
      title: 'Hero video',
      type: 'file',
      description: 'Optional video at the top of the about page',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero title',
      type: 'string',
      description: 'Main title below the hero (e.g. brand tagline)',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero subtitle',
      type: 'string',
      description: 'Short line under the title (e.g. Fabriqué en Côte d’Ivoire 🇨🇮)',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero description',
      type: 'text',
      description: 'Paragraph under the subtitle. Supports multiple lines.',
      rows: 4,
    }),
    defineField({
      name: 'sections',
      title: 'Page sections',
      type: 'array',
      description: 'Add and order sections. Each section has a title, optional subtitle, rich text body and optional images.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Section title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'subtitle',
              title: 'Subtitle',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Content',
              type: 'array',
              of: [
                {
                  type: 'block',
                  marks: {
                    decorators: [
                      {title: 'Strong', value: 'strong'},
                      {title: 'Emphasis', value: 'em'},
                    ],
                    annotations: [],
                  },
                  styles: [
                    {title: 'Normal', value: 'normal'},
                    {title: 'H2', value: 'h2'},
                    {title: 'H3', value: 'h3'},
                    {title: 'Bullet', value: 'bullet'},
                    {title: 'Number', value: 'number'},
                  ],
                },
              ],
            }),
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'image',
                      title: 'Image',
                      type: 'image',
                      options: {hotspot: true},
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'caption',
                      title: 'Caption',
                      type: 'string',
                    },
                  ],
                  preview: {
                    select: {media: 'image', title: 'caption'},
                    prepare({media, title}) {
                      return {title: title || 'Image', media}
                    },
                  },
                },
              ],
            }),
            defineField({
              name: 'order',
              title: 'Order',
              type: 'number',
              description: 'Lower numbers appear first',
              initialValue: 0,
            }),
          ],
          preview: {
            select: {title: 'title', order: 'order'},
            prepare({title, order}) {
              return {
                title: title || 'Untitled section',
                subtitle: order !== undefined ? `Order: ${order}` : undefined,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      media: 'heroVideo',
    },
    prepare() {
      return {
        title: 'About (page)',
        subtitle: 'Hero and sections',
      }
    },
  },
})
