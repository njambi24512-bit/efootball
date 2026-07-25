const { io } = require('socket.io-client');

const socket = io('http://localhost:3000', { transports: ['polling'] });

socket.on('connect', () => {
  console.log('proxy-client connected', socket.id);
  socket.emit('join', 'global');
});

socket.on('chat:message', (msg) => {
  console.log('proxy-client received chat:message', msg);
});

socket.on('connect_error', (err) => {
  console.error('proxy connect_error', err);
  process.exit(1);
});

setTimeout(() => {
  console.log('closing proxy client');
  socket.disconnect();
  process.exit(0);
}, 5000);
