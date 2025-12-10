# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

planfree.dev is a free planning poker application for agile teams. The project consists of three main parts:
- **Client**: Vue 3 + TypeScript frontend application
- **Server**: Node.js/Express + Socket.IO backend for real-time communication
- **Landing**: Hugo-based static marketing site

## Architecture

### Real-Time Communication Flow

The application uses Socket.IO for real-time bidirectional communication between clients and server:

1. **Room-Based Architecture**: Players join rooms using unique short UUIDs. All game state (players, votes, tickets) is maintained in-memory on the server and scoped by roomId.

2. **Key Socket Events**:
   - `connection` → Server generates or accepts roomId, joins socket to room
   - `name` → Player sets their display name
   - `vote` → Player submits a vote; server checks if all players voted to auto-reveal
   - `show` → Manually reveal votes and calculate average/closest value
   - `restart` → Reset votes and move to next ticket
   - `gameTypeChanged` → Switch between voting scales (Fibonacci, T-Shirt, Powers of 2, Linear 1-5)
   - `ticket` → Update the list of tickets to vote on
   - `ping`/`pong` → Keep-alive mechanism (20s interval)

3. **Game State Management**: Server maintains three global arrays (players, tickets, gameType) filtered by roomId. The `updateClientsInRoom()` function broadcasts updates to all clients in a room via the `update` event.

4. **Vote Calculation**: The `showVotes()` function calculates the average vote and finds the closest value in the current game type scale. For non-numeric scales (T-Shirt sizes), it uses array indices for averaging.

### Client Architecture

- **Composables**: `useGameEngine.ts` contains the core socket connection logic and reactive state (players, votes, countdown, tickets)
- **Views**: Two main routes managed by Vue Router (hash mode):
  - `/` (Home) - Create/join room interface
  - `/game/:id` (Game) - The actual planning poker interface
- **View Models**: TypeScript interfaces for Player, Game, Ticket, and GameFormat
- **Components**: Reusable UI components (Input, LittleButton, Modal, SettingsModal, SharingModal, Tickets)

### Environment Configuration

**Client** (`client/example/.env`):
- `VUE_APP_SERVER` - Backend server URL (e.g., http://localhost:3000 for dev, production URL for deploy)

**Server** (`server/example/.env`):
- `ORIGIN` - CORS allowed origin for client (e.g., http://localhost:8080 for dev, production URL for deploy)
- `PORT` - Optional, defaults to 3000

Copy these example `.env` files to the respective directory roots and update values for local development.

## Development Commands

### Root Project
```bash
npm install        # Install server dependencies
npm start         # Start server (nodemon with auto-reload)
```

### Client (Vue App)
```bash
cd client
npm install       # Install dependencies
npm run serve     # Development server with hot-reload (default: http://localhost:8080)
npm run build     # Production build to dist/
npm run lint      # Lint and fix files
```

### Server
```bash
cd server
npm install       # Install dependencies
npm start         # Start with nodemon (watches for changes)
```

### Landing Page (Hugo)
```bash
cd landing
# Hugo commands (site is deployed separately to Netlify/Vercel)
```

## Deployment

The project supports multiple deployment platforms (Railway, Vercel, Render). See `DEPLOY.md` for detailed instructions.

**Key Points**:
- Server and client deploy separately
- Server requires `ORIGIN` env var matching client URL for CORS
- Client requires `VUE_APP_SERVER` env var pointing to server URL
- Root `package.json` is configured for server deployment (e.g., Railway)
- Client builds from the `client/` directory
- Landing page is independent and deploys separately

## Testing

There are no automated tests in this codebase currently.

## Known Behaviors

- Game state is in-memory only - server restarts will clear all active games
- Rooms are never cleaned up automatically; inactive rooms persist until server restart
- The `logRooms()` function runs every 20 seconds to console.log active rooms
- Players who disconnect are removed from the game immediately
- Votes are automatically revealed when all players in a room have voted
- The "closest value" algorithm rounds to the nearest value in the current game type scale
