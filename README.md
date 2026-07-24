# eFootball Platform

This repository now contains a starter full-stack scaffold for an eFootball community platform MVP.

## What is included
- A Next.js + TypeScript + Tailwind frontend with pages for home, profile, verification, and marketplace
- An Express + TypeScript backend with auth, Konami verification, marketplace, and chat socket scaffolding
- Docker and CI starter files
- AI workflow stubs for backend generation with Codex and frontend generation with Claude

## Quick start
1. Copy .env.example to .env and fill in your database and storage credentials.
2. Install dependencies:
   - `npm install`
   - `cd apps/backend && npm install`
   - `cd apps/frontend && npm install`
3. Start the services:
   - Backend: `cd apps/backend && npm run dev`
   - Frontend: `cd apps/frontend && npm run dev`

See efootball-platform-prompt.md for the full product brief.
