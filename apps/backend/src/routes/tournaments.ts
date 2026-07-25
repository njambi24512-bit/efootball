import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createTournament, findTournamentById, findUserById, listTournaments, updateTournament } from '../services/stateStore';

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

router.get('/metrics', async (_req, res) => {
  const tournaments = await listTournaments();
  const now = Date.now();

  const metrics = {
    total: tournaments.length,
    open: tournaments.filter((tournament) => tournament.status === 'open').length,
    draft: tournaments.filter((tournament) => tournament.status === 'draft').length,
    closed: tournaments.filter((tournament) => tournament.status === 'closed').length,
    upcoming: tournaments.filter((tournament) => new Date(tournament.startDate).getTime() > now).length,
    lastUpdatedAt: tournaments[0]?.updatedAt || tournaments[0]?.createdAt || null
  };

  res.json({ metrics });
});

router.get('/:id', async (req, res) => {
  const tournament = await findTournamentById(req.params.id);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  return res.json({ tournament });
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

router.patch('/:id', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const tournament = await findTournamentById(req.params.id);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  if (tournament.createdBy !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the creator can update this tournament' });
  }

  const { name, format, max_participants, start_date, status } = req.body as {
    name?: string;
    format?: string;
    max_participants?: number;
    start_date?: string;
    status?: 'draft' | 'open' | 'closed';
  };

  const updatedTournament = await updateTournament(req.params.id, {
    name,
    format,
    maxParticipants: max_participants,
    startDate: start_date,
    status
  });

  return res.json({ tournament: updatedTournament });
});

export default router;
