import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createTournament, findUserById, listTournaments } from '../services/stateStore';

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

router.get('/', async (_req, res) => {
  res.json({ tournaments: await listTournaments() });
});

router.post('/', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { name, format, max_participants, start_date } = req.body as {
    name?: string;
    format?: string;
    max_participants?: number;
    start_date?: string;
  };

  if (!name || !format || !max_participants || !start_date) {
    return res.status(400).json({ error: 'name, format, max_participants, and start_date are required' });
  }

  const tournament = {
    id: crypto.randomUUID(),
    name,
    format,
    maxParticipants: max_participants,
    startDate: start_date,
    createdBy: user.id,
    status: 'open' as const,
    createdAt: new Date().toISOString()
  };

  await createTournament(tournament);
  return res.status(201).json({ tournament });
});

export default router;
