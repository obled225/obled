import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'categories',
  title: 'Categories',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showInHeader',
      title: 'Show in header',
      type: 'boolean',
      description: 'If true, this category will appear in the main navigation menu (max 3 allowed)',
      initialValue: false,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'badgeText',
      title: 'Badge Text',
      type: 'string',
      description: 'Optional: Text to display on badge (e.g., "HOT", "EXCLUSIVE")',
    }),
    defineField({
      name: 'badgeColor',
      title: 'Badge Color',
      type: 'string',
      description: 'Optional: CSS color name for the badge (e.g., "red", "blue", "green", "orange"). The color name automatically determines the badge color display.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
