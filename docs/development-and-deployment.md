# Development and Deployment

## Prerequisites

- Node.js and npm for the client and server.
- Hugo Extended, Go, and npm for the landing site.

The repository currently contains `node_modules` directories, but local setup should still be treated as package-managed.

## Local Development

Server from the repository root:

```bash
npm install
npm start
```

Server from `server/`:

```bash
cd server
npm install
npm start
```

Client:

```bash
cd client
npm install
npm run serve
npm run build
npm run lint
```

Landing site:

```bash
cd landing
npm install
npm run dev
npm run build
```

## Environment Variables

Client:

| Variable | Purpose |
| --- | --- |
| `VUE_APP_SERVER` | Socket.IO server URL used by `Home.vue` and `Game.vue`. |

Server:

| Variable | Purpose |
| --- | --- |
| `ORIGIN` | CORS origin allowed by Socket.IO. Code fallback is `http://localhost:8081`. |
| `PORT` | Server port. Defaults to `3000`. |

Example env files exist under `client/example/.env` and `server/example/.env`; local env files already exist but should not be assumed portable.

## Deployment Shape

The realtime app deploys as two services:

- Server: Node process running `server/index.js`.
- Client: static Vue build from `client/dist`.

Important deployment coupling:

- The client build needs `VUE_APP_SERVER` set to the deployed server URL.
- The server needs `ORIGIN` set to the deployed client origin.
- Root `package.json` is geared toward server deployment with `npm start` and a `postinstall` that installs `server/` dependencies.
- `railway.json` uses Railway Nixpacks and starts with `npm start`.
- `DEPLOY.md` contains the existing Railway/Vercel/Render walkthrough.

The landing site is separate:

- Hugo builds static output from `landing/`.
- Production app URL is configured in `landing/config/production/config.toml` as `params.appURL`.
- The navigation button default in `landing/config/_default/params.toml` points to `http://localhost:9999`; production config should override behavior where needed.

## Verification

Available checks:

```bash
cd client
npm run build
npm run lint
```

```bash
cd landing
npm run build
```

There are no automated test suites currently declared for the client or server. The CircleCI job is a placeholder that only runs `echo "hello world"`.

## Operational Notes

- Room state is not durable. Restarting the server clears active sessions.
- There is no multi-instance coordination. If horizontally scaling the server, add sticky sessions and/or shared state.
- There is no automatic inactive-room cleanup.
- Logs are written with `console.log`, including active room listings every 20 seconds.
