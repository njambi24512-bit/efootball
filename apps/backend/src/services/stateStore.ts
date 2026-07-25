import fs from 'fs';
import path from 'path';
import { getDb } from './db';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  platform: string;
  region: string;
  role: string;
  konamiId?: string;
  konamiVerified: boolean;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  userId: string;
  konamiId: string;
  verificationCode: string;
  proofUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ListingRecord {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  status: 'active' | 'sold' | 'removed';
  createdAt: string;
}

export interface NewsItemRecord {
  id: string;
  title: string;
  summary: string;
  category: string;
  sourceUrl: string;
  publishedBy: string;
  publishedAt: string;
}

export interface TournamentRecord {
  id: string;
  name: string;
  format: string;
  maxParticipants: number;
  startDate: string;
  createdBy: string;
  status: 'draft' | 'open' | 'closed';
  createdAt: string;
}

export interface ChatMessageRecord {
  id: string;
  room: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface AppState {
  users: UserRecord[];
  verifications: VerificationRecord[];
  listings: ListingRecord[];
  newsItems: NewsItemRecord[];
  tournaments: TournamentRecord[];
  chatMessages: ChatMessageRecord[];
}

const defaultState: AppState = {
  users: [],
  verifications: [],
  listings: [],
  newsItems: [],
  tournaments: [],
  chatMessages: []
};

function useDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function db() {
  return getDb();
}

function toUserRecord(row: any): UserRecord {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    platform: row.platform,
    region: row.region,
    role: row.role,
    konamiId: row.konami_id ?? undefined,
    konamiVerified: Boolean(row.konami_verified),
    createdAt: row.created_at
  };
}

function toVerificationRecord(row: any): VerificationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    konamiId: row.konami_id,
    verificationCode: row.verification_code,
    proofUrl: row.proof_url ?? undefined,
    status: row.status,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    createdAt: row.created_at
  };
}

function toListingRecord(row: any): ListingRecord {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    platform: row.platform,
    status: row.status,
    createdAt: row.created_at
  };
}

function toNewsItemRecord(row: any): NewsItemRecord {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    sourceUrl: row.source_url,
    publishedBy: row.published_by,
    publishedAt: row.published_at
  };
}

function toTournamentRecord(row: any): TournamentRecord {
  return {
    id: row.id,
    name: row.name,
    format: row.format,
    maxParticipants: Number(row.max_participants),
    startDate: row.start_date,
    createdBy: row.created_by,
    status: row.status,
    createdAt: row.created_at
  };
}

function toChatMessageRecord(row: any): ChatMessageRecord {
  return {
    id: row.id,
    room: row.room,
    userId: row.user_id,
    username: row.username,
    text: row.text,
    createdAt: row.created_at
  };
}

function getStateFilePath() {
  return process.env.APP_STATE_FILE || path.join(process.cwd(), 'data', 'app-state.json');
}

function ensureFile(filePath: string) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultState, null, 2));
  }
}

export function readState(): AppState {
  const filePath = getStateFilePath();
  ensureFile(filePath);
  const contents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(contents) as AppState;
}

export function writeState(state: AppState) {
  const filePath = getStateFilePath();
  ensureFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

export function createUser(user: UserRecord) {
  if (useDatabase()) {
    return db().query(
      `
        INSERT INTO users (
          id, username, email, password_hash, platform, region, role, konami_id, konami_verified, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        user.id,
        user.username,
        user.email,
        user.passwordHash,
        user.platform,
        user.region,
        user.role,
        user.konamiId || null,
        user.konamiVerified,
        user.createdAt
      ]
    );
    return Promise.resolve();
  }

  const state = readState();
  state.users.push(user);
  writeState(state);
  return Promise.resolve();
}

export function findUserByEmail(email: string) {
  if (useDatabase()) {
    return db().query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]).then((result) => {
      return result.rows[0] ? toUserRecord(result.rows[0]) : undefined;
    });
  }

  const state = readState();
  return Promise.resolve(state.users.find((user) => user.email === email));
}

export function findUserById(id: string) {
  if (useDatabase()) {
    return db().query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]).then((result) => {
      return result.rows[0] ? toUserRecord(result.rows[0]) : undefined;
    });
  }

  const state = readState();
  return Promise.resolve(state.users.find((user) => user.id === id));
}

export function updateUser(id: string, updates: Partial<Pick<UserRecord, 'username' | 'platform' | 'region' | 'konamiId' | 'konamiVerified'>>) {
  if (useDatabase()) {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.username !== undefined) {
      values.push(updates.username);
      fields.push(`username = $${values.length}`);
    }
    if (updates.platform !== undefined) {
      values.push(updates.platform);
      fields.push(`platform = $${values.length}`);
    }
    if (updates.region !== undefined) {
      values.push(updates.region);
      fields.push(`region = $${values.length}`);
    }
    if (updates.konamiId !== undefined) {
      values.push(updates.konamiId);
      fields.push(`konami_id = $${values.length}`);
    }
    if (updates.konamiVerified !== undefined) {
      values.push(updates.konamiVerified);
      fields.push(`konami_verified = $${values.length}`);
    }

    if (fields.length === 0) {
      return findUserById(id);
    }

    values.push(id);
    return db()
      .query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`, values)
      .then((result) => (result.rows[0] ? toUserRecord(result.rows[0]) : undefined));
  }

  const state = readState();
  const user = state.users.find((item) => item.id === id);
  if (!user) {
    return Promise.resolve(undefined);
  }

  Object.assign(user, updates);
  writeState(state);
  return Promise.resolve(user);
}

export function createVerification(verification: VerificationRecord) {
  if (useDatabase()) {
    return db().query(
      `
        INSERT INTO verifications (
          id, user_id, konami_id, verification_code, proof_url, status, reviewed_by, reviewed_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        verification.id,
        verification.userId,
        verification.konamiId,
        verification.verificationCode,
        verification.proofUrl || null,
        verification.status,
        verification.reviewedBy || null,
        verification.reviewedAt || null,
        verification.createdAt
      ]
    );
    return Promise.resolve();
  }

  const state = readState();
  state.verifications.push(verification);
  writeState(state);
  return Promise.resolve();
}

export function findVerificationById(id: string) {
  if (useDatabase()) {
    return db().query('SELECT * FROM verifications WHERE id = $1 LIMIT 1', [id]).then((result) => {
      return result.rows[0] ? toVerificationRecord(result.rows[0]) : undefined;
    });
  }

  const state = readState();
  return Promise.resolve(state.verifications.find((verification) => verification.id === id));
}

export function updateVerification(id: string, updates: Partial<VerificationRecord>) {
  if (useDatabase()) {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.proofUrl !== undefined) {
      values.push(updates.proofUrl);
      fields.push(`proof_url = $${values.length}`);
    }
    if (updates.status !== undefined) {
      values.push(updates.status);
      fields.push(`status = $${values.length}`);
    }
    if (updates.reviewedBy !== undefined) {
      values.push(updates.reviewedBy);
      fields.push(`reviewed_by = $${values.length}`);
    }
    if (updates.reviewedAt !== undefined) {
      values.push(updates.reviewedAt);
      fields.push(`reviewed_at = $${values.length}`);
    }

    if (fields.length === 0) {
      return findVerificationById(id).then((current) => current || null);
    }

    values.push(id);
    return db().query(
      `UPDATE verifications SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    ).then((result) => (result.rows[0] ? toVerificationRecord(result.rows[0]) : null));
  }

  const state = readState();
  const verification = state.verifications.find((item) => item.id === id);
  if (!verification) {
    return Promise.resolve(null);
  }

  Object.assign(verification, updates);
  writeState(state);
  return Promise.resolve(verification);
}

export function createListing(listing: ListingRecord) {
  if (useDatabase()) {
    return db().query(
      `
        INSERT INTO listings (
          id, seller_id, title, description, price, platform, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [listing.id, listing.sellerId, listing.title, listing.description, listing.price, listing.platform, listing.status, listing.createdAt]
    );
    return Promise.resolve();
  }

  const state = readState();
  state.listings.push(listing);
  writeState(state);
  return Promise.resolve();
}

export function listListings() {
  if (useDatabase()) {
    return db().query('SELECT * FROM listings ORDER BY created_at DESC').then((result) => result.rows.map(toListingRecord));
  }

  return Promise.resolve(readState().listings);
}

export function createNewsItem(item: NewsItemRecord) {
  if (useDatabase()) {
    return db().query(
      `
        INSERT INTO news_items (
          id, title, summary, category, source_url, published_by, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [item.id, item.title, item.summary, item.category, item.sourceUrl, item.publishedBy, item.publishedAt]
    );
    return Promise.resolve();
  }

  const state = readState();
  state.newsItems.push(item);
  writeState(state);
  return Promise.resolve();
}

export function listNewsItems() {
  if (useDatabase()) {
    return db().query('SELECT * FROM news_items ORDER BY published_at DESC').then((result) => result.rows.map(toNewsItemRecord));
  }

  return Promise.resolve(readState().newsItems);
}

export function createTournament(tournament: TournamentRecord) {
  if (useDatabase()) {
    return db().query(
      `
        INSERT INTO tournaments (
          id, name, format, max_participants, start_date, created_by, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        tournament.id,
        tournament.name,
        tournament.format,
        tournament.maxParticipants,
        tournament.startDate,
        tournament.createdBy,
        tournament.status,
        tournament.createdAt
      ]
    );
    return Promise.resolve();
  }

  const state = readState();
  state.tournaments.push(tournament);
  writeState(state);
  return Promise.resolve();
}

export function listTournaments() {
  if (useDatabase()) {
    return db().query('SELECT * FROM tournaments ORDER BY created_at DESC').then((result) => result.rows.map(toTournamentRecord));
  }

  return Promise.resolve(readState().tournaments);
}

export function createChatMessage(message: ChatMessageRecord) {
  if (useDatabase()) {
    return db().query(
      `
        INSERT INTO chat_messages (
          id, room, user_id, username, text, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [message.id, message.room, message.userId, message.username, message.text, message.createdAt]
    );
    return Promise.resolve();
  }

  const state = readState();
  state.chatMessages.push(message);
  writeState(state);
  return Promise.resolve();
}

export function listChatMessages(room?: string) {
  if (useDatabase()) {
    if (!room) {
      return db().query('SELECT * FROM chat_messages ORDER BY created_at ASC').then((result) => result.rows.map(toChatMessageRecord));
    }

    return db().query('SELECT * FROM chat_messages WHERE room = $1 ORDER BY created_at ASC', [room]).then((result) =>
      result.rows.map(toChatMessageRecord)
    );
  }

  const state = readState();
  if (!room) {
    return Promise.resolve(state.chatMessages);
  }
  return Promise.resolve(state.chatMessages.filter((message) => message.room === room));
}
