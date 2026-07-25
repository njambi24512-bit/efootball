import http from 'k6/http';
import { check, sleep } from 'k6';

const apiBaseUrl = (__ENV.API_BASE_URL || __ENV.BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
const frontendBaseUrl = (__ENV.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
const targetUsers = Number(__ENV.TARGET_USERS || 200);
const rampUpDuration = __ENV.RAMP_UP_DURATION || '1m';
const holdDuration = __ENV.HOLD_DURATION || '3m';
const rampDownDuration = __ENV.RAMP_DOWN_DURATION || '1m';

const platforms = ['ps', 'xbox', 'pc'];
const regions = ['eu', 'na', 'apac'];
const rooms = ['global', 'regional'];
const categories = ['events', 'patch-notes', 'community'];
const formats = ['single-elimination', 'double-elimination', 'round-robin'];

export const options = {
  scenarios: {
    main_api_mix: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { target: targetUsers, duration: rampUpDuration },
        { target: targetUsers, duration: holdDuration },
        { target: 0, duration: rampDownDuration }
      ],
      gracefulRampDown: '30s',
      exec: 'main'
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000']
  }
};

const vuState = {};

function jsonHeaders(token = '') {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'efootball-loadtest/1.0',
    Origin: frontendBaseUrl,
    Referer: `${frontendBaseUrl}/`
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function uniqueSuffix() {
  return `${__VU}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function assertOk(response, expectedStatus, context) {
  check(response, {
    [`${context} status is ${expectedStatus}`]: (res) => res.status === expectedStatus
  });
}

function ensureAuthenticatedUser() {
  if (vuState.token) {
    return vuState;
  }

  const suffix = uniqueSuffix();
  const platform = platforms[__VU % platforms.length];
  const region = regions[__VU % regions.length];
  const username = `load-vu-${__VU}-${suffix}`;
  const email = `${username}@example.com`;

  const registerResponse = http.post(
    `${apiBaseUrl}/api/auth/register`,
    JSON.stringify({
      username,
      email,
      password: 'LoadTest123!',
      platform,
      region
    }),
    { headers: jsonHeaders() }
  );

  if (registerResponse.status !== 201 && registerResponse.status !== 409) {
    assertOk(registerResponse, 201, 'register');
  }

  const loginResponse = http.post(
    `${apiBaseUrl}/api/auth/login`,
    JSON.stringify({ email, password: 'LoadTest123!' }),
    { headers: jsonHeaders() }
  );

  if (loginResponse.status !== 200) {
    assertOk(loginResponse, 200, 'login');
  }

  const loginBody = loginResponse.json();
  vuState.token = loginBody.token;
  vuState.username = loginBody.user?.username || username;
  vuState.platform = loginBody.user?.platform || platform;
  vuState.region = loginBody.user?.region || region;
  vuState.email = email;

  const meResponse = http.get(`${apiBaseUrl}/api/auth/me`, {
    headers: jsonHeaders(vuState.token)
  });
  assertOk(meResponse, 200, 'me');

  return vuState;
}

function publicReadFlow() {
  const responses = [
    http.get(`${apiBaseUrl}/health`, { headers: jsonHeaders() }),
    http.get(`${apiBaseUrl}/api/news`, { headers: jsonHeaders() }),
    http.get(`${apiBaseUrl}/api/tournaments`, { headers: jsonHeaders() }),
    http.get(`${apiBaseUrl}/api/marketplace/listings`, { headers: jsonHeaders() }),
    http.get(`${apiBaseUrl}/api/chat/messages?room=global`, { headers: jsonHeaders() })
  ];

  assertOk(responses[0], 200, 'health');
  assertOk(responses[1], 200, 'news list');
  assertOk(responses[2], 200, 'tournaments list');
  assertOk(responses[3], 200, 'marketplace list');
  assertOk(responses[4], 200, 'chat list');
}

function authenticatedReadFlow(state) {
  const response = http.get(`${apiBaseUrl}/api/auth/me`, {
    headers: jsonHeaders(state.token)
  });

  assertOk(response, 200, 'authenticated me');
}

function verificationFlow(state) {
  const startResponse = http.post(
    `${apiBaseUrl}/api/konami/start`,
    JSON.stringify({
      konami_id: `KONAMI-${__VU}-${__ITER}`,
      platform: state.platform
    }),
    { headers: jsonHeaders(state.token) }
  );

  assertOk(startResponse, 200, 'konami start');

  const startBody = startResponse.json();
  if (startBody?.verification?.id) {
    const submitResponse = http.post(
      `${apiBaseUrl}/api/konami/submit-proof`,
      JSON.stringify({
        verification_id: startBody.verification.id,
        proof_url: `https://example.com/proofs/${startBody.verification.id}.png`
      }),
      { headers: jsonHeaders(state.token) }
    );

    assertOk(submitResponse, 200, 'konami submit-proof');
  }
}

function chatWriteFlow(state) {
  const room = rooms[__VU % rooms.length];
  const response = http.post(
    `${apiBaseUrl}/api/chat/messages`,
    JSON.stringify({
      room,
      text: `Load-test message ${__VU}-${__ITER}`
    }),
    { headers: jsonHeaders(state.token) }
  );

  assertOk(response, 201, 'chat write');
}

function marketplaceWriteFlow(state) {
  const response = http.post(
    `${apiBaseUrl}/api/marketplace/listings`,
    JSON.stringify({
      title: `Elite squad ${__VU}-${__ITER}`,
      description: 'Synthetic listing used for load testing',
      price: Number((25 + Math.random() * 75).toFixed(2)),
      platform: state.platform
    }),
    { headers: jsonHeaders(state.token) }
  );

  assertOk(response, 201, 'marketplace write');
}

function newsWriteFlow(state) {
  const response = http.post(
    `${apiBaseUrl}/api/news`,
    JSON.stringify({
      title: `Matchday update ${__VU}-${__ITER}`,
      summary: 'Synthetic feed entry for throughput testing',
      category: categories[__ITER % categories.length],
      source_url: `https://example.com/news/${__VU}/${__ITER}`
    }),
    { headers: jsonHeaders(state.token) }
  );

  assertOk(response, 201, 'news write');
}

function tournamentWriteFlow(state) {
  const response = http.post(
    `${apiBaseUrl}/api/tournaments`,
    JSON.stringify({
      name: `Cup ${__VU}-${__ITER}`,
      format: formats[__VU % formats.length],
      max_participants: 16,
      start_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    }),
    { headers: jsonHeaders(state.token) }
  );

  assertOk(response, 201, 'tournament write');
}

function profileUpdateFlow(state) {
  const response = http.put(
    `${apiBaseUrl}/api/auth/profile`,
    JSON.stringify({
      username: `${state.username}-p`,
      platform: state.platform,
      region: state.region
    }),
    { headers: jsonHeaders(state.token) }
  );

  assertOk(response, 200, 'profile update');
}

export default function main() {
  const state = ensureAuthenticatedUser();
  const roll = Math.random();

  if (roll < 0.3) {
    publicReadFlow();
  } else if (roll < 0.5) {
    authenticatedReadFlow(state);
    profileUpdateFlow(state);
  } else if (roll < 0.65) {
    verificationFlow(state);
  } else if (roll < 0.8) {
    chatWriteFlow(state);
  } else if (roll < 0.9) {
    marketplaceWriteFlow(state);
  } else if (roll < 0.96) {
    newsWriteFlow(state);
  } else {
    tournamentWriteFlow(state);
  }

  sleep(1);
}
