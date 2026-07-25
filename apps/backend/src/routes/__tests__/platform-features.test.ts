import path from 'path';
import os from 'os';
import request from 'supertest';
import { createApp } from '../../app';

describe('platform features', () => {
  beforeEach(() => {
    process.env.APP_STATE_FILE = path.join(os.tmpdir(), `efootball-test-${Date.now()}-${Math.random()}.json`);
  });

  it('creates marketplace listings, news items, and tournaments for a signed-in user', async () => {
    const app = createApp();

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'seller',
        email: 'seller@example.com',
        password: 'secret123',
        platform: 'ps',
        region: 'eu'
      });

    const token = registerResponse.body.token;

    const listingResponse = await request(app)
      .post('/api/marketplace/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Premium account',
        description: 'Verified seller account',
        price: 29.99,
        platform: 'ps'
      });

    expect(listingResponse.status).toBe(201);
    expect(listingResponse.body.listing.title).toBe('Premium account');

    const newsResponse = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New eFootball update',
        summary: 'Patch notes available',
        category: 'events',
        source_url: 'https://example.com/news'
      });

    expect(newsResponse.status).toBe(201);
    expect(newsResponse.body.item.title).toBe('New eFootball update');

    const tournamentsResponse = await request(app)
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Weekend Cup',
        format: 'single-elimination',
        max_participants: 16,
        start_date: '2026-08-01'
      });

    expect(tournamentsResponse.status).toBe(201);
    expect(tournamentsResponse.body.tournament.name).toBe('Weekend Cup');

    const metricsResponse = await request(app).get('/api/tournaments/metrics');

    expect(metricsResponse.status).toBe(200);
    expect(metricsResponse.body.metrics.total).toBeGreaterThanOrEqual(1);

    const tournamentId = tournamentsResponse.body.tournament.id;

    const detailsResponse = await request(app).get(`/api/tournaments/${tournamentId}`);

    expect(detailsResponse.status).toBe(200);
    expect(detailsResponse.body.tournament.id).toBe(tournamentId);

    const updateResponse = await request(app)
      .patch(`/api/tournaments/${tournamentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Weekend Cup Updated',
        format: 'double-elimination',
        max_participants: 32,
        start_date: '2026-08-02',
        status: 'open'
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.tournament.name).toBe('Weekend Cup Updated');
    expect(updateResponse.body.tournament.status).toBe('open');
    expect(updateResponse.body.tournament.updatedAt).toBeDefined();
  });
});
