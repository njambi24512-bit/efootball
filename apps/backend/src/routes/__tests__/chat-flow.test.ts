import path from 'path';
import os from 'os';
import request from 'supertest';
import { createApp } from '../../app';

describe('chat flow', () => {
  beforeEach(() => {
    process.env.APP_STATE_FILE = path.join(os.tmpdir(), `efootball-test-${Date.now()}-${Math.random()}.json`);
  });

  it('creates a chat room and stores messages', async () => {
    const app = createApp();

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'chatty',
        email: 'chatty@example.com',
        password: 'secret123',
        platform: 'ps',
        region: 'eu'
      });

    const token = registerResponse.body.token;

    const response = await request(app)
      .post('/api/chat/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ room: 'global', text: 'hello from the app' });

    expect(response.status).toBe(201);
    expect(response.body.message.text).toBe('hello from the app');
  });
});
