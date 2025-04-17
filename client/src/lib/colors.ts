// Predefined vector colors (colorblind-friendly)
const VECTOR_COLORS = [
  "#E69F00", // Orange
  "#56B4E9", // Light Blue
  "#009E73", // Green
  "#F0E442", // Yellow
  "#0072B2", // Dark Blue
  "#D55E00", // Red
  "#CC79A7", // Pink
  "#999999", // Grey
];

/**
 * Get a random color from the predefined list
 * @returns A color string in hex format
 */
export function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * VECTOR_COLORS.length);
  return VECTOR_COLORS[randomIndex];
}

/**
 * Get the next available color that hasn't been used recently
 * @param usedColors Array of colors that have been used
 * @returns A color string in hex format
 */
export function getNextColor(usedColors: string[] = []): string {
  // If all colors have been used, just return a random one
  if (usedColors.length >= VECTOR_COLORS.length) {
    return getRandomColor();
  }
  
  // Find the first unused color
  const availableColor = VECTOR_COLORS.find(color => !usedColors.includes(color));
  return availableColor || getRandomColor();
}

/**
 * Create a lighter version of a color for transformed vectors
 * @param hexColor The original color in hex format
 * @returns A lighter version of the color
 */
export function getLighterColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Make it lighter
  const lighterR = Math.min(255, r + 80);
  const lighterG = Math.min(255, g + 80);
  const lighterB = Math.min(255, b + 80);
  
  // Convert back to hex
  return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
}
