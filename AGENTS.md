# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Team Tasks API — a Node.js + Express + SQLite REST API for team/project/task management. Single-service, no external dependencies. See `README.md` for endpoint reference and local setup commands.

### Runtime

- Requires **Node.js 20.x** (`engines` field in `package.json`). The environment uses nvm; run `nvm use 20` before starting.
- `better-sqlite3` includes a native addon — if you switch Node major versions, delete `node_modules` and re-run `npm install` to rebuild it.

### Running the server

```bash
npm start          # starts on port 3000 (configurable via PORT in .env)
curl localhost:3000/health   # → {"status":"ok"}
```

### Seeding demo data

```bash
npm run seed       # creates alice@example.com / bob@example.com (password: Password1!)
```

### Key caveats

- No lint, test framework, or TypeScript in the project. There are no `npm test` or `npm run lint` scripts.
- The SQLite DB file (`data.sqlite`) is auto-created on first server start. Delete it to reset state.
- CORS origin defaults to `http://localhost:4200` (configurable via `FRONTEND_URL` in `.env`).
- The `.env` file is created from `.env.example` by the update script if missing.
