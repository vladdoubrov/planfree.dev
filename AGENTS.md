# AGENTS.md

This file is the entrypoint for coding agents working in this repository.

## Documentation Structure

Start with [docs/README.md](./docs/README.md). The docs are organized as:

- [docs/architecture.md](./docs/architecture.md): system boundaries, runtime state, major flows, architectural tradeoffs, and known constraints.
- [docs/realtime-events.md](./docs/realtime-events.md): Socket.IO client/server event contract and scoring rules.
- [docs/development-and-deployment.md](./docs/development-and-deployment.md): commands, environment variables, deployment shape, and verification notes.
- [docs/landing-site.md](./docs/landing-site.md): Hugo landing site structure, config, and editing guidance.

`CLAUDE.md` also contains historical agent notes. Prefer the `docs/` files for current navigation because they were checked against the codebase on 2026-06-09.

## Project Boundaries

- `client/` is the Vue 3 + TypeScript realtime app.
- `server/` is the Express + Socket.IO backend.
- `landing/` is the Hugo static marketing site.
- Root `package.json` is mainly for server deployment.

Keep changes scoped to the relevant boundary. Do not mix landing site changes with app runtime changes unless the task explicitly needs both.

## Common Commands

```bash
# server from repo root
npm install
npm start

# client
cd client
npm install
npm run serve
npm run build
npm run lint

# landing
cd landing
npm install
npm run dev
npm run build
```

There are no automated test suites currently declared for client or server. Use the available build/lint commands that match the changed area.

## Architecture Reminders

- Active room state is in memory in `server/index.js`; server restarts clear active sessions.
- Socket.IO rooms are the realtime broadcast boundary.
- The server owns game formats, vote reveal, average/closest scoring, ticket scoring, and PRA scoring.
- Client shared state is held in module-level refs in `client/src/composables/useGameEngine.ts`.
- Vue routing uses hash history, with `/` and `/game/:id` as the current declared routes.
- The landing site is deployed separately from the realtime app.
