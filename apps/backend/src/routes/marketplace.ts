import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createListing, findUserById, listListings } from '../services/stateStore';

const router = Router();

async function getAuthenticatedUser(req: any) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { sub?: string };
    return await findUserById(payload.sub || '');
  } catch {
    return null;
  }
}

router.get('/listings', async (_req, res) => {
  res.json({ items: await listListings() });
});

router.post('/listings', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { title, description, price, platform } = req.body as {
    title?: string;
    description?: string;
    price?: number;
    platform?: string;
  };

  if (!title || !description || !price || !platform) {
    return res.status(400).json({ error: 'title, description, price, and platform are required' });
  }

  const listing = {
    id: crypto.randomUUID(),
    sellerId: user.id,
    title,
    description,
    price,
    platform,
    status: 'active' as const,
    createdAt: new Date().toISOString()
  };

  await createListing(listing);
  return res.status(201).json({ listing, warning: 'Trading may violate Konami terms of service.' });
});

export default router;
