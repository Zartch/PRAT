import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDatabase() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('prat.db');
  await initDatabase(db);
  return db;
}

async function initDatabase(database) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS familia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS categoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS producte (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codi TEXT UNIQUE,
      nom TEXT NOT NULL,
      preu REAL DEFAULT 0,
      unitat TEXT DEFAULT 'unitat',
      descripcio TEXT DEFAULT '',
      foto_path TEXT DEFAULT '',
      date_created TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS producte_familia (
      producte_id INTEGER NOT NULL,
      familia_id INTEGER NOT NULL,
      PRIMARY KEY (producte_id, familia_id),
      FOREIGN KEY (producte_id) REFERENCES producte(id) ON DELETE CASCADE,
      FOREIGN KEY (familia_id) REFERENCES familia(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS producte_categoria (
      producte_id INTEGER NOT NULL,
      categoria_id INTEGER NOT NULL,
      PRIMARY KEY (producte_id, categoria_id),
      FOREIGN KEY (producte_id) REFERENCES producte(id) ON DELETE CASCADE,
      FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
    );
  `);
}

export async function closeDatabase() {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
