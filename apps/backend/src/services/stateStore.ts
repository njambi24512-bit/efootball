import fs from 'fs';
import path from 'path';

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
  const state = readState();
  state.users.push(user);
  writeState(state);
}

export function findUserByEmail(email: string) {
  const state = readState();
  return state.users.find((user) => user.email === email);
}

export function findUserById(id: string) {
  const state = readState();
  return state.users.find((user) => user.id === id);
}

export function createVerification(verification: VerificationRecord) {
  const state = readState();
  state.verifications.push(verification);
  writeState(state);
}

export function findVerificationById(id: string) {
  const state = readState();
  return state.verifications.find((verification) => verification.id === id);
}

export function updateVerification(id: string, updates: Partial<VerificationRecord>) {
  const state = readState();
  const verification = state.verifications.find((item) => item.id === id);
  if (!verification) {
    return null;
  }

  Object.assign(verification, updates);
  writeState(state);
  return verification;
}

export function createListing(listing: ListingRecord) {
  const state = readState();
  state.listings.push(listing);
  writeState(state);
}

export function listListings() {
  return readState().listings;
}

export function createNewsItem(item: NewsItemRecord) {
  const state = readState();
  state.newsItems.push(item);
  writeState(state);
}

export function listNewsItems() {
  return readState().newsItems;
}

export function createTournament(tournament: TournamentRecord) {
  const state = readState();
  state.tournaments.push(tournament);
  writeState(state);
}

export function listTournaments() {
  return readState().tournaments;
}

export function createChatMessage(message: ChatMessageRecord) {
  const state = readState();
  state.chatMessages.push(message);
  writeState(state);
}

export function listChatMessages(room?: string) {
  const state = readState();
  if (!room) {
    return state.chatMessages;
  }
  return state.chatMessages.filter((message) => message.room === room);
}
