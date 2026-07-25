import { Server as SocketIOServer, Socket } from 'socket.io';
import { createChatMessage } from '../services/stateStore';

export function initSockets(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log('Socket connected', socket.id);

    socket.on('join', (room: string) => {
      socket.join(room);
    });

    socket.on('chat:message', async (payload: { room?: string; user?: string; text?: string }) => {
      if (!payload.room || !payload.text) {
        return;
      }

      const message = {
        id: `${socket.id}-${Date.now()}`,
        room: payload.room,
        userId: socket.id,
        username: payload.user || 'anonymous',
        text: payload.text,
        createdAt: new Date().toISOString()
      };

      await createChatMessage(message);
      io.to(payload.room).emit('chat:message', message);
    });
  });
}
