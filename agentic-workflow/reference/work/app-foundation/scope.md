---
task: app-foundation
artifact: scope
version: 1
status: confirmed        # draft | confirmed (only after the user confirms)
branch: app-foundation
roadmap_item: app-foundation
---

# Scope: Application foundation

## Goal

A developer can install the project, start the Task API with `npm start` or `npm run dev` and check it with `GET /health`. Every response, including unknown routes and errors, is JSON, and each request is logged. `npm run lint` and `npm test` work, so the next increments build on a tested, linted base.

## Requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| R1 | Configuration comes from environment variables and is read by one module (`src/config.js`) from an environment object. This increment defines one variable, `PORT`: the default is 3000 when it is unset; a value that is not an integer from 1 to 65535 is rejected with an error that names `PORT`. | Given an environment without `PORT`, when the configuration is loaded, then the port is 3000. Given `PORT=8080`, then the port is 8080. Given `PORT=abc`, `PORT=0` or `PORT=70000`, then loading fails with an error whose message contains `PORT`. |
| R2 | `src/app.js` exports `createApp(config)`, which builds and returns the Express app without calling `listen()` and without reading `process.env` (API-7). Everything the app needs, such as the log function, comes from its argument. | Given a test configuration, when a test calls `createApp(config).listen(0)`, then the server answers HTTP requests on the port the system picked. `src/app.js` contains no `listen()` call and no `process.env`. |
| R3 | `src/server.js` loads the configuration from `process.env`, builds the app with `createApp`, listens on the configured port and prints a line that names the port. `npm start` runs `node src/server.js`; `npm run dev` runs `node --env-file=.env --watch src/server.js`. If the configuration is invalid or listening fails (for example the port is in use), it prints a message to stderr and exits with code 1. | Given `PORT=4000` in the environment, when `npm start` runs, then the process prints a line naming port 4000, keeps running, and `GET http://localhost:4000/health` answers 200. Given `PORT=abc`, or a port that another process already uses, when the server starts, then it prints an error message to stderr and exits with code 1. Given a `.env` file with `PORT=4001`, when `npm run dev` runs, then the server listens on 4001. |
| R4 | `GET /health` answers 200 with the JSON body `{ "status": "ok" }`, with no authentication and no other fields. | Given the running app, when a client sends `GET /health`, then the response is 200 with a JSON content type and the body is exactly `{ "status": "ok" }`. |
| R5 | The app parses JSON request bodies with `express.json()` and its default limit of 100 kb. A body that is not valid JSON is answered with 400 and a body over the limit with 413, both in the standard error format `{ "error": "<message>" }` (API-4, API-6). | Given a request with `Content-Type: application/json` and the malformed body `{"title":`, when it is sent to any path, then the response is 400 with a body of the form `{ "error": "<non-empty text>" }`. Given a JSON body larger than 100 kb, then the response is 413 in the same format. |
| R6 | A request that matches no route is answered with 404 and `{ "error": "Route <METHOD> <path> does not exist" }`, where `<path>` has no query string (API-6). | Given the app, when a client sends `GET /nope?x=1`, then the response is 404 with the body `{ "error": "Route GET /nope does not exist" }`. The same holds for a method that has no route on an existing path, such as `DELETE /health`. |
| R7 | One error handler, the last middleware, answers every error that reaches it. The status is the error's `status` when it is an integer from 400 to 599 and 500 otherwise. The message is the error's own message for statuses below 500 and `Internal server error` for 500 and above. Stack traces and internal messages never reach the response; an error with status 500 or above is written with its stack to the server log (API-6). | Given a route that throws or rejects an error without `status`, when a client requests it, then the response is 500 with `{ "error": "Internal server error" }`, the body contains neither the stack nor the original message, and the error with its stack is written to the server log. Given an error with `status` 400 and the message `Bad input`, then the response is 400 with `{ "error": "Bad input" }`. Given an error with `status` 200, then the response is 500. |
| R8 | Every request is logged when its response finishes, including unknown routes and errors: one line with an ISO 8601 timestamp, the method, the path without query string, the status code and the duration in milliseconds, for example `2026-10-27T11:30:00.000Z GET /health 200 3ms`. Query strings, headers and bodies are never logged (SEC-10). The line goes to a log function passed to `createApp`: the server passes `console.log`, tests pass their own or a silent one. | Given a log function that collects lines, when a client sends `GET /health?token=abc`, then after the response finishes exactly one line was collected, it has the form `<ISO timestamp> GET /health 200 <n>ms`, and it does not contain `token`. Given `GET /nope`, then the collected line shows status 404. |
| R9 | Responses carry no `X-Powered-By` header (`app.disable("x-powered-by")`). | Given the app, when a client sends `GET /health` or requests an unknown route, then the response has no `X-Powered-By` header. |
| R10 | `createApp` marks the places where `helmet()` (SEC-7) and CORS (SEC-8) will be mounted with the comments `TODO(TD-app-foundation-1)` and `TODO(TD-app-foundation-2)`. Neither package is added. | Given the source after this task, when `src/` is searched for `TODO(TD-app-foundation-`, then exactly two markers are found in `createApp`, one for helmet and one for CORS. `package.json` lists neither `helmet` nor `cors`, and both IDs are recorded in `work/app-foundation/tech-debt.md`. |
| R11 | `npm run lint` runs ESLint 10 with a flat config in CommonJS (`eslint.config.js`) over `src/`, `test/` and the config file: the `@eslint/js` recommended rules plus `eqeqeq`, `prefer-const` and `no-var` (JS-10), with `sourceType: "commonjs"` and Node globals. | Given the project after this task, when `npm run lint` runs, then it reports no problems and exits with code 0. Given a file that contains `var x = 1;` or `a == b`, then `npm run lint` fails. |
| R12 | `npm test` runs `node --test` over `test/*.test.js`, written with `node:test` and `node:assert/strict`. HTTP tests start the app on a free port (`listen(0)`) and call it with `fetch`; each test file uses its own configuration; no test calls an external service (TEST-1, TEST-2, TEST-4, TEST-5). The suite covers R1, R2 and R4 to R9: the success path of each, plus the error cases that protect security or data (an invalid `PORT`, malformed and oversized bodies, no stack trace in an error response, no query string in the log) (TEST-3), with names that describe behavior (TEST-6). | Given the dependencies installed, when `npm test` runs, then all tests pass and the exit code is 0. Given a test changed to fail, then `npm test` exits with a non-zero code. |
| R13 | `package.json` is CommonJS (no `"type": "module"`) and declares `express` 5 as the only runtime dependency, `eslint`, `@eslint/js` and `globals` as dev dependencies, `engines.node` as `>=22.13.0`, and the scripts `start`, `dev`, `test` and `lint`. `package-lock.json` is committed. `.env.example` lists `PORT=3000`; `.env` stays ignored by git (GIT-4). | Given a fresh clone, when `npm ci` runs, then it installs from the lock file without errors. `npm ls --omit=dev --depth=0` lists `express` only; `git check-ignore .env` prints `.env`, and `.env.example` is tracked. |

## Out of scope

- Graceful shutdown on SIGTERM and SIGINT.
- HTTPS/TLS, Docker and continuous integration.
- A path prefix or versioning such as `/api/v1` (the standards use unprefixed paths).
- `helmet()` (SEC-7) and CORS (SEC-8): deferred to the follow-ups below; only the placeholders of R10 are added.
- Rate limiting for `/auth/login` (SEC-7): handled by user-login.
- Users, authentication, tasks and the storage module (roadmap items 2 to 8). `JWT_SECRET` (SEC-6) arrives with user-login and `DATA_FILE` with user-registration.
- A `NODE_ENV` setting, or any environment variable besides `PORT`.
- Readiness checks of dependencies in the health check, `/livez` and `/readyz`, and extra health fields such as uptime or version.
- Structured or asynchronous production logging (for example Pino).
- Changes to `README.md` and `docs/`: task-doc-updates writes them after the merge.

## Options considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Express 5.3.0 with CommonJS modules | Project decision D1; errors thrown or rejected in handlers reach the error handler without wrapper code; `express.json()` is built in | `req.body` is `undefined` unless a parser ran; wildcard routes need a name (`/{*splat}`) | chosen |
| Request logging: hand-written middleware | No dependency; logs the path only, so a query string cannot leak (SEC-10); the output function can be replaced in tests | `console.log` is synchronous on terminals and files; no structured output | chosen |
| Request logging: morgan 1.12.1 | Established, one-line setup | Second runtime dependency (with 5 of its own); the predefined formats log `req.originalUrl`, which includes the query string | rejected |
| Request logging: pino-http 11 | Structured JSON logs; Pino is the library the Express production guide recommends for application logs | Second runtime dependency that pulls in pino 10; more than a foundation needs | rejected; revisit when the app is deployed |
| Configuration: Node `--env-file` and `process.env` | No dependency; real environment variables win over `.env` | A missing `.env` stops `npm run dev` with `.env: not found` | chosen |
| Configuration: dotenv 18.0.9 | Familiar | Second runtime dependency; duplicates what Node 22 does | rejected |
| Health check: `GET /health` returning `{ "status": "ok" }` | One endpoint with one meaning; easy to probe | Liveness only | chosen |
| Health check: `/livez` and `/readyz` | Separates "alive" from "ready" | Two endpoints with nothing yet to be ready for; `/healthz` is deprecated in the Kubernetes API server | rejected |
| Health check: IETF health-check draft format (`application/health+json`) | Defined field names | Individual draft that expired in 2022, with no formal standing | rejected |
| Security headers: defer `helmet()` 8.3.0 and `cors` 2.8.6, disable `x-powered-by` now | Stays within one runtime dependency; the placeholders keep the debt visible | Responses carry no security headers until the follow-ups are done | chosen |
| Security headers: add `helmet()` now | Meets SEC-7 at once | Second runtime dependency, over the increment budget | rejected |
| JSON bodies: `express.json()` now | Implements and tests the 400 rule of API-6; later increments need no setup | One more middleware before the routes | chosen |
| JSON bodies: leave to user-registration | Smaller foundation | The invalid-JSON rule of API-6 would be neither implemented nor tested | rejected |
| Lint: ESLint 10 with a flat config | Named by JS-10; flat config is the current format | Needs Node 22.13 or newer | chosen |
| Tests: `node:test` with `fetch` | No dependency (D4, TEST-1) | Only the built-in runner; no other test framework is allowed | chosen |

Sources:

- [Upgrade to Express v5](https://expressjs.com/en/guide/migrating-5/)
- [Express 5.x: error handling](https://expressjs.com/en/5x/guide/error-handling/)
- [Express: body-parser](https://expressjs.com/en/resources/middleware/body-parser/)
- [Express: morgan](https://expressjs.com/en/resources/middleware/morgan)
- [Express: security best practices](https://expressjs.com/en/advanced/best-practice-security/)
- [Express: performance and reliability best practices](https://expressjs.com/en/advanced/best-practice-performance/)
- [Node.js command-line options: `--env-file`, `--env-file-if-exists`](https://nodejs.org/download/release/v22.18.0/docs/api/cli.html)
- [ESLint: language options](https://eslint.org/docs/latest/use/configure/language-options)
- [ESLint: configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Kubernetes API health endpoints](https://kubernetes.io/docs/reference/using-api/health-checks/)
- [Health Check Response Format for HTTP APIs (IETF Internet-Draft)](https://datatracker.ietf.org/doc/html/draft-inadarei-api-health-check)
- [Helmet](https://helmet.js.org/)
- npm registry, 2026-10-27: express 5.3.0, eslint 10.13.0, @eslint/js 10.0.1, globals 17.13.0, morgan 1.12.1, pino-http 11.0.0, helmet 8.3.0, cors 2.8.6, dotenv 18.0.9

## Constraints and assumptions

- Node.js 22.13.0 or newer (`engines.node`). The floor comes from ESLint 10, which supports `^22.13.0` on the 22 line; the README's "22 or newer" is corrected by task-doc-updates. Development machine: Node 22.22.2, npm 10.9.7.
- Express 5.3.0 and CommonJS modules (D1, JS-6); built-in modules are imported with the `node:` prefix. The dev dependencies (`eslint` 10.13.0, `@eslint/js` 10.0.1, `globals` 17.13.0) do not count against the runtime-dependency budget. `package-lock.json` pins the versions.
- Express 5 behavior the code relies on: `req.body` is `undefined` unless a parser ran, so it is read as `req.body ?? {}` (JS-9); errors thrown or rejected in handlers reach the error handler without wrapper code (JS-7); `app.listen(port, callback)` passes startup errors such as `EADDRINUSE` to the callback instead of throwing, so the entry point checks the callback argument.
- `express.json()` answers malformed JSON with status 400 and a body over 100 kb with status 413; the error handler passes both statuses through.
- `npm start` uses only the process environment. `npm run dev` loads `.env` with `--env-file=.env` and restarts on changes with `--watch`; a variable already set in the shell wins over `.env`, and a missing `.env` stops it with Node's message `.env: not found`. `.env` is not committed; `.env.example` is.
- Standards that apply: API-3, API-4, API-6, API-7, JS-1 to JS-10, SEC-10, TEST-1 to TEST-6, GIT-2, GIT-4.
- Tests check the log format of R8 and the 404 message of R6 exactly; the wording of the 400 and 413 messages is not fixed.

## Impact

- Code areas touched: new files only, because the repository has no code yet. The expected layout, which the plan may adjust: `package.json`, `package-lock.json`, `eslint.config.js`, `.env.example`, `src/config.js`, `src/app.js`, `src/server.js`, `src/middleware/` (request logger, 404 handler and error handler), the health route and `test/*.test.js`. Documents that task-doc-updates changes later: `README.md` (features, install, run, test, Node version), `docs/ARCHITECTURE.md` (components, request flow), `docs/ROADMAP.md` (status) and `docs/TECH_DEBT.md` (the two placeholders).
- Blast radius: low. Nothing exists that could break. Every later increment builds on `createApp`, the configuration module and the error format, so their shape matters.
- Increment budget: fits. An estimated 150 lines of production code (limit about 300), one runtime dependency (Express), and about 10 files including the generated `package-lock.json`, plus 2 to 3 test files.

## Split and placeholders

No split: the request fits one increment. Two placeholders keep the deferred hardening visible: `TODO(TD-app-foundation-1)` for `helmet()` (SEC-7) and `TODO(TD-app-foundation-2)` for CORS (SEC-8), both in `createApp` where the middleware will be mounted. Both are recorded in `work/app-foundation/tech-debt.md` and removed by the follow-ups below.

## Follow-ups

- security-headers: mount `helmet()` on every response (SEC-7); removes `TD-app-foundation-1`.
- cors-policy: allow CORS only for known origins (SEC-8), when a browser client exists; removes `TD-app-foundation-2`.

## Open questions

- None
