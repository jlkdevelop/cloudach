import { Pool } from 'pg';

// Singleton pool — reused across hot-reloads in dev
let pool;

export function getDb() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Add it to your Vercel environment variables. ' +
        'See infra/db/schema.sql to provision a Neon database.'
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=require') || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pool.on('error', (err) => {
      console.error('Postgres pool error:', err.message);
      // Reset pool so next request gets a fresh one
      pool = null;
    });
  }
  return pool;
}
