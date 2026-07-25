# API Load Test

This k6 script targets the backend APIs with configurable endpoints and realistic request shapes.

Default run against local development:

```bash
k6 run scripts/loadtest/efootball-api-loadtest.mjs
```

Override endpoints for staging or a remote environment:

```bash
API_BASE_URL=https://staging-api.example.com \
FRONTEND_URL=https://staging.example.com \
TARGET_USERS=200 \
k6 run scripts/loadtest/efootball-api-loadtest.mjs
```

Load profile:
- Ramp from 0 to 200 VUs over 1 minute
- Hold 200 VUs for 3 minutes
- Ramp back down over 1 minute

Run it from Docker Compose without installing k6 locally:

```bash
API_BASE_URL=http://host.docker.internal:4000 \
FRONTEND_URL=http://host.docker.internal:3000 \
docker compose -f infra/docker-compose.yml --profile loadtest run --rm loadtest
```

The script exercises:
- Public reads: `/health`, `/api/news`, `/api/tournaments`, `/api/marketplace/listings`, `/api/chat/messages`
- Auth flows: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/profile`
- Mutations: `/api/konami/start`, `/api/konami/submit-proof`, `/api/chat/messages`, `/api/marketplace/listings`, `/api/news`, `/api/tournaments`

Use [production-readiness.md](./production-readiness.md) as the release gate after a load test run.
