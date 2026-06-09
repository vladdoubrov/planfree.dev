# Architecture

## System Overview

Planfree.dev has three independently understandable parts:

| Area | Path | Purpose | Primary stack |
| --- | --- | --- | --- |
| Realtime app client | `client/` | Planning poker UI, room joining, voting, tickets, PRA UI | Vue 3, TypeScript, Vue CLI, Socket.IO client |
| Realtime app server | `server/` | Room membership, votes, tickets, game formats, PRA state | Node.js, Express, Socket.IO |
| Marketing site | `landing/` | Static public website and content pages | Hugo, Hugoplate, Tailwind CSS |

The application is intentionally small and stateful. The server is the source of truth for active room state, while the browser keeps a reactive projection of the latest server snapshot.

## Client Architecture

Important files:

- `client/src/views/Home.vue` starts a new Socket.IO connection without a room id. The server responds with a generated room id, then the client navigates to `#/game/:id`.
- `client/src/views/Game.vue` connects to an existing room id from the route, renders the lobby, emits vote/control events, and handles PRA-specific controls.
- `client/src/composables/useGameEngine.ts` owns shared reactive socket state and server event handlers.
- `client/src/composables/useTickets.ts` exposes ticket state and emits ticket updates.
- `client/src/router/index.ts` uses hash routing with `createWebHashHistory()`.
- `client/src/view-models/` contains TypeScript interfaces for socket payload shapes.

Key client decisions:

- Shared socket state lives in module-level Vue refs inside composables. This makes the current socket, players, tickets, vote state, and PRA state available across views/components without Vuex.
- The server sends the available game formats. The client stores them in `localStorage` so settings can render known formats.
- The app uses hash routes, which keeps static hosting simple because the server does not need to rewrite nested client routes.
- User display names are stored in `localStorage` and re-emitted on room entry.
- The PWA pieces are minimal: a web manifest and a service worker that cache-firsts images through Workbox from a CDN import.

## Server Architecture

Important files:

- `server/index.js` contains the Express app, Socket.IO setup, state arrays, game format definitions, and all socket handlers.
- `server/package.json` starts development with `nodemon index.js`.
- Root `package.json` starts production-like server execution with `node server/index.js` and installs server dependencies in `postinstall`.

The server keeps four process-global state collections:

| State | Shape | Purpose |
| --- | --- | --- |
| `players` | `{ id, name, roomId, vote? }[]` | Connected socket participants grouped by room |
| `tickets` | ticket objects with `roomId` attached | Stories/issues and their selected score |
| `gameType` | `{ id, gameType, roomId }[]` | Selected voting format per room |
| `praSession` | `{ roomId, phase, chanceOfFailure, impact }[]` | PRA two-phase state per room |

Key server decisions:

- Socket.IO rooms are the broadcast boundary. Every update is emitted with `io.to(roomId)`.
- State is in memory only. There is no database, persistence, room cleanup, or recovery after restart.
- The server owns score calculation and ticket scoring. Clients emit votes and controls, then render the server's results.
- `updateClientsInRoom(roomId)` sends a full room snapshot through the `update` event.
- A 20 second interval broadcasts `ping` and logs active rooms. Clients respond with `pong`.
- Available game formats are hardcoded in `server/index.js`, including Fibonacci, T-Shirt, Powers of 2, Linear 1-5, and PRA.

## Planning Poker Flow

1. A browser on the home route opens a socket with no `roomId`.
2. The server generates a short room id, emits `room`, joins the socket to that room, and sends `gameTypes`.
3. The client navigates to `#/game/:roomId`.
4. Participants joining the room connect with `query.roomId`.
5. Each participant emits `name`, then later `vote`.
6. The server updates the player record and broadcasts `update`.
7. When all players have voted, or a client emits `show`, the server calculates the average and closest value.
8. The server emits `show`; clients reveal votes after their countdown.
9. A client emits `restart`; the server clears votes and advances to the next unscored ticket if needed.

## PRA Flow

PRA mode uses the same socket room infrastructure but changes the scoring lifecycle:

1. Switching to the PRA game type resets PRA state to phase 1.
2. Phase 1 votes represent chance of failure, on a 1-5 scale.
3. On reveal, the server rounds the average, stores `chanceOfFailure`, and emits `praPhase1Complete`.
4. Restarting after phase 1 moves the room to phase 2 and emits `praPhase2Start`.
5. Phase 2 votes represent impact, on a 1-5 scale.
6. On reveal, the server stores `impact`, calculates `riskScore = chanceOfFailure * impact`, classifies it as `LOW`, `MIDDLE`, or `HIGH`, updates the current ticket score, and emits `praComplete`.
7. Clients may emit `praSetFinalResult` to manually override the final phase score before continuing.
8. Clients may emit `resetPRASession` to return to phase 1 and clear PRA/vote state.

## Key Architectural Tradeoffs

- In-memory state keeps the app simple and cheap to run, but active sessions are lost on server restart and cannot scale across multiple server instances without sticky sessions or shared storage.
- Socket.IO rooms make realtime updates straightforward, but the event contract is implicit in code. See [Realtime Events](./realtime-events.md) before changing payloads.
- The server has broad ownership of business logic. This avoids client disagreement, but all scoring behavior currently lives in one `server/index.js` file.
- The client is built around global composable refs instead of a formal store. This is lightweight for the current app size, but future multi-page state will need discipline to avoid stale socket handlers.
- The landing site is isolated from the app build. That allows independent static deployment, but app URLs must stay aligned between Hugo config and deployed client/server environments.

## Known Constraints

- No automated room expiration or memory cleanup exists.
- Disconnects remove players immediately.
- The server assumes at least one valid counted vote when calculating averages.
- The CircleCI config currently only checks out the repo and echoes text.
- The client route table does not define a `/privacy` route, while `Home.vue` attempts to navigate there. The landing site has `/privacy-policy`.
