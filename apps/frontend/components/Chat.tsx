import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../lib/api';

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Array<{ username: string; text: string }>>([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    const client = io(API_BASE_URL);
    setSocket(client);

    client.emit('join', 'global');
    client.on('chat:message', (message) => {
      setMessages((current) => [...current, message]);
    });

    return () => {
      client.disconnect();
    };
  }, []);

  function sendMessage() {
    if (!socket) return;

    socket.emit('chat:message', { room: 'global', user: 'you', text: value });
    setValue('');
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="font-medium">Global chat</h2>
      <div className="mt-3 space-y-2">
        {messages.map((message, index) => (
          <div key={`${message.username}-${index}`} className="rounded bg-slate-100 p-2 text-sm">
            <strong>{message.username}</strong>: {message.text}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="flex-1 rounded border px-3 py-2"
          placeholder="Say hello"
        />
        <button onClick={sendMessage} className="rounded bg-slate-800 px-3 py-2 text-white">
          Send
        </button>
      </div>
    </div>
  );
}
