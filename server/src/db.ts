import { Pool } from 'pg';
import 'dotenv/config';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initializeDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '',
      comment TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL, archived_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, number TEXT NOT NULL,
      contract_number TEXT, invoice_number TEXT, status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL,
      deadline TIMESTAMPTZ NOT NULL, comment TEXT NOT NULL DEFAULT '', items JSONB NOT NULL DEFAULT '[]'::jsonb, archived_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, date TIMESTAMPTZ NOT NULL,
      amount NUMERIC(12, 2) NOT NULL, type TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS values_store (key TEXT PRIMARY KEY, value JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS sync_devices (id TEXT PRIMARY KEY, name TEXT NOT NULL, last_seen_at TIMESTAMPTZ NOT NULL);
    CREATE TABLE IF NOT EXISTS change_history (id TEXT PRIMARY KEY, entity TEXT NOT NULL, entity_id TEXT NOT NULL, operation TEXT NOT NULL, changed_at TIMESTAMPTZ NOT NULL, device_name TEXT NOT NULL, summary TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sync_conflicts (id TEXT PRIMARY KEY, entity TEXT NOT NULL, entity_id TEXT NOT NULL, local_version TEXT NOT NULL, remote_version TEXT NOT NULL, detected_at TIMESTAMPTZ NOT NULL);
  `);
}
