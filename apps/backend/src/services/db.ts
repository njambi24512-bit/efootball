import { Pool } from 'pg';

let pool: Pool | null = null;

export async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return;
  }

  pool = new Pool({ connectionString: databaseUrl });
  await pool.query('SELECT 1');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      username text NOT NULL,
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      platform text NOT NULL,
      region text NOT NULL,
      role text NOT NULL,
      konami_id text,
      konami_verified boolean NOT NULL DEFAULT false,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS verifications (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      konami_id text NOT NULL,
      verification_code text NOT NULL,
      proof_url text,
      status text NOT NULL,
      reviewed_by text,
      reviewed_at text,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS listings (
      id text PRIMARY KEY,
      seller_id text NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      price double precision NOT NULL,
      platform text NOT NULL,
      status text NOT NULL,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS news_items (
      id text PRIMARY KEY,
      title text NOT NULL,
      summary text NOT NULL,
      category text NOT NULL,
      source_url text NOT NULL,
      published_by text NOT NULL,
      published_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id text PRIMARY KEY,
      name text NOT NULL,
      format text NOT NULL,
      max_participants integer NOT NULL,
      start_date text NOT NULL,
      created_by text NOT NULL,
      status text NOT NULL,
      created_at text NOT NULL,
      updated_at text NOT NULL
    )
  `);

  await pool.query(`
    ALTER TABLE tournaments
    ADD COLUMN IF NOT EXISTS updated_at text
  `);

  await pool.query(`
    UPDATE tournaments
    SET updated_at = created_at
    WHERE updated_at IS NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id text PRIMARY KEY,
      room text NOT NULL,
      user_id text NOT NULL,
      username text NOT NULL,
      text text NOT NULL,
      attachments jsonb DEFAULT '[]',
      edited_at text,
      deleted boolean NOT NULL DEFAULT false,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_reactions (
      id text PRIMARY KEY,
      message_id text NOT NULL,
      user_id text NOT NULL,
      emoji text NOT NULL,
      created_at text NOT NULL
    )
  `);

  console.log('Database connected');
}

export function getDb() {
  if (!pool) {
    throw new Error('DB is not initialized');
  }
  return pool;
}
