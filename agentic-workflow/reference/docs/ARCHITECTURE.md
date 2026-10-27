# Architecture

## Overview

A stateless REST API: Node.js 22.13 or newer, Express 5, CommonJS modules. Clients exchange JSON over HTTP; authenticated requests will carry a JSON Web Token in the `Authorization` header. `src/server.js` loads the configuration and starts the app that `createApp(config)` builds. Authentication, tasks and storage are not built yet; they appear with the increments in `docs/ROADMAP.md`.

## Components

| Component | Location | Responsibility |
| --- | --- | --- |
| Configuration | `src/config.js` | `loadConfig(env)` reads the settings from an environment object; today only `PORT` (default 3000, digits only, 1 to 65535, otherwise an error that names `PORT`) |
| App factory | `src/app.js` | `createApp(config)` builds the Express app: middleware, `GET /health` and the placeholders for `helmet()` and CORS; never calls `listen()` or reads `process.env`; `config.log` is the log function |
| Middleware | `src/middleware.js` | `createRequestLogger(log)`, `notFound` (404 for unknown routes) and `createErrorHandler(log)` (the single error handler) |
| Entry point | `src/server.js` | loads the configuration from `process.env`, starts `createApp` on `PORT` and prints the port; an invalid configuration or a listen error such as `EADDRINUSE` goes to stderr and ends the process with exit code 1 |

## Data model

| Entity | Fields | Stored in |
| --- | --- | --- |
| None yet | | |

## Request flow

A request passes the steps below in order; the first step that answers ends it. There is no storage yet.

| Step | Component | Effect |
| --- | --- | --- |
| 1 | Request logger | notes the start time and the path without query string; when the response finishes, writes one line to the log function: ISO timestamp, method, path, status, duration in ms |
| 2 | `express.json()` | parses a JSON body of up to 100 kb; malformed JSON is an error with status 400, a larger body one with status 413 |
| 3 | Routes | `GET /health` answers 200 `{ "status": "ok" }` |
| 4 | `notFound` | any other method and path answers 404 `{ "error": "Route <METHOD> <path> does not exist" }` |
| 5 | Error handler | answers every error that is thrown, rejected or passed to `next`: the status is the error's `status` when it is an integer from 400 to 599, otherwise 500; below 500 the message is the error's own, from 500 up it is `Internal server error` and the error with its stack goes to the log, never to the response |

The logger comes first, so parser errors and unknown routes are logged too. `helmet()` and CORS will be mounted between steps 1 and 2, CORS before the body parser (`TD-app-foundation-1`, `TD-app-foundation-2`). `X-Powered-By` is disabled.

## Decisions

| ID | Decision | Reason | Task |
| --- | --- | --- | --- |
| D1 | Node.js 22 or newer, Express 5, CommonJS modules | the stack of the PWCC course; Express 5 sends rejected promises from async routes to the error handler | before the first task |
| D2 | All persistence behind one storage module: a local JSON file first, Cloud Firestore later | the switch to Firestore must not change routes or business logic (`DATA-1`) | before the first task |
| D3 | Stateless authentication with JSON Web Tokens in the `Authorization` header | REST statelessness (`SEC-3`, `SEC-4`) | before the first task |
| D4 | Tests with `node:test` and `fetch` against the app started on a free port | no extra test framework (`TEST-1`, `TEST-2`) | before the first task |
| D5 | The app is built by `createApp(config)`, which never calls `listen()` or reads `process.env`; `src/server.js` is the only entry point | tests start the app on a free port with their own configuration, and the app reads no global state (`API-7`) | app-foundation |
| D6 | One error handler, last in the chain, answers every error as `{ "error": "<message>" }`; a server error gives `Internal server error` and its stack goes to the log only | no stack trace or internal message reaches a client (`API-4`, `API-6`) | app-foundation |
| D7 | Request logging by our own middleware, to a log function passed in; it logs method and path, never query string, headers or body | a query string can carry secrets (`SEC-10`); morgan's predefined formats log the query string, and morgan or pino-http would be a second runtime dependency | app-foundation |
| D8 | Settings come from environment variables only, read by `src/config.js`; `npm run dev` loads `.env` with `node --env-file` | no dotenv dependency; a variable set in the shell wins over `.env` | app-foundation |
| D9 | `GET /health` answers `{ "status": "ok" }` and checks nothing else (liveness only) | one endpoint with one meaning; `/livez` and `/readyz` have nothing to be ready for yet | app-foundation |
| D10 | `express.json()` with its default 100 kb limit is mounted from the start | the invalid-JSON rule of `API-6` is implemented and tested once, before the first route that reads a body | app-foundation |
| D11 | `X-Powered-By` is disabled now; `helmet()` and CORS are deferred behind marked placeholders | a second runtime dependency exceeds the increment budget, and no browser client exists yet (`TD-app-foundation-1`, `TD-app-foundation-2`) | app-foundation |
| D12 | The minimum Node.js version is 22.13.0 (`engines.node`) | ESLint 10 supports `^22.13.0` on the 22 line; refines D1 | app-foundation |
