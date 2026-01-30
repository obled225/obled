import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'announcementBar',
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
              type: 'string',
              description: 'The text to display in the announcement',
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
              return {
                title: title || 'Untitled announcement',
                subtitle: subtitle ? `Link: ${subtitle}` : 'No link',
              };
            },
          },
        },
      ],
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