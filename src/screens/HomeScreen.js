import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../utils/config';
import {
  getAllProducts,
  getProductsByFamily,
  getAllFamilies,
  searchProducts,
} from '../services/productService';
import { initPhotosDirectory } from '../services/photoService';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedFamily, searchQuery])
  );

  useEffect(() => {
    initPhotosDirectory();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const allFamilies = await getAllFamilies();
      setFamilies(allFamilies);

      let productList;
      if (searchQuery.trim()) {
        productList = await searchProducts(searchQuery.trim());
      } else if (selectedFamily) {
        productList = await getProductsByFamily(selectedFamily);
      } else {
        productList = await getAllProducts();
      }
      setProducts(productList);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function handleProductPress(product) {
    navigation.navigate('ProductDetail', { productId: product.id });
  }

  function handlePhotoPress(product) {
    navigation.navigate('Camera', { productId: product.id });
  }

  function renderProduct({ item }) {
    return (
      <ProductCard
        product={item}
        onPress={handleProductPress}
        onPhotoPress={handlePhotoPress}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cercar productes..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Family filter */}
      {families.length > 0 && !searchQuery && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.familyFilter}
          contentContainerStyle={styles.familyFilterContent}
        >
          <TouchableOpacity
            style={[styles.familyChip, !selectedFamily && styles.familyChipActive]}
            onPress={() => setSelectedFamily(null)}
          >
            <Text style={[styles.familyChipText, !selectedFamily && styles.familyChipTextActive]}>
              Tots
            </Text>
          </TouchableOpacity>
          {families.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.familyChip, selectedFamily === f.nom && styles.familyChipActive]}
              onPress={() => setSelectedFamily(selectedFamily === f.nom ? null : f.nom)}
            >
              <Text style={[
                styles.familyChipText,
                selectedFamily === f.nom && styles.familyChipTextActive,
              ]}>
                {f.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Product count */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          {products.length} producte{products.length !== 1 ? 's' : ''}
          {selectedFamily ? ` en ${selectedFamily}` : ''}
        </Text>
      </View>

      {/* Product grid */}
      {products.length === 0 && !loading ? (
        <EmptyState
          icon="basket-outline"
          title="No hi ha productes"
          message="Afegeix productes manualment o importa un fitxer CSV per començar"
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: 12,
    marginBottom: 0,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  familyFilter: {
    maxHeight: 48,
    marginTop: 10,
  },
  familyFilterContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  familyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  familyChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  familyChipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  familyChipTextActive: {
    color: COLORS.textOnPrimary,
  },
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
});
