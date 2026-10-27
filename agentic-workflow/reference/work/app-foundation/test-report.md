---
task: app-foundation
artifact: test-report
round: 1
tested_commit: 13ee9be
verdict: pass            # pass | fail
---

# Test report: app-foundation, round 1

## Environment

- Node.js 22.22.2 (npm 10.9.7), Ubuntu 24.04.4 LTS, storage: none (this increment has no persistence)
- Code unchanged since the reviewed commit `a47ef6d`: `git diff a47ef6d HEAD -- . ':!work'` prints nothing

## Automated tests

- `npm ci` and `npm test`: 15 passed, 0 failed, 0 skipped (T4 runs for two handlers, so 14 plan tests give 15 results)
- `npm run lint`: no problems. Ten runs of `npm test` in a row, each test file on its own, and `PORT=abc npm test`: all green

| Plan test | Exists | Result |
| --- | --- | --- |
| T1 | yes | pass |
| T2 | yes | pass |
| T3 | yes | pass |
| T4 | yes | pass (`/throws` and `/rejects`) |
| T5 | yes | pass |
| T6 | yes | pass |
| T7 | yes | pass |
| T8 | yes | pass |
| T9 | yes | pass |
| T10 | yes | pass |
| T11 | yes | pass |
| T12 | yes | pass |
| T13 | yes | pass |
| T14 | yes | pass |

## Acceptance criteria

| Requirement | Verified by | Result |
| --- | --- | --- |
| R1 | T1 to T3; E17 to E19, E21 | pass |
| R2 | T7; `grep -n -e "listen(" -e "process\.env" src/app.js` prints nothing | pass |
| R3 | E1, E17, E20, E21, E22 | pass |
| R4 | T7; E2, E3 | pass |
| R5 | T8, T9; E7 to E12 | pass |
| R6 | T10, T11; E4 to E6, E15 | pass |
| R7 | T4 to T6; E13 (a 415 from the parser passes through). No route of the app throws, so the 500 path is covered by T4 and T6 only | pass |
| R8 | T13, T14; E16 | pass |
| R9 | T12; no `X-Powered-By` on any response of E2 to E15 | pass |
| R10 | `grep -rn "TODO(TD-app-foundation-" src` finds two lines, both in `src/app.js` (helmet, CORS); `helmet` and `cors` are not in `package.json`; both IDs are in `tech-debt.md` | pass |
| R11 | `npm run lint` exits 0; `var`, `==` and a never-reassigned `let` in a temporary file in `src/` make it exit 1 (`no-var`, `eqeqeq`, `prefer-const`), `var` in `test/` and in `eslint.config.js` as well; ESLint 10.13.0 | pass |
| R12 | `npm test` exits 0 (15 passed); one assertion changed to fail makes it exit 1 (14 passed, 1 failed); the tests call only `localhost` | pass |
| R13 | `npm ci` in a fresh clone exits 0; `npm ls --omit=dev --depth=0` lists `express@5.3.0` only; no `"type"` field; `engines.node` is `>=22.13.0`; scripts `start`, `dev`, `test`, `lint`; `git check-ignore .env` prints `.env`; `.env.example` (`PORT=3000`) and `package-lock.json` are tracked | pass |

## Exploratory requests

`README.md` describes no curl commands or API collection yet (task-doc-updates writes it after the merge), so no collection was run. E1 to E16 ran against `PORT=4000 npm start` (E13 excepted), with `B` = `localhost:4000`.

| ID | Request | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| E1 | `PORT=4000 npm start` | a line that names port 4000; the process keeps running | `Task API listening on port 4000`; still running after all requests | pass |
| E2 | `curl -i B/health` | 200, JSON content type, `{"status":"ok"}`, no `X-Powered-By` | 200, `application/json; charset=utf-8`, `{"status":"ok"}`, no `X-Powered-By` | pass |
| E3 | `curl B/health -H 'Authorization: Bearer wrong-credential-123' -H 'Cookie: session=cookie-secret-456'`; `curl "B/health?token=abc"` | 200 both (no authentication in this increment) | 200 `{"status":"ok"}` both | pass |
| E4 | `curl "B/nope?x=1"` | 404 `{"error":"Route GET /nope does not exist"}` | same | pass |
| E5 | `curl -X DELETE B/health` | 404 `{"error":"Route DELETE /health does not exist"}` | same | pass |
| E6 | `curl -X OPTIONS B/health` | 404 `{"error":"Route OPTIONS /health does not exist"}` (a method without a route) | same | pass |
| E7 | `curl -X POST -H 'Content-Type: application/json' -d '{"title":' B/health`; the same to `B/nope` | 400 `{"error":"<text>"}` on any path | 400 `{"error":"Unexpected end of JSON input"}` on both | pass |
| E8 | `POST B/health`, JSON object of 150,000 bytes | 413 `{"error":"<text>"}` | 413 `{"error":"request entity too large"}` | pass |
| E9 | `POST B/health`, JSON object of exactly 102,400 bytes, then of 102,401 bytes | the first passes the parser (then 404, no POST route); the second 413 | 404 `{"error":"Route POST /health does not exist"}`; 413 | pass |
| E10 | `POST B/health` with `-H 'Transfer-Encoding: chunked'` and 150,000 bytes; with `-H 'Content-Encoding: gzip'` and a 1,987-byte body that inflates to about 2 MB | 413 both | 413 `{"error":"request entity too large"}` both | pass |
| E11 | `POST B/health` with `{"title":"x","password":"hunter2"}`; with an empty body and `Content-Type: application/json` | the parser accepts; 404 (no POST route) | 404 `{"error":"Route POST /health does not exist"}` both | pass |
| E12 | `POST B/health` with the body `"abc"` (valid JSON, not an object) | 400 in the error format | 400 `{"error":"Unexpected token '\"', \"\"abc\"\" is not valid JSON"}` | pass |
| E13 | `POST` to `/health` with `Content-Type: application/json; charset=iso-8859-1` and `{}` (default-port session, E21) | the 415 of the parser passes through the error handler | 415 `{"error":"unsupported charset \"ISO-8859-1\""}` | pass |
| E14 | `curl -I B/health` | 200, headers only | 200, `Content-Length: 15`, no body | pass |
| E15 | `curl --path-as-is "B/%0d%0aFAKE-LOG-LINE"`; raw `GET /%`, `GET /%E0%A4%A`, `GET //health` | 404 JSON that names the path; one log line each; no injected log line | 404 `{"error":"Route GET /%0d%0aFAKE-LOG-LINE does not exist"}`, the same shape for the others; one log line each; server still up | pass |
| E16 | server output of the E1 session after the 21 requests that reached Express | one line `<ISO> METHOD PATH STATUS Nms` per request, also for 400, 404 and 413; no query string, header value or body text; stderr empty | 21 lines, all in that format; no `token`, `Bearer`, cookie value, `hunter2`, `title` or `x=1`; stderr empty | pass |
| E17 | `PORT=abc node src/server.js; echo $?`; `PORT=abc npm start` | message that names `PORT` on stderr; exit code 1 | `Invalid configuration: PORT must be an integer from 1 to 65535`; exit 1 (both) | pass |
| E18 | `node src/server.js` with `PORT` = `0`, `70000`, `65536`, `-1`, empty, ` 80`, `8e3`, `0x50`, `80.5`, `+80` | each rejected; exit 1 | the same message and exit 1 for all ten | pass |
| E19 | `PORT=65535 npm start`; `loadConfig` with `PORT` `1` and `08080` | accepted | listening on 65535, `GET /health` 200; `{ port: 1 }`, `{ port: 8080 }` | pass |
| E20 | `PORT=4000 node src/server.js` and `PORT=4000 npm start` while another server uses port 4000 | message on stderr; exit 1; the first server unaffected | `Cannot listen on port 4000: listen EADDRINUSE: address already in use 0.0.0.0:4000`; exit 1 (both); the first server still answered 200 | pass |
| E21 | `npm start` with `PORT` unset | port 3000 | `Task API listening on port 3000`; `GET /health` 200 | pass |
| E22 | `.env` with `PORT=4001`, then `npm run dev`; the same with `PORT=4002 npm run dev`; `npm run dev` without `.env` | port 4001; port 4002 (the shell wins over `.env`); stops with `.env: not found` | `Task API listening on port 4001`, `GET /health` 200; port 4002; `node: .env: not found`, exit 9 | pass |
| E23 | raw `GARBAGE`; raw `FOO /health HTTP/1.1`; `curl "B/<20,000 times a>"` (request line over 16 KiB) | not covered by a requirement; the Goal says every response is JSON and every request is logged | empty `400`, empty `400`, empty `431`, all with `Connection: close`; no JSON body, no log line | known issue |

## Failures

| ID | Description | Steps to reproduce | Severity |
| --- | --- | --- | --- |
| None | | | |

## Known issues to record

| Description | Severity |
| --- | --- |
| Requests that Node's HTTP parser rejects before Express runs get no JSON body and no log line: a malformed request line or an unknown method gives an empty `400`, a request line plus headers over 16 KiB an empty `431`, both with `Connection: close` (E23). No requirement of this task covers it. | low |

## Decision

pass: continue with task-gitops. All 15 test results pass, all 13 acceptance criteria are met, and the exploratory requests found no defect. The one limitation above is outside this task's scope and does not block it.
