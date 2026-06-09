# Realtime Events

Socket.IO is the contract between `client/` and `server/`. The server is the authoritative owner of room state and emits snapshots/results. The client emits user actions.

## Connection

| Direction | Event | Payload | Notes |
| --- | --- | --- | --- |
| Client to server | Socket handshake query `roomId` | string, optional | If omitted, the server creates a room id. If present, the socket joins that room. |
| Server to client | `room` | `roomId: string` | Emitted only when the server generated a new room. |
| Server to client | `gameTypes` | `GameFormat[]` | Sent on connection. Client stores it in `localStorage`. |
| Server to client | `ping` | none | Broadcast every 20 seconds. |
| Client to server | `pong` | none | Keep-alive response. Server currently does not mutate state on this event. |

## Shared State Snapshot

| Direction | Event | Payload | Notes |
| --- | --- | --- | --- |
| Server to room | `update` | `{ players, tickets, gameType, praSession }` | Main synchronization event. Sent after names, votes, tickets, game type changes, restart, and PRA updates. |

Snapshot fields:

- `players`: player records for the room.
- `tickets`: ticket records for the room.
- `gameType`: selected game format for the room.
- `praSession`: PRA room state when present.

## Planning Poker Actions

| Direction | Event | Payload | Server behavior |
| --- | --- | --- | --- |
| Client to server | `name` | `string` | Updates the current socket player's display name and emits `update`. |
| Client to server | `vote` | vote value | Stores the player's vote. If every player in the room has a vote, the server reveals automatically. |
| Client to server | `show` | none | Reveals votes for the current room. |
| Server to room | `show` | `{ average, closest }` | Sent for non-PRA reveals. Clients show average and closest format value. |
| Client to server | `restart` | none | Clears votes, advances ticket selection when appropriate, and emits `restart` plus `update`. |
| Server to room | `restart` | none | Tells clients to clear reveal UI and local current vote. |
| Client to server | `gameTypeChanged` | `GameFormat` | Updates room game type, resets votes, resets PRA state when switching into PRA, and emits `update`. |
| Client to server | `ticket` | `Ticket[]` | Replaces the room's tickets, attaches `roomId`, sets `votingOn` when only one ticket exists, and emits `update`. |

## PRA Events

| Direction | Event | Payload | Behavior |
| --- | --- | --- | --- |
| Server to room | `praPhase1Complete` | `{ chanceOfFailure, average }` | Phase 1 reveal result. |
| Server to room | `praPhase2Start` | none | Sent after restart when phase 1 has a final chance of failure. |
| Server to room | `praComplete` | `{ chanceOfFailure, impact, riskScore, riskClass, averageImpact }` | Phase 2 reveal result. Also scores the current ticket. |
| Client to server | `praSetFinalResult` | `{ finalScore }` | Manually sets phase 1 chance of failure or phase 2 impact. |
| Server to room | `praPhase1FinalSet` | `{ chanceOfFailure }` | Acknowledges a manual phase 1 final result. |
| Server to room | `praFinalResultSet` | `{ chanceOfFailure, impact, riskScore, riskClass }` | Acknowledges a manual phase 2 final result and updates ticket score. |
| Client to server | `resetPRASession` | none | Resets PRA state and player votes. |
| Server to room | `praSessionReset` | none | Tells clients to clear PRA UI state. |

## Scoring Rules

Non-PRA formats:

- Numeric votes are averaged directly.
- Non-numeric formats, such as T-Shirt, use the vote index in the format values array for averaging.
- `?` is ignored in average calculation.
- The current ticket score is set to the closest value in the selected format.

PRA format:

- Values are `[1, 2, 3, 4, 5]`.
- Phase 1 result is the rounded average chance of failure.
- Phase 2 result is the rounded average impact.
- Risk score is `chanceOfFailure * impact`.
- Risk class is `LOW` for 1-6, `MIDDLE` for 7-12, and `HIGH` for 13-25.
