import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createChatMessage, findUserById, listChatMessages } from '../services/stateStore';

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

router.get('/messages', async (req, res) => {
  const room = req.query.room as string | undefined;
  res.json({ messages: await listChatMessages(room) });
});

router.post('/messages', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { room, text } = req.body as { room?: string; text?: string };
  if (!room || !text) {
    return res.status(400).json({ error: 'room and text are required' });
  }

  const message = {
    id: crypto.randomUUID(),
    room,
    userId: user.id,
    username: user.username,
    text,
    createdAt: new Date().toISOString()
  };

  await createChatMessage(message);
  return res.status(201).json({ message });
});

export default router;
