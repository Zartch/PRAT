import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { createProduct } from './productService';

// Parse a CSV line respecting quoted fields
function parseCsvLine(line, separator = ';') {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Parse price string (handles comma as decimal separator)
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Map CSV headers to expected field names
function mapHeaders(headers) {
  const mapping = {};
  const headerMap = {
    'codi': 'codi',
    'codigo': 'codi',
    'code': 'codi',
    'nom': 'nom',
    'nombre': 'nom',
    'name': 'nom',
    'preu': 'preu',
    'precio': 'preu',
    'price': 'preu',
    'pvp': 'preu',
    'familia': 'familia',
    'family': 'familia',
    'categoria': 'categoria',
    'category': 'categoria',
    'unitatmesura': 'unitat',
    'unitat': 'unitat',
    'unidad': 'unitat',
    'unit': 'unitat',
    'descripcio': 'descripcio',
    'descripcion': 'descripcio',
    'description': 'descripcio',
  };

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim().replace(/[^a-z]/g, '');
    if (headerMap[normalized]) {
      mapping[headerMap[normalized]] = index;
    }
  });

  return mapping;
}

// Pick a CSV file using document picker
export async function pickCsvFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'text/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const file = result.assets[0];
  return {
    uri: file.uri,
    name: file.name,
    size: file.size,
  };
}

// Import products from a CSV file
export async function importCsvFile(fileUri, onProgress) {
  const content = await FileSystem.readAsStringAsync(fileUri);
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      error: 'El fitxer CSV no conté dades suficients (mínim capçalera + 1 fila)',
      imported: 0,
      errors: [],
    };
  }

  // Parse header
  const headers = parseCsvLine(lines[0]);
  const mapping = mapHeaders(headers);

  if (mapping.nom === undefined) {
    return {
      success: false,
      error: 'No s\'ha trobat la columna de nom del producte. Columnes trobades: ' + headers.join(', '),
      imported: 0,
      errors: [],
    };
  }

  const total = lines.length - 1;
  let imported = 0;
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const fields = parseCsvLine(lines[i]);
      const nom = mapping.nom !== undefined ? fields[mapping.nom] : '';

      if (!nom) {
        errors.push({ row: i + 1, error: 'Nom del producte buit' });
        continue;
      }

      const productData = {
        codi: mapping.codi !== undefined ? fields[mapping.codi] || '' : '',
        nom: nom,
        preu: mapping.preu !== undefined ? parsePrice(fields[mapping.preu]) : 0,
        unitat: mapping.unitat !== undefined ? (fields[mapping.unitat] || 'unitat') : 'unitat',
        descripcio: mapping.descripcio !== undefined ? (fields[mapping.descripcio] || '') : '',
        families: mapping.familia !== undefined
          ? (fields[mapping.familia] || '').split(',').map(s => s.trim()).filter(Boolean)
          : [],
        categories: mapping.categoria !== undefined
          ? (fields[mapping.categoria] || '').split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };

      await createProduct(productData);
      imported++;

      if (onProgress) {
        onProgress({ current: i, total, imported, productName: nom });
      }
    } catch (err) {
      errors.push({ row: i + 1, error: err.message });
    }
  }

  return {
    success: true,
    imported,
    total,
    errors,
  };
}
