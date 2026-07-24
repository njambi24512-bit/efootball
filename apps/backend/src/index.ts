import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initSockets } from './sockets';
import { createApp } from './app';

const app = createApp();

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' }
});

initSockets(io);

const PORT = Number(process.env.PORT || 4000);

httpServer.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
