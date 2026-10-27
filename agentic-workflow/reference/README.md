# Task API

A REST API for personal tasks (to-dos): users register, sign in with a JSON Web Token and manage their own tasks. Node.js and Express 5; data in a local JSON file first, in Cloud Firestore later.

Status: in development. Finished and planned increments: `docs/ROADMAP.md`; design: `docs/ARCHITECTURE.md`; open shortcuts and known issues: `docs/TECH_DEBT.md`, `docs/KNOWN_ISSUES.md`.

## Features

| Feature | Endpoint or command | Since |
| --- | --- | --- |
| Health check: `{ "status": "ok" }`, no authentication | `GET /health` | app-foundation |
| JSON error responses `{ "error": "<message>" }`: 404 for an unknown route or method, 400 for malformed JSON, 413 for a JSON body over 100 kb, 500 for a server error | any request | app-foundation |
| Request log: one line per request with timestamp, method, path (no query string), status and duration | `npm start`, `npm run dev` | app-foundation |

## Requirements

- Node.js 22.13.0 or newer, with npm
- Git, and GitHub CLI (`gh`) for pull requests

## Setup

```bash
npm install
cp .env.example .env    # only `npm run dev` needs it
```

## Configuration

| Variable | Meaning | Default |
| --- | --- | --- |
| `PORT` | HTTP port: an integer from 1 to 65535, digits only | `3000` |

`npm start` reads the process environment only. `npm run dev` also loads `.env`: a variable already set in the shell wins over `.env`, and a missing `.env` stops it with `.env: not found`. `.env` is never committed; `.env.example` is.

## Run

```bash
npm start       # listens on PORT
npm run dev     # loads .env and restarts when a file changes
```

The server prints `Task API listening on port <port>`, then one log line per request, for example `2026-10-27T11:30:00.000Z GET /health 200 3ms`. If `PORT` is invalid or the port is already in use, it prints a message to stderr and exits with code 1.

## Test

```bash
npm test        # automated tests (node:test); no .env needed
npm run lint    # ESLint
```

Manual testing: start the server with `npm start`, then run in a second terminal:

| Command | Expected |
| --- | --- |
| `curl -i http://localhost:3000/health` | `200`, JSON, body `{"status":"ok"}`, no `X-Powered-By` header; one log line in the server output |
| `curl -i "http://localhost:3000/nope?x=1"` | `404`, body `{"error":"Route GET /nope does not exist"}`; the logged path has no query string |
| `curl -i -X POST -H 'Content-Type: application/json' -d '{"title":' http://localhost:3000/health` | `400`, body `{"error":"<text>"}` |
| `PORT=abc npm start; echo $?` | a message that names `PORT` on stderr, then `1` |

## Development workflow

Every change goes through the phases described in `AGENTS.md`, each one a skill in `.agents/skills/`. The files of a task are in `work/<slug>/`. A task starts with the task-scoping skill, for example: "Start the roadmap item user-registration".
