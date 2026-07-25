# Production Readiness Checklist

Use this checklist after running the API load test against the DB-backed environment.

## Test Setup

- Backend is started with `DATABASE_URL` set and connected to Postgres.
- Redis is available if you exercise any future cache-backed paths.
- Load test target points at the real backend origin through `API_BASE_URL`.
- The test profile ramps from 0 to 200 VUs over 1 minute, holds for 3 minutes, then ramps down over 1 minute.

## Pass Criteria

- `http_req_failed` stays below 5 percent overall.
- Public read endpoints keep `p95` latency below 300 ms.
- Auth and profile endpoints keep `p95` latency below 500 ms.
- Write endpoints for chat, marketplace, news, tournaments, and verification keep `p95` latency below 800 ms.
- No unhandled 5xx spikes during the steady-state hold period.
- Postgres remains connected for the full run with no pool exhaustion or connection resets.
- CPU stays below 70 percent and memory below 80 percent on the backend host during the steady-state window.
- Response shapes remain valid for the frontend pages that consume them.

## Failure Signals

- 5xx errors increase as concurrency rises.
- Latency climbs steadily through the hold period instead of stabilizing.
- DB writes start timing out or show duplicate key / connection pool errors.
- Chat message writes or verification requests fail more often than reads.
- Frontend pages break because response field names drift from backend output.

## What To Check If It Fails

1. Confirm the backend is using Postgres, not the file-backed fallback.
2. Inspect the Postgres pool size and database CPU / IOPS.
3. Check whether write-heavy routes are being hammered more than reads.
4. Verify auth token generation and request headers are consistent in the benchmark.
5. Re-run with a lower target user count to isolate the failing path.
