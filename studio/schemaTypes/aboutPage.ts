import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About page content',
  type: 'document',
  fields: [
    defineField({
      name: 'heroVideo',
      title: 'Hero video (Optional)',
      type: 'file',
      description: 'Optional video to display at the top of the about page',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'sectionImages',
      title: 'Section images',
      type: 'array',
      description: 'Images to display in different sections of the about page',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional caption for the image',
            }),
            defineField({
              name: 'position',
              title: 'Section Position',
              type: 'string',
              description: 'Which section should this image appear in?',
              options: {
                list: [
                  {title: 'Who We Are', value: 'whoWeAre'},
                  {title: 'B2B Solutions', value: 'b2b'},
                  {title: 'Production', value: 'production'},
                  {title: 'Responsiveness', value: 'responsiveness'},
                  {title: 'Support', value: 'support'},
                  {title: 'Commitment', value: 'commitment'},
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'caption',
              media: 'image',
              position: 'position',
            },
            prepare({title, media, position}) {
              const positionLabels: Record<string, string> = {
                whoWeAre: 'Who We Are',
                b2b: 'B2B solutions',
                production: 'Production',
                responsiveness: 'Responsiveness',
                support: 'Support',
                commitment: 'Commitment',
              };
              return {
                title: title || 'Untitled Image',
                subtitle: positionLabels[position] || position,
                media,
              };
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
        title: 'About Page',
        subtitle: 'Hero video and section images',
      }
    },
  },
})
