import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  createChatMessage,
  createChatReaction,
  editChatMessage,
  deleteChatMessage
} from '../services/stateStore';

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

    socket.on('chat:typing', (payload: { room?: string; user?: string }) => {
      if (!payload.room || !payload.user) return;
      // broadcast to other clients in the room that `user` is typing
      socket.to(payload.room).emit('chat:typing', { user: payload.user });
    });

    socket.on('chat:reaction', async (payload: { messageId?: string; emoji?: string; userId?: string }) => {
      if (!payload.messageId || !payload.emoji) return;
      const reaction = {
        id: `${socket.id}-${Date.now()}`,
        messageId: payload.messageId,
        userId: payload.userId || socket.id,
        emoji: payload.emoji,
        createdAt: new Date().toISOString()
      };
      await createChatReaction(reaction);
      // broadcast to room(s) — emit to all connected clients so they can update UI
      io.emit('chat:reaction', reaction);
    });

    socket.on('chat:edit', async (payload: { messageId?: string; userId?: string; text?: string }) => {
      if (!payload.messageId || typeof payload.text !== 'string') return;
      const updated = await editChatMessage(payload.messageId, payload.userId || socket.id, payload.text);
      if (updated) {
        io.emit('chat:edit', updated);
      }
    });

    socket.on('chat:delete', async (payload: { messageId?: string; userId?: string }) => {
      if (!payload.messageId) return;
      const deleted = await deleteChatMessage(payload.messageId, payload.userId || socket.id);
      if (deleted) {
        io.emit('chat:delete', { id: payload.messageId });
      }
    });
  });
}
