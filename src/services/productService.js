import { getDatabase } from '../database/database';

// Get or create a family by name, returns its id
async function getOrCreateFamilia(db, nom) {
  const trimmed = nom.trim();
  if (!trimmed) return null;

  const existing = await db.getFirstAsync(
    'SELECT id FROM familia WHERE nom = ?',
    [trimmed]
  );
  if (existing) return existing.id;

  const result = await db.runAsync(
    'INSERT INTO familia (nom) VALUES (?)',
    [trimmed]
  );
  return result.lastInsertRowId;
}

// Get or create a category by name, returns its id
async function getOrCreateCategoria(db, nom) {
  const trimmed = nom.trim();
  if (!trimmed) return null;

  const existing = await db.getFirstAsync(
    'SELECT id FROM categoria WHERE nom = ?',
    [trimmed]
  );
  if (existing) return existing.id;

  const result = await db.runAsync(
    'INSERT INTO categoria (nom) VALUES (?)',
    [trimmed]
  );
  return result.lastInsertRowId;
}

// Create a new product
export async function createProduct({ codi, nom, preu, unitat, descripcio, families, categories }) {
  const db = await getDatabase();

  // Check if product code already exists
  if (codi) {
    const existing = await db.getFirstAsync(
      'SELECT id FROM producte WHERE codi = ?',
      [codi]
    );
    if (existing) {
      // Update existing product
      return updateProduct(existing.id, { codi, nom, preu, unitat, descripcio, families, categories });
    }
  }

  const result = await db.runAsync(
    'INSERT INTO producte (codi, nom, preu, unitat, descripcio) VALUES (?, ?, ?, ?, ?)',
    [codi || null, nom, preu || 0, unitat || 'unitat', descripcio || '']
  );

  const productId = result.lastInsertRowId;

  // Link families
  if (families && families.length > 0) {
    for (const familyName of families) {
      const familyId = await getOrCreateFamilia(db, familyName);
      if (familyId) {
        await db.runAsync(
          'INSERT OR IGNORE INTO producte_familia (producte_id, familia_id) VALUES (?, ?)',
          [productId, familyId]
        );
      }
    }
  }

  // Link categories
  if (categories && categories.length > 0) {
    for (const catName of categories) {
      const catId = await getOrCreateCategoria(db, catName);
      if (catId) {
        await db.runAsync(
          'INSERT OR IGNORE INTO producte_categoria (producte_id, categoria_id) VALUES (?, ?)',
          [productId, catId]
        );
      }
    }
  }

  return productId;
}

// Update an existing product
export async function updateProduct(id, { codi, nom, preu, unitat, descripcio, families, categories }) {
  const db = await getDatabase();

  await db.runAsync(
    'UPDATE producte SET codi = ?, nom = ?, preu = ?, unitat = ?, descripcio = ? WHERE id = ?',
    [codi || null, nom, preu || 0, unitat || 'unitat', descripcio || '', id]
  );

  // Re-link families
  if (families !== undefined) {
    await db.runAsync('DELETE FROM producte_familia WHERE producte_id = ?', [id]);
    if (families && families.length > 0) {
      for (const familyName of families) {
        const familyId = await getOrCreateFamilia(db, familyName);
        if (familyId) {
          await db.runAsync(
            'INSERT OR IGNORE INTO producte_familia (producte_id, familia_id) VALUES (?, ?)',
            [id, familyId]
          );
        }
      }
    }
  }

  // Re-link categories
  if (categories !== undefined) {
    await db.runAsync('DELETE FROM producte_categoria WHERE producte_id = ?', [id]);
    if (categories && categories.length > 0) {
      for (const catName of categories) {
        const catId = await getOrCreateCategoria(db, catName);
        if (catId) {
          await db.runAsync(
            'INSERT OR IGNORE INTO producte_categoria (producte_id, categoria_id) VALUES (?, ?)',
            [id, catId]
          );
        }
      }
    }
  }

  return id;
}

// Update product photo path
export async function updateProductPhoto(id, photoPath) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE producte SET foto_path = ? WHERE id = ?',
    [photoPath, id]
  );
}

// Get all products with their families and categories
export async function getAllProducts() {
  const db = await getDatabase();

  const products = await db.getAllAsync(`
    SELECT p.*,
      GROUP_CONCAT(DISTINCT f.nom) as families,
      GROUP_CONCAT(DISTINCT c.nom) as categories
    FROM producte p
    LEFT JOIN producte_familia pf ON p.id = pf.producte_id
    LEFT JOIN familia f ON pf.familia_id = f.id
    LEFT JOIN producte_categoria pc ON p.id = pc.producte_id
    LEFT JOIN categoria c ON pc.categoria_id = c.id
    GROUP BY p.id
    ORDER BY p.nom
  `);

  return products.map(p => ({
    ...p,
    families: p.families ? p.families.split(',') : [],
    categories: p.categories ? p.categories.split(',') : [],
  }));
}

// Get products grouped by category
export async function getProductsByCategory() {
  const products = await getAllProducts();
  const grouped = {};

  for (const product of products) {
    if (product.categories.length === 0) {
      if (!grouped['Sense categoria']) grouped['Sense categoria'] = [];
      grouped['Sense categoria'].push(product);
    } else {
      for (const cat of product.categories) {
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(product);
      }
    }
  }

  return grouped;
}

// Get products by family
export async function getProductsByFamily(familyName) {
  const db = await getDatabase();

  const products = await db.getAllAsync(`
    SELECT p.*,
      GROUP_CONCAT(DISTINCT f.nom) as families,
      GROUP_CONCAT(DISTINCT c.nom) as categories
    FROM producte p
    JOIN producte_familia pf ON p.id = pf.producte_id
    JOIN familia f ON pf.familia_id = f.id
    LEFT JOIN producte_categoria pc ON p.id = pc.producte_id
    LEFT JOIN categoria c ON pc.categoria_id = c.id
    WHERE f.nom = ?
    GROUP BY p.id
    ORDER BY p.nom
  `, [familyName]);

  return products.map(p => ({
    ...p,
    families: p.families ? p.families.split(',') : [],
    categories: p.categories ? p.categories.split(',') : [],
  }));
}

// Get a single product by id
export async function getProductById(id) {
  const db = await getDatabase();

  const product = await db.getFirstAsync(`
    SELECT p.*,
      GROUP_CONCAT(DISTINCT f.nom) as families,
      GROUP_CONCAT(DISTINCT c.nom) as categories
    FROM producte p
    LEFT JOIN producte_familia pf ON p.id = pf.producte_id
    LEFT JOIN familia f ON pf.familia_id = f.id
    LEFT JOIN producte_categoria pc ON p.id = pc.producte_id
    LEFT JOIN categoria c ON pc.categoria_id = c.id
    WHERE p.id = ?
    GROUP BY p.id
  `, [id]);

  if (!product) return null;

  return {
    ...product,
    families: product.families ? product.families.split(',') : [],
    categories: product.categories ? product.categories.split(',') : [],
  };
}

// Delete a product
export async function deleteProduct(id) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM producte WHERE id = ?', [id]);
}

// Get all families
export async function getAllFamilies() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM familia ORDER BY nom');
}

// Get all categories
export async function getAllCategories() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM categoria ORDER BY nom');
}

// Search products
export async function searchProducts(query) {
  const db = await getDatabase();
  const searchTerm = `%${query}%`;

  const products = await db.getAllAsync(`
    SELECT p.*,
      GROUP_CONCAT(DISTINCT f.nom) as families,
      GROUP_CONCAT(DISTINCT c.nom) as categories
    FROM producte p
    LEFT JOIN producte_familia pf ON p.id = pf.producte_id
    LEFT JOIN familia f ON pf.familia_id = f.id
    LEFT JOIN producte_categoria pc ON p.id = pc.producte_id
    LEFT JOIN categoria c ON pc.categoria_id = c.id
    WHERE p.nom LIKE ? OR p.codi LIKE ? OR p.descripcio LIKE ?
    GROUP BY p.id
    ORDER BY p.nom
  `, [searchTerm, searchTerm, searchTerm]);

  return products.map(p => ({
    ...p,
    families: p.families ? p.families.split(',') : [],
    categories: p.categories ? p.categories.split(',') : [],
  }));
}

// Get product count
export async function getProductCount() {
  const db = await getDatabase();
  const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM producte');
  return result.count;
}
