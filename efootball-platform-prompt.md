# eFootball Community Platform — Build Prompt

Build a full-stack web platform for the eFootball community. Users can register, verify ownership of their eFootball squad via a Konami ID check, chat with each other, host and join tournaments, and buy/sell eFootball accounts through a marketplace with built-in fraud protection. The platform should also surface a curated feed of official eFootball news.

Recommended stack:
- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Real-time: Socket.io
- Database: PostgreSQL
- Cache/pub-sub: Redis
- Storage: S3-compatible object storage

Core modules:
- Auth and profiles
- Konami verification workflow with proof upload and moderator review
- Global and regional chat
- Tournament hosting
- Marketplace with ToS warnings and escrow placeholders
- Admin-curated news feed
