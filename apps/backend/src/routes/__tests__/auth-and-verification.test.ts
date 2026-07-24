import path from 'path';
import os from 'os';
import request from 'supertest';
import { createApp } from '../../app';

describe('auth and verification flow', () => {
  beforeEach(() => {
    process.env.APP_STATE_FILE = path.join(os.tmpdir(), `efootball-test-${Date.now()}-${Math.random()}.json`);
  });

  it('registers a user, logs them in, and creates a verification request', async () => {
    const app = createApp();

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'playerone',
        email: 'player@example.com',
        password: 'secret123',
        platform: 'ps',
        region: 'eu'
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user.email).toBe('player@example.com');
    expect(registerResponse.body.token).toBeDefined();

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerResponse.body.token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.username).toBe('playerone');

    const verificationResponse = await request(app)
      .post('/api/konami/start')
      .set('Authorization', `Bearer ${registerResponse.body.token}`)
      .send({ konami_id: 'konami-123', platform: 'ps' });

    expect(verificationResponse.status).toBe(200);
    expect(verificationResponse.body.verification_code).toMatch(/^EF-/);
    expect(verificationResponse.body.verification).toBeDefined();

    const submitResponse = await request(app)
      .post('/api/konami/submit-proof')
      .set('Authorization', `Bearer ${registerResponse.body.token}`)
      .send({
        verification_id: verificationResponse.body.verification.id,
        proof_url: 'https://example.com/proof.jpg'
      });

    expect(submitResponse.status).toBe(200);
    expect(submitResponse.body.success).toBe(true);
  });
});
