import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const sqlite = openDatabaseSync('jobtracker.db', { enableChangeListener: true });
sqlite.execSync('PRAGMA journal_mode = WAL;');

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
  )
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL
  )
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#0F766E',
    icon TEXT NOT NULL DEFAULT '📁'
  )
`);

try {
  sqlite.execSync(`ALTER TABLE categories ADD COLUMN icon TEXT NOT NULL DEFAULT '📁'`);
} catch {
  // column already exists
}

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Applied',
    category_id INTEGER NOT NULL,
    notes TEXT
  )
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS application_status_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT
  )
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    count INTEGER NOT NULL,
    category_id INTEGER
  )
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

export const db = drizzle(sqlite);
