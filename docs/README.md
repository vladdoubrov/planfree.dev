# Planfree.dev Documentation

Last checked: 2026-06-09.

This folder is the starting point for understanding the repository. The app is a free planning poker tool with a realtime Vue client, a Socket.IO server, and a separate Hugo landing site.

## Start Here

- [Architecture](./architecture.md) explains the main systems, ownership boundaries, state model, and key decisions.
- [Realtime Events](./realtime-events.md) maps the Socket.IO contract between client and server.
- [Development and Deployment](./development-and-deployment.md) lists local commands, environment variables, deployment shape, and verification notes.
- [Landing Site](./landing-site.md) explains the Hugo marketing site and where its content/configuration lives.

## Repository Map

```text
.
|-- client/       Vue 3 + TypeScript planning poker app
|-- server/       Express + Socket.IO realtime backend
|-- landing/      Hugo/Hugoplate marketing site
|-- docs/         Project architecture and contributor documentation
|-- README.md     Public project overview
|-- DEPLOY.md     Existing deployment walkthrough
|-- CLAUDE.md     Existing agent-oriented notes
|-- AGENTS.md     Agent entrypoint and docs index
```

## Runtime Shape

```text
Browser client
  |
  | Socket.IO over VUE_APP_SERVER
  v
Node server
  |
  | in-memory room/player/ticket/PRA state
  v
Socket.IO rooms
```

The landing site is independent from this runtime path. It builds static pages and links users into the app URL configured in Hugo parameters.

## Quick Orientation

- The client uses Vue Router hash mode with `/` for session creation and `/game/:id` for a room.
- The server creates or joins rooms from the Socket.IO handshake query, then broadcasts room snapshots through an `update` event.
- Game state is process-local memory. Server restarts clear rooms, players, tickets, votes, and PRA sessions.
- Planning formats are defined on the server and sent to clients through `gameTypes`.
- PRA mode is a two-phase flow: chance of failure first, impact second, then risk class scoring.
- There are no automated tests currently declared for the client or server.
