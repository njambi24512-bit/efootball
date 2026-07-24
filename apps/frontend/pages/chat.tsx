import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function ChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Array<{ username: string; text: string }>>([]);
  const [value, setValue] = useState('');
  const [username, setUsername] = useState('guest');

  useEffect(() => {
    const client = io('http://localhost:4000');
    setSocket(client);

    client.emit('join', 'global');
    client.on('chat:message', (message) => {
      setMessages((current) => [...current, { username: message.username, text: message.text }]);
    });

    fetch('http://localhost:4000/api/chat/messages?room=global')
      .then((response) => response.json())
      .then((data) => setMessages(data.messages.map((message: any) => ({ username: message.username, text: message.text }))));

    return () => {
      client.disconnect();
    };
  }, []);

  function sendMessage() {
    if (!socket) return;
    socket.emit('chat:message', { room: 'global', user: username, text: value });
    setValue('');
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <main className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Global chat</h1>
        <p className="mt-2 text-slate-600">A simple chat room for the community.</p>

        <div className="mt-4 rounded-lg border bg-slate-50 p-3">
          <label className="mb-2 block text-sm font-medium">Display name</label>
          <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded border px-3 py-2" />
        </div>

        <div className="mt-4 space-y-2 rounded-lg border p-3">
          {messages.map((message, index) => (
            <div key={`${message.username}-${index}`} className="rounded bg-slate-100 p-2 text-sm">
              <strong>{message.username}</strong>: {message.text}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input value={value} onChange={(event) => setValue(event.target.value)} className="flex-1 rounded border px-3 py-2" placeholder="Type a message" />
          <button onClick={sendMessage} className="rounded bg-slate-800 px-4 py-2 text-white">Send</button>
        </div>
      </main>
    </div>
  );
}
