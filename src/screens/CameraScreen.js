import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/config';
import { getProductById } from '../services/productService';
import { saveProductPhoto, takePhoto, pickPhotoFromGallery } from '../services/photoService';

export default function CameraScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    const p = await getProductById(productId);
    setProduct(p);
  }

  async function handleTakePhoto() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setPhotoUri(photo.uri);
      } catch (err) {
        Alert.alert('Error', `No s'ha pogut fer la foto: ${err.message}`);
      }
    }
  }

  async function handleUseQuickCamera() {
    try {
      const uri = await takePhoto();
      if (uri) {
        setPhotoUri(uri);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  async function handlePickFromGallery() {
    try {
      const uri = await pickPhotoFromGallery();
      if (uri) {
        setPhotoUri(uri);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleSavePhoto() {
    if (!photoUri || !product) return;

    try {
      setSaving(true);
      const savedPath = await saveProductPhoto(product, photoUri);

      const familyInfo = product.families && product.families.length > 0
        ? `\nCarpeta: ${product.families[0]}`
        : '';

      Alert.alert(
        'Foto guardada',
        `La foto de "${product.nom}" s'ha guardat correctament.${familyInfo}`,
        [
          {
            text: 'Tornar al producte',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', `No s'ha pogut guardar la foto: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function handleRetake() {
    setPhotoUri(null);
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Show photo preview if we have one
  if (photoUri) {
    return (
      <View style={styles.container}>
        <View style={styles.productBanner}>
          <Text style={styles.productBannerText}>
            {product.codi ? `[${product.codi}] ` : ''}{product.nom}
          </Text>
          {product.families && product.families.length > 0 && (
            <Text style={styles.productBannerFamily}>
              Carpeta: {product.families[0]}
            </Text>
          )}
        </View>
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
        </View>
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Ionicons name="refresh" size={22} color={COLORS.primary} />
            <Text style={styles.retakeButtonText}>Repetir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.savePhotoButton, saving && styles.savePhotoButtonDisabled]}
            onPress={handleSavePhoto}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle" size={22} color={COLORS.textOnPrimary} />
            <Text style={styles.savePhotoButtonText}>
              {saving ? 'Guardant...' : 'Guardar foto'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera permission handling
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.permissionText}>
          Es necessita permís per accedir a la càmera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Concedir permís</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionButton, styles.galleryButton]}
          onPress={handlePickFromGallery}
        >
          <Ionicons name="images-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.permissionButtonText, { color: COLORS.primary }]}>
            Seleccionar de la galeria
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <View style={styles.productBanner}>
        <Text style={styles.productBannerText}>
          {product.codi ? `[${product.codi}] ` : ''}{product.nom}
        </Text>
        {product.families && product.families.length > 0 && (
          <Text style={styles.productBannerFamily}>
            Carpeta: {product.families[0]}
          </Text>
        )}
      </View>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.cameraOverlay}>
          {/* Top controls */}
          <View style={styles.cameraTopBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View style={styles.cameraBottomBar}>
            <TouchableOpacity
              style={styles.galleryPickButton}
              onPress={handlePickFromGallery}
            >
              <Ionicons name="images" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={{ width: 50 }} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
  },
  productBanner: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  productBannerText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  productBannerFamily: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  cameraBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  galleryPickButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.background,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  savePhotoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  savePhotoButtonDisabled: {
    opacity: 0.6,
  },
  savePhotoButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  galleryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
