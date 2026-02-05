import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/config';
import { getProductPhotoUri } from '../services/photoService';

export default function ProductCard({ product, onPress, onPhotoPress }) {
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    loadPhoto();
  }, [product.foto_path]);

  async function loadPhoto() {
    const uri = await getProductPhotoUri(product);
    setPhotoUri(uri);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)} activeOpacity={0.7}>
      <View style={styles.photoContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <TouchableOpacity
            style={styles.noPhoto}
            onPress={() => onPhotoPress && onPhotoPress(product)}
          >
            <Ionicons name="camera-outline" size={32} color={COLORS.textLight} />
            <Text style={styles.noPhotoText}>Afegir foto</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.info}>
        {product.codi ? (
          <Text style={styles.code}>{product.codi}</Text>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>{product.nom}</Text>
        <Text style={styles.price}>
          {product.preu.toFixed(2)} EUR/{product.unitat === 'kg' ? 'kg' : 'ut'}
        </Text>
        {product.families && product.families.length > 0 && (
          <Text style={styles.family} numberOfLines={1}>
            {product.families.join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F0EB',
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
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
  },
  info: {
    padding: 10,
  },
  code: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  family: {
    fontSize: 10,
    color: COLORS.accent,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
