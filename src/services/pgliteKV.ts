import { PGlite } from '@electric-sql/pglite'
import type { StateStorage } from 'zustand/middleware'

// Database persisted in IndexedDB
export const db = new PGlite('idb://zustand-kvdb')

// Initialize key-value table
await db.exec(`
  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`)

export const kvStore = {
  async get(key: string): Promise<string | null> {
    const result = await db.query("SELECT value FROM kv_store WHERE key = $1", [key])
    return (result.rows[0] as { value: string })?.value ?? null;
  },
  async set(key: string, value: string): Promise<void> {
    await db.query(
      "INSERT INTO kv_store (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [key, value]
    )
  },
  async remove(key: string): Promise<void> {
    await db.query("DELETE FROM kv_store WHERE key = $1", [key])
  }
}

export const pgliteStorage: StateStorage = {
  getItem: async (name: string) => await kvStore.get(name),
  setItem: async (name: string, value: string) => kvStore.set(name, value),
  removeItem: async (name: string) => kvStore.remove(name),
}