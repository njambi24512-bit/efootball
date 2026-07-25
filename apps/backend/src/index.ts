import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initSockets } from './sockets';
import { createApp } from './app';
import { initDb } from './services/db';

const PORT = Number(process.env.PORT || 4000);

async function start() {
  await initDb();

  const app = createApp();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
  });

  initSockets(io);

  httpServer.listen(PORT, () => {
    console.log(`Backend listening on ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
