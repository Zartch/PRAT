import * as FileSystem from 'expo-file-system';

// Base directory for product photos
export const PHOTOS_BASE_DIR = `${FileSystem.documentDirectory}fotos/`;

// Get the photo directory for a specific family
export function getFamilyPhotoDir(familyName) {
  const safeName = familyName
    .toLowerCase()
    .replace(/[^a-z0-9àèéíòóúüçñ]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `${PHOTOS_BASE_DIR}${safeName}/`;
}

// Get the expected photo filename for a product
export function getProductPhotoFilename(productCode, productName) {
  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9àèéíòóúüçñ]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `${productCode}_${safeName}.jpg`;
}

// Ensure a directory exists
export async function ensureDirectoryExists(dirPath) {
  const dirInfo = await FileSystem.getInfoAsync(dirPath);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
  }
}

// Supported image extensions
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

// App colors
export const COLORS = {
  primary: '#8B4513',      // Saddle brown (bakery theme)
  primaryLight: '#A0522D',  // Sienna
  primaryDark: '#654321',   // Dark brown
  accent: '#D2691E',        // Chocolate
  background: '#FFF8F0',    // Warm white
  surface: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  textOnPrimary: '#FFFFFF',
  border: '#E0D5C8',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
};
