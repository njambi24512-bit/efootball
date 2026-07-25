import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import konamiRoutes from './routes/konami';
import marketplaceRoutes from './routes/marketplace';
import newsRoutes from './routes/news';
import tournamentRoutes from './routes/tournaments';
import chatRoutes from './routes/chat';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(frontendUrl);
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/konami', konamiRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/tournaments', tournamentRoutes);
  app.use('/api/chat', chatRoutes);

  return app;
}
