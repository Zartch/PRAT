import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { CameraView } from 'expo-camera';
import {
  PHOTOS_BASE_DIR,
  getFamilyPhotoDir,
  getProductPhotoFilename,
  ensureDirectoryExists,
} from '../utils/config';
import { updateProductPhoto } from './productService';

// Initialize the photos directory structure
export async function initPhotosDirectory() {
  await ensureDirectoryExists(PHOTOS_BASE_DIR);
}

// Save a photo for a product, organizing it by family
// Returns the saved photo path
export async function saveProductPhoto(product, photoUri) {
  // Determine target directory based on product family
  let targetDir = PHOTOS_BASE_DIR;
  if (product.families && product.families.length > 0) {
    // Use the first family as the primary folder
    targetDir = getFamilyPhotoDir(product.families[0]);
  }

  await ensureDirectoryExists(targetDir);

  // Generate filename
  const filename = getProductPhotoFilename(
    product.codi || product.id,
    product.nom
  );
  const targetPath = `${targetDir}${filename}`;

  // Copy the photo to the organized location
  await FileSystem.copyAsync({
    from: photoUri,
    to: targetPath,
  });

  // Update the product record with the photo path
  await updateProductPhoto(product.id, targetPath);

  // Also save copies in other family folders if product belongs to multiple families
  if (product.families && product.families.length > 1) {
    for (let i = 1; i < product.families.length; i++) {
      const extraDir = getFamilyPhotoDir(product.families[i]);
      await ensureDirectoryExists(extraDir);
      const extraPath = `${extraDir}${filename}`;
      try {
        await FileSystem.copyAsync({
          from: photoUri,
          to: extraPath,
        });
      } catch (e) {
        // Non-critical: log but don't fail
        console.warn(`Could not copy photo to family folder ${product.families[i]}:`, e);
      }
    }
  }

  return targetPath;
}

// Take a photo using the device camera (via ImagePicker for simplicity)
export async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Es necessita permís per accedir a la càmera');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled) return null;

  return result.assets[0].uri;
}

// Pick a photo from the gallery
export async function pickPhotoFromGallery() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Es necessita permís per accedir a la galeria');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled) return null;

  return result.assets[0].uri;
}

// Check if a product has a photo
export async function hasProductPhoto(product) {
  if (!product.foto_path) return false;
  const info = await FileSystem.getInfoAsync(product.foto_path);
  return info.exists;
}

// Get photo URI for display (returns null if no photo)
export async function getProductPhotoUri(product) {
  if (!product.foto_path) return null;
  const info = await FileSystem.getInfoAsync(product.foto_path);
  if (info.exists) return product.foto_path;
  return null;
}

// Delete a product's photo
export async function deleteProductPhoto(product) {
  if (!product.foto_path) return;
  const info = await FileSystem.getInfoAsync(product.foto_path);
  if (info.exists) {
    await FileSystem.deleteAsync(product.foto_path);
  }
  await updateProductPhoto(product.id, '');
}

// List all photos organized by family folder
export async function listPhotosByFamily() {
  const result = {};
  await ensureDirectoryExists(PHOTOS_BASE_DIR);

  const items = await FileSystem.readDirectoryAsync(PHOTOS_BASE_DIR);

  for (const item of items) {
    const itemPath = `${PHOTOS_BASE_DIR}${item}`;
    const info = await FileSystem.getInfoAsync(itemPath);

    if (info.isDirectory) {
      const photos = await FileSystem.readDirectoryAsync(itemPath);
      result[item] = photos.filter(f =>
        /\.(jpg|jpeg|png|gif)$/i.test(f)
      );
    }
  }

  // Also list photos in root (no family)
  const rootItems = await FileSystem.readDirectoryAsync(PHOTOS_BASE_DIR);
  const rootPhotos = rootItems.filter(f =>
    /\.(jpg|jpeg|png|gif)$/i.test(f)
  );
  if (rootPhotos.length > 0) {
    result['_sense_familia'] = rootPhotos;
  }

  return result;
}
