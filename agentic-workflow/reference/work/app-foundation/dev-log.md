---
task: app-foundation
artifact: dev-log
plan_version: 1
round: 1                 # +1 for each fix round after a review or a test report
status: done             # in-progress | done
---

# Development log: app-foundation

## Steps

| Plan step | Status | Commit | Notes |
| --- | --- | --- | --- |
| 1. Package, dependencies, environment example | done | `4353e92` | `express` 5.3.0; dev: `eslint` 10.13.0, `@eslint/js` 10.0.1, `globals` 17.13.0. `npm install` saved `^` ranges; the lock file holds exactly these versions |
| 2. ESLint | done | `4353e92` | The config in the documented `defineConfig` form worked as planned |
| 3. Configuration and its tests | done | `4353e92` | T1 to T3: 3 passed; lint clean. Steps 1 to 3 are one commit, as the plan says: lint can only run once `src/` and `test/` contain files |
| 4. Middleware and error-handler tests | done | `4495ee4` | T4 (run for a sync and an async handler), T5, T6: 7 tests passed in total; lint clean |
| 5. App and app tests | done | `821832a` | T7 to T14: 15 tests passed in total; lint clean; the two `TODO(TD-app-foundation-n)` markers are in `src/app.js` (rows in `tech-debt.md`); suite run 40 times in a row, no flaky log assertion |
| 6. Entry point | done | `e1dd84f` | 15 tests passed; lint clean; R3 checked by hand (see Commands) |
| 7. Verify and commit | done | - | All checks without a test run (see Commands). No commit of its own: the code commits are those of steps 3 to 6 |

## Deviations from the plan

| What | Why | Impact |
| --- | --- | --- |
| None | | |

## Commands

| Command | Result |
| --- | --- |
| `npm test` | 15 passed, 0 failed (T1 to T14; T4 runs for two handlers) |
| `npm run lint` | no problems |
| Fresh clone of the branch: `npm ci`, `npm run lint`, `npm test` | all exit 0; 15 passed; the app started and answered `GET /health` |
| R2: `grep -n -e "listen(" -e "process\.env" src/app.js` | no output |
| R3: `PORT=4000 npm start`, then `curl -i http://localhost:4000/health` | `Task API listening on port 4000`; 200 `{"status":"ok"}`; one request line in the log |
| R3: `PORT=abc node src/server.js; echo $?` | `Invalid configuration: PORT must be an integer from 1 to 65535` on stderr; `1` |
| R3: `PORT=4000 node src/server.js` while a server runs on 4000 | `Cannot listen on port 4000: listen EADDRINUSE: address already in use 0.0.0.0:4000` on stderr; `1` |
| R3: `.env` with `PORT=4001`, then `npm run dev` | `Task API listening on port 4001`; `.env` deleted afterwards |
| R10: `grep -rn "TODO(TD-app-foundation-" src`; `grep -e helmet -e cors package.json` | two lines, both in `src/app.js`; no output |
| R11: `npm run lint`; again with a temporary `src/tmp.js` containing `var x = 1;` | exit 0; exit 1 (`no-var`), file deleted. `==` and a never-reassigned `let` also fail (`eqeqeq`, `prefer-const`) |
| R12: one assertion broken, `npm test; echo $?` (critique S1) | `1` (14 passed, 1 failed); assertion restored |
| R13: `npm ci`; `npm ls --omit=dev --depth=0`; `git check-ignore .env`; `git ls-files .env.example package-lock.json` | no errors; `express@5.3.0` only; `.env`; both files |

## Fix rounds

None.

## Notes for review and testing

- Setup: `npm ci`. Tests need no `.env`; `PORT` defaults to 3000. `.env` (copy of `.env.example`) is only read by `npm run dev`.
- Size: 152 lines of production code in 7 files, plus the generated `package-lock.json` (1,829 lines), which is not counted against the 300-line budget; 3 test files with 190 lines; `express` is the only runtime dependency.
- R5: no route reads a request body yet, so the parser's valid-body path has no test and is not a gap in testing. T8 and T9 reach the parser's errors through `POST /health`, because the parser runs before routing. The first increment with a body-reading route covers the valid-body path.
