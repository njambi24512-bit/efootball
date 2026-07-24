import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ user: string; text: string }>>([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    const socket = io('http://localhost:4000');
    socket.emit('join', 'global');
    socket.on('chat:message', (message) => {
      setMessages((current) => [...current, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function sendMessage() {
    const socket = io('http://localhost:4000');
    socket.emit('chat:message', { room: 'global', user: 'you', text: value });
    setValue('');
    socket.disconnect();
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="font-medium">Global chat</h2>
      <div className="mt-3 space-y-2">
        {messages.map((message, index) => (
          <div key={`${message.user}-${index}`} className="rounded bg-slate-100 p-2 text-sm">
            <strong>{message.user}</strong>: {message.text}
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
