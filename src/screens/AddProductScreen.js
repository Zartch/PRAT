import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/config';
import { createProduct } from '../services/productService';

export default function AddProductScreen({ navigation }) {
  const [codi, setCodi] = useState('');
  const [nom, setNom] = useState('');
  const [preu, setPreu] = useState('');
  const [unitat, setUnitat] = useState('unitat');
  const [descripcio, setDescripcio] = useState('');
  const [families, setFamilies] = useState('');
  const [categories, setCategories] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!nom.trim()) {
      Alert.alert('Error', 'El nom del producte és obligatori');
      return;
    }

    try {
      setSaving(true);

      const preuNum = preu
        ? parseFloat(preu.replace(',', '.'))
        : 0;

      if (preu && isNaN(preuNum)) {
        Alert.alert('Error', 'El preu no és vàlid');
        setSaving(false);
        return;
      }

      const productId = await createProduct({
        codi: codi.trim(),
        nom: nom.trim(),
        preu: preuNum,
        unitat,
        descripcio: descripcio.trim(),
        families: families
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        categories: categories
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      });

      Alert.alert(
        'Producte creat',
        `"${nom.trim()}" s'ha afegit correctament`,
        [
          {
            text: 'Fer foto',
            onPress: () => navigation.replace('Camera', { productId }),
          },
          {
            text: 'Afegir un altre',
            onPress: () => resetForm(),
          },
          {
            text: 'Tornar al catàleg',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', `No s'ha pogut guardar el producte: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setCodi('');
    setNom('');
    setPreu('');
    setUnitat('unitat');
    setDescripcio('');
    setFamilies('');
    setCategories('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.form}>
        {/* Product Code */}
        <View style={styles.field}>
          <Text style={styles.label}>Codi del producte</Text>
          <TextInput
            style={styles.input}
            value={codi}
            onChangeText={setCodi}
            placeholder="Ex: 1001"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>

        {/* Product Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Nom del producte <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Ex: Pa de pagès"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Price */}
        <View style={styles.fieldRow}>
          <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Preu</Text>
            <TextInput
              style={styles.input}
              value={preu}
              onChangeText={setPreu}
              placeholder="Ex: 2,50"
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Unitat</Text>
            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[styles.unitButton, unitat === 'unitat' && styles.unitButtonActive]}
                onPress={() => setUnitat('unitat')}
              >
                <Text style={[
                  styles.unitButtonText,
                  unitat === 'unitat' && styles.unitButtonTextActive,
                ]}>
                  Unitat
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitButton, unitat === 'kg' && styles.unitButtonActive]}
                onPress={() => setUnitat('kg')}
              >
                <Text style={[
                  styles.unitButtonText,
                  unitat === 'kg' && styles.unitButtonTextActive,
                ]}>
                  Kg
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Families */}
        <View style={styles.field}>
          <Text style={styles.label}>Famílies</Text>
          <TextInput
            style={styles.input}
            value={families}
            onChangeText={setFamilies}
            placeholder="Ex: Pans, Artesania (separats per coma)"
            placeholderTextColor={COLORS.textLight}
          />
          <Text style={styles.hint}>Separar amb comes per assignar múltiples famílies</Text>
        </View>

        {/* Categories */}
        <View style={styles.field}>
          <Text style={styles.label}>Categories</Text>
          <TextInput
            style={styles.input}
            value={categories}
            onChangeText={setCategories}
            placeholder="Ex: Tradicional, Ecològic (separats per coma)"
            placeholderTextColor={COLORS.textLight}
          />
          <Text style={styles.hint}>Separar amb comes per assignar múltiples categories</Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Descripció</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descripcio}
            onChangeText={setDescripcio}
            placeholder="Descripció del producte..."
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons name="checkmark-circle" size={22} color={COLORS.textOnPrimary} />
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardant...' : 'Guardar producte'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  unitSelector: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  unitButtonTextActive: {
    color: COLORS.textOnPrimary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
});
