---
task: app-foundation
artifact: pr
branch: app-foundation
base: main
pr: not created          # the pull request's address, once created
---

# feat(app): add application foundation with health endpoint

## Summary

Adds the base of the Task API: `createApp(config)` builds the Express 5 app without calling `listen()` or reading `process.env`, `src/server.js` starts it on the configured `PORT`, and `GET /health` answers `{ "status": "ok" }`. Unknown routes and errors also answer in JSON, each request gets one log line, and ESLint and `node:test` are set up, so the next increments build on a tested, linted base.

## Changes

- Package and tooling (`package.json`, `package-lock.json`, `.env.example`, `eslint.config.js`): CommonJS package with `express` 5.3.0 as the only runtime dependency, scripts `start`, `dev`, `test` and `lint`, `engines.node` `>=22.13.0`, ESLint 10 flat config with `eqeqeq`, `prefer-const` and `no-var`.
- Configuration (`src/config.js`): `loadConfig(env)` reads `PORT`; default 3000, digits only and 1 to 65535, otherwise an error that names `PORT`.
- Middleware (`src/middleware.js`): request logger (ISO timestamp, method, path without query string, status, duration), JSON 404 for unknown routes, one error handler that keeps stack traces and internal messages out of the response and writes the stack to the log.
- App (`src/app.js`): `GET /health`, `express.json()` with the 100 kb limit (400 and 413 as `{ "error": "<message>" }`), no `X-Powered-By`, two marked placeholders for `helmet()` and CORS.
- Entry point (`src/server.js`): prints the port it listens on; an invalid configuration or a listen error such as `EADDRINUSE` goes to stderr and exits with code 1.
- Tests (`test/config.test.js`, `test/error-handler.test.js`, `test/app.test.js`): 15 tests, 190 lines.
- Task files: `work/app-foundation/`.
- Size: 152 lines of production code in 7 files, plus the generated `package-lock.json`; one runtime dependency.

## How to test

```bash
npm ci
npm run lint
npm test
```

Manual checks, with the server on port 4000:

| Command | Expected |
| --- | --- |
| `PORT=4000 npm start` | prints `Task API listening on port 4000` and keeps running |
| `curl -i http://localhost:4000/health` | 200, JSON, `{"status":"ok"}`, no `X-Powered-By` header; one request line in the server output |
| `curl -i "http://localhost:4000/nope?x=1"` | 404 `{"error":"Route GET /nope does not exist"}`; the logged path has no query string |
| `curl -i -X POST -H 'Content-Type: application/json' -d '{"title":' http://localhost:4000/health` | 400 `{"error":"<text>"}` |
| `PORT=abc npm start; echo $?` | message that names `PORT` on stderr, then `1` |
| `printf 'PORT=4001\n' > .env`, then `npm run dev` (delete `.env` afterwards) | prints `Task API listening on port 4001` |

## Quality gates

| Gate | Task file | Result |
| --- | --- | --- |
| Plan critique | `critique.md`, round 1 | approved |
| Code review | `review.md`, round 1 | approved |
| Tests | `test-report.md`, round 1 | pass |

The branch contains all of `origin/main` (`811ebfa`), and no code changed since the tested commit `13ee9be`.

Known issue found by testing (low, outside this task's scope, not blocking; task-doc-updates records it): a request that Node's HTTP parser rejects before Express runs gets an empty `400` or `431`, with no JSON body and no log line.

## Tech debt

- TD-app-foundation-1: `helmet()` is not mounted (SEC-7), marked in `src/app.js`; removed by security-headers
- TD-app-foundation-2: CORS is not mounted (SEC-8), marked in `src/app.js`; removed by cors-policy
- Review findings accepted without a change, no TD id: F1 (nit: T3 does not pin the digits-only `PORT` rule) and F2 (minor: `createApp` does not check that `config.log` is a function)

## Follow-ups

- security-headers: mount `helmet()` on every response (SEC-7); removes TD-app-foundation-1
- cors-policy: allow CORS only for known origins (SEC-8), when a browser client exists; removes TD-app-foundation-2
