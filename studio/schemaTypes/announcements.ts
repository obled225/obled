import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'announcements',
  title: 'Announcements',
  type: 'document',
  fields: [
    defineField({
      name: 'announcements',
      title: 'Announcements',
      type: 'array',
      description: 'Up to 3 announcements to display in the header bar of the website',
      validation: (Rule) => Rule.max(3),
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Announcement text',
              type: 'array',
              description: 'The text to display in the announcement (highlight promo codes to make them bold)',
              of: [
                {
                  type: 'block',
                  marks: {
                    decorators: [
                      { title: 'Strong', value: 'strong' },
                      { title: 'Emphasis', value: 'em' },
                    ],
                  },
                },
              ],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'Link (optional)',
              type: 'url',
              description: 'Optional link for the announcement. Leave empty for announcements without links.',
            }),
          ],
          preview: {
            select: {
              title: 'text',
              subtitle: 'link',
            },
            prepare({title, subtitle}) {
              // Extract plain text from Portable Text blocks
              const plainText = title?.[0]?.children?.[0]?.text || 'Untitled announcement';
              return {
                title: plainText,
                subtitle: subtitle ? `Link: ${subtitle}` : 'No link',
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'floatingAnnouncement',
      title: 'Floating Announcement',
      type: 'object',
      description: 'A dismissible floating announcement that appears in the top-right corner of the page. Perfect for limited-time promotions, special offers, or important notifications.',
      fields: [
        defineField({
          name: 'text',
          title: 'Announcement text',
          type: 'array',
          description: 'The text to display in the floating announcement. Highlight promo codes to make them bold. This announcement appears above the content in the top-right corner and can be dismissed by dragging or clicking.',
          of: [
            {
              type: 'block',
              marks: {
                decorators: [
                  { title: 'Strong', value: 'strong' },
                  { title: 'Emphasis', value: 'em' },
                ],
              },
            },
          ],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'isActive',
          title: 'Active',
          type: 'boolean',
          description: 'Enable/disable this floating announcement. When inactive, it won\'t appear on the website.',
          initialValue: false,
        }),
      ],
      preview: {
        select: {
          title: 'text',
          isActive: 'isActive',
        },
        prepare({title, isActive}) {
          // Extract plain text from Portable Text blocks
          const plainText = title?.[0]?.children?.[0]?.text || 'Untitled floating announcement';
          return {
            title: plainText,
            subtitle: isActive ? 'Active' : 'Inactive',
          };
        },
      },
    }),
  ],
  preview: {
    select: {
      announcements: 'announcements',
    },
    prepare({announcements}) {
      const count = announcements?.length || 0;
      return {
        title: 'Announcements',
        subtitle: `${count} announcement${count !== 1 ? 's' : ''}`,
      };
    },
  },
})