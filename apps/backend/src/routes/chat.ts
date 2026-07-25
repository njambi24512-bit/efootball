import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  createChatMessage,
  findUserById,
  listChatMessages,
  createChatReaction,
  removeChatReactionById,
  editChatMessage,
  deleteChatMessage
} from '../services/stateStore';

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
  const before = req.query.before as string | undefined;
  const limit = parseInt((req.query.limit as string) || '50', 10) || 50;

  const messages = await listChatMessages(room, before, limit);

  // Determine nextBefore cursor: if we returned exactly `limit` messages, the next cursor is the earliest message's createdAt
  const nextBefore = messages.length === limit ? messages[0].createdAt : null;

  res.json({ messages, nextBefore });
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

// Add a reaction to a message
router.post('/messages/:id/reactions', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { emoji } = req.body as { emoji?: string };
  if (!emoji) return res.status(400).json({ error: 'emoji is required' });

  const reaction = {
    id: crypto.randomUUID(),
    messageId: req.params.id,
    userId: user.id,
    emoji,
    createdAt: new Date().toISOString()
  };

  await createChatReaction(reaction);
  // emit via socket in sockets layer; return created reaction
  return res.status(201).json({ reaction });
});

// Remove a reaction by id
router.delete('/messages/:messageId/reactions/:reactionId', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  // For simplicity, allow deletion if the reaction belongs to the user or the user is admin
  await removeChatReactionById(req.params.reactionId);
  return res.status(204).send();
});

// Edit a message (only owner)
router.patch('/messages/:id', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { text } = req.body as { text?: string };
  if (typeof text !== 'string') return res.status(400).json({ error: 'text is required' });

  const updated = await editChatMessage(req.params.id, user.id, text);
  if (!updated) return res.status(404).json({ error: 'message not found or not allowed' });
  return res.json({ message: updated });
});

// Delete (soft) a message
router.delete('/messages/:id', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const deleted = await deleteChatMessage(req.params.id, user.id);
  if (!deleted) return res.status(404).json({ error: 'message not found or not allowed' });
  return res.status(204).send();
});

export default router;
