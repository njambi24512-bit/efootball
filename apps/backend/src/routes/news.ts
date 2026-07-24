import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createNewsItem, findUserById, listNewsItems } from '../services/stateStore';

const router = Router();

function getAuthenticatedUser(req: any) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { sub?: string };
    return findUserById(payload.sub || '');
  } catch {
    return null;
  }
}

router.get('/', (_req, res) => {
  res.json({ items: listNewsItems() });
});

router.post('/', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { title, summary, category, source_url } = req.body as {
    title?: string;
    summary?: string;
    category?: string;
    source_url?: string;
  };

  if (!title || !summary || !category || !source_url) {
    return res.status(400).json({ error: 'title, summary, category, and source_url are required' });
  }

  const item = {
    id: crypto.randomUUID(),
    title,
    summary,
    category,
    sourceUrl: source_url,
    publishedBy: user.id,
    publishedAt: new Date().toISOString()
  };

  createNewsItem(item);
  return res.status(201).json({ item });
});

export default router;
