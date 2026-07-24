import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../services/stateStore';

const router = Router();

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createToken(userId: string) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

router.post('/register', (req, res) => {
  const { username, email, password, platform, region } = req.body as {
    username?: string;
    email?: string;
    password?: string;
    platform?: string;
    region?: string;
  };

  if (!username || !email || !password || !platform || !region) {
    return res.status(400).json({ error: 'username, email, password, platform, and region are required' });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash: hashPassword(password),
    platform,
    region,
    role: 'user',
    konamiVerified: false,
    createdAt: new Date().toISOString()
  };

  createUser(user);

  const token = createToken(user.id);
  return res.status(201).json({ user, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = findUserByEmail(email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken(user.id);
  return res.json({ user, token });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { sub?: string };
    const user = findUserById(payload.sub || '');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.put('/profile', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { sub?: string };
    const user = findUserById(payload.sub || '');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { username, platform, region } = req.body as { username?: string; platform?: string; region?: string };
    if (username) user.username = username;
    if (platform) user.platform = platform;
    if (region) user.region = region;

    return res.json({ user });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
