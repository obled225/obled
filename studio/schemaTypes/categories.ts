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
      description: 'Optional: Hex color code for the badge (e.g., "#EF4444")',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true; // Optional field
          // Validate hex color format
          const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
          return hexColorRegex.test(value)
            ? true
            : 'Please enter a valid hex color code (e.g., #EF4444)';
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
