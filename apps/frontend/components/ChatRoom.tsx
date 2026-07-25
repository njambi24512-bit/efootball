import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../lib/api';
import MessageItem from './MessageItem';

type ChatMessage = { id: string; username: string; text: string; createdAt: string };

export default function ChatRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [value, setValue] = useState('');
  const [username, setUsername] = useState('guest');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    // load recent messages
    fetch('/api/chat/messages?room=global&limit=50')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setMessages(data.messages || []);
        setTimeout(() => containerRef.current && (containerRef.current.scrollTop = containerRef.current.scrollHeight), 50);
      });

    const client = io(SOCKET_URL, { transports: ['polling'] });
    setSocket(client);
    client.on('connect', () => console.debug('ChatRoom socket connected', client.id));

    client.on('chat:message', (m: ChatMessage) => {
      setMessages((cur) => [...cur, m]);
      setTimeout(() => containerRef.current && (containerRef.current.scrollTop = containerRef.current.scrollHeight), 50);
    });

    client.on('chat:typing', ({ user }: any) => {
      setTypingUsers((prev) => Array.from(new Set([...prev, user])));
      setTimeout(() => setTypingUsers((prev) => prev.filter((u) => u !== user)), 2000);
    });

    client.emit('join', 'global');

    return () => {
      mounted = false;
      client.disconnect();
    };
  }, []);

  // emit typing (debounced)
  useEffect(() => {
    if (!socket) return;
    if (!value) return;
    const t = setTimeout(() => {
      socket.emit('chat:typing', { room: 'global', user: username });
    }, 500);
    return () => clearTimeout(t);
  }, [value, socket, username]);

  function sendMessage() {
    if (!socket || !value.trim()) return;
    socket.emit('chat:message', { room: 'global', user: username, text: value });
    setValue('');
  }

  return (
    <div className="bg-[#0b0d10] rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100"># general</h2>
          <div className="text-sm text-slate-400">A place for general discussion</div>
        </div>
        <div className="text-sm text-slate-400">24 online</div>
      </div>

      <div className="h-[480px] grid grid-cols-1 gap-4">
        <div ref={containerRef} className="overflow-auto rounded-lg p-4 bg-gradient-to-b from-[#071018] to-[#08121a]">
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <MessageItem key={m.id} id={m.id} username={m.username} text={m.text} createdAt={m.createdAt} mine={m.username === username} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md bg-[#081217] text-slate-300 hover:bg-[#0f1720]">😊</button>
            <button className="p-2 rounded-md bg-[#081217] text-slate-300 hover:bg-[#0f1720]">📎</button>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message #general"
              className="flex-1 rounded-md bg-[#061018] px-4 py-3 text-slate-100 placeholder:text-slate-500 w-full"
            />
            <button onClick={sendMessage} className="rounded-md bg-gradient-to-br from-turf to-floodlight px-4 py-2 text-black font-semibold">Send</button>
          </div>
          <div className="mt-2 text-xs text-slate-500">{typingUsers.length ? `${typingUsers.join(', ')} is typing...` : ''}</div>
        </div>
      </div>
    </div>
  );
}
