const { io } = require('socket.io-client');

async function run() {
  const socket = io('http://localhost:4000', { transports: ['polling'] });
  socket.on('connect', async () => {
    console.log('connected', socket.id);
    socket.emit('join', 'global');
    socket.emit('chat:message', { room: 'global', user: 'tester', text: 'Hello from test script ' + Date.now() });
    setTimeout(async () => {
      try {
        const res = await fetch('http://localhost:4000/api/chat/messages?room=global');
        const data = await res.json();
        console.log('messages count:', data.messages.length);
        console.log(data.messages.slice(-3));
      } catch (err) {
        console.error(err);
      } finally {
        socket.disconnect();
        process.exit(0);
      }
    }, 500);
  });
  socket.on('connect_error', (err) => {
    console.error('connect_error', err);
    process.exit(1);
  });
}

run();
