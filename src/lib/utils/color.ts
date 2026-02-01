/**
 * Color utility functions for normalizing and processing CSS color names
 */

/**
 * Normalizes color names to CSS color values
 * Supports: CSS named colors (black, white), French names (noir, blanc), and special values (mix)
 * @param name - The color name to normalize
 * @returns Normalized color name for CSS use
 */
export function normalizeColorName(name: string): string {
  const normalized = name.trim().toLowerCase();
  
  // Special case: mix color
  if (normalized === 'mix') {
    return 'mix';
  }
  
  // Map common text values to CSS color names for consistency
  const colorMap: Record<string, string> = {
    'noir': 'black',
    'blanc': 'white',
    'rouge': 'red',
    'bleu': 'blue',
    'vert': 'green',
    'jaune': 'yellow',
    'gris': 'gray',
  };
  
  // Return mapped color name or original name (CSS will handle valid named colors)
  return colorMap[normalized] || normalized;
}

/**
 * Gets a lighter border color for badges based on the main color name
 * Maps common CSS color names to lighter border colors
 * @param colorName - The CSS color name
 * @returns RGB color string for the border
 */
export function getBorderColor(colorName: string): string {
  // First normalize the color name
  const normalized = normalizeColorName(colorName);
  
  // Map normalized colors to lighter border colors
  const colorMap: Record<string, string> = {
    'red': 'rgb(239, 68, 68)', // lighter red
    'blue': 'rgb(59, 130, 246)', // lighter blue
    'green': 'rgb(34, 197, 94)', // lighter green
    'orange': 'rgb(249, 115, 22)', // lighter orange
    'yellow': 'rgb(234, 179, 8)', // lighter yellow
    'purple': 'rgb(168, 85, 247)', // lighter purple
    'pink': 'rgb(236, 72, 153)', // lighter pink
    'cyan': 'rgb(6, 182, 212)', // lighter cyan
    'indigo': 'rgb(99, 102, 241)', // lighter indigo
    'teal': 'rgb(20, 184, 166)', // lighter teal
    'gray': 'rgb(156, 163, 175)', // lighter gray
    'grey': 'rgb(156, 163, 175)', // lighter grey
    'black': 'rgb(75, 85, 99)', // lighter black (dark gray)
    'white': 'rgb(229, 231, 235)', // darker white (light gray)
  };
  
  return colorMap[normalized] || normalized; // Fallback to normalized color (CSS will handle valid named colors)
}
