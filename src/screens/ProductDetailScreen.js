import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../utils/config';
import { getProductById, deleteProduct } from '../services/productService';
import { getProductPhotoUri, deleteProductPhoto } from '../services/photoService';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadProduct();
    }, [productId])
  );

  async function loadProduct() {
    const p = await getProductById(productId);
    if (p) {
      setProduct(p);
      const uri = await getProductPhotoUri(p);
      setPhotoUri(uri);
    }
  }

  function handleTakePhoto() {
    navigation.navigate('Camera', { productId });
  }

  function handleEdit() {
    navigation.navigate('EditProduct', { productId });
  }

  function handleDelete() {
    Alert.alert(
      'Eliminar producte',
      `Estàs segur que vols eliminar "${product.nom}"?`,
      [
        { text: 'Cancel·lar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProductPhoto(product);
              await deleteProduct(product.id);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', `No s'ha pogut eliminar el producte: ${err.message}`);
            }
          },
        },
      ]
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Carregant producte...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photo */}
      <TouchableOpacity style={styles.photoContainer} onPress={handleTakePhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.noPhoto}>
            <Ionicons name="camera-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.noPhotoText}>Toca per fer una foto</Text>
          </View>
        )}
        <View style={styles.photoOverlay}>
          <Ionicons name="camera" size={22} color="white" />
        </View>
      </TouchableOpacity>

      {/* Product info */}
      <View style={styles.infoSection}>
        {product.codi ? (
          <Text style={styles.code}>Codi: {product.codi}</Text>
        ) : null}
        <Text style={styles.name}>{product.nom}</Text>
        <Text style={styles.price}>
          {product.preu.toFixed(2)} EUR / {product.unitat === 'kg' ? 'kg' : 'unitat'}
        </Text>
      </View>

      {/* Families */}
      {product.families && product.families.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Famílies</Text>
          <View style={styles.chipContainer}>
            {product.families.map((f, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Categories */}
      {product.categories && product.categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.chipContainer}>
            {product.categories.map((c, i) => (
              <View key={i} style={[styles.chip, styles.chipCategory]}>
                <Text style={[styles.chipText, styles.chipCategoryText]}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Description */}
      {product.descripcio ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripció</Text>
          <Text style={styles.description}>{product.descripcio}</Text>
        </View>
      ) : null}

      {/* Photo location info */}
      {product.foto_path ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicació de la foto</Text>
          <View style={styles.pathContainer}>
            <Ionicons name="folder-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.pathText} numberOfLines={2}>
              {product.foto_path.split('/').slice(-2).join('/')}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Creation date */}
      <View style={styles.section}>
        <Text style={styles.dateText}>
          Creat: {product.date_created || 'Desconegut'}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
          <Ionicons name="camera" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>
            {photoUri ? 'Canviar foto' : 'Fer foto'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textLight,
    fontSize: 15,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F0EB',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noPhoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  code: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 8,
  },
  section: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textOnPrimary,
    fontWeight: '500',
  },
  chipCategory: {
    backgroundColor: COLORS.accent,
  },
  chipCategoryText: {
    color: COLORS.textOnPrimary,
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pathText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: 'monospace',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
  },
});
