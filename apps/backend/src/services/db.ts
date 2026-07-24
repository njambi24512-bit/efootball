import { Pool } from 'pg';

let pool: Pool | null = null;

export async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  pool = new Pool({ connectionString: databaseUrl });
  await pool.query('SELECT 1');
  console.log('Database connected');
}

export function getDb() {
  if (!pool) {
    throw new Error('DB is not initialized');
  }
  return pool;
}
