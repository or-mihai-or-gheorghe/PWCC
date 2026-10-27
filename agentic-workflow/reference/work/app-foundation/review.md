---
task: app-foundation
artifact: review
round: 1
plan_version: 1
reviewed_commit: a47ef6d    # HEAD when the review started
verdict: approved   # approved | changes-requested
---

# Code review: app-foundation, round 1

## Reviewed

- `git diff main...a47ef6d`: 16 files, +2580 / -0 lines: 152 lines of production code in 7 files, the generated `package-lock.json` (1829 lines), 190 lines of tests in 3 files, 5 task files
- `npm test`: 15 passed, 0 failed; `npm run lint`: no problems
- Each code commit (`4353e92`, `4495ee4`, `821832a`, `e1dd84f`) passes lint and tests when checked out alone (GIT-3); 40 suite runs in a row without a failure
- Re-run by hand, results as expected: R2 and R10 (`grep`), R3 (default port, invalid `PORT` values, port in use, `npm run dev` with `.env`), R11 (`var` and `==` fail lint), R13 (`npm ci` on a fresh export, only `express` at runtime, lock file resolves only from `registry.npmjs.org`)
- Mutation check on a scratch copy: 12 deliberate breaks of the code, 11 caught by the tests; the survivor is F1

## Plan conformance

| Plan step | Implemented | Notes |
| --- | --- | --- |
| 1. Package, dependencies, environment example | yes | `express` 5.3.0 is the only runtime dependency; scripts, `engines.node` and `.env.example` as planned |
| 2. ESLint | yes | `defineConfig` form as planned; `no-var`, `eqeqeq` and `prefer-const` fail on a bad file |
| 3. Configuration and its tests | yes | T1 to T3; the digits-only rule is implemented as planned (see F1) |
| 4. Middleware and error-handler tests | yes | code matches the plan's listings; T4 to T6 |
| 5. App and app tests | yes | mount order and both `TODO` markers as planned; T7 to T14 |
| 6. Entry point | yes | invalid `PORT` and `EADDRINUSE` print to stderr and exit with 1 |
| 7. Verify and commit | yes | four commits, lint and tests green at each; `dev-log.md` lists no deviation and none was found |

## Findings

| ID | Severity | Location | Finding | Rule | Required change |
| --- | --- | --- | --- | --- | --- |
| F1 | nit | `test/config.test.js:14` | T3 uses only `abc`, `0` and `70000`. The digits-only rule of plan step 3 (`8e3`, `0x50` and ` 80` are rejected) is not pinned: parsing with plain `Number(value)` keeps all 15 tests green. | - | Optional: add `8e3` to the values in T3. |
| F2 | minor | `src/app.js:9` | `createApp` does not check `config.log`. Without it, the first response is sent and then `TypeError: log is not a function` is thrown inside the `finish` listener (`src/middleware.js:10`); that is an uncaught exception and ends a running server. Later increments build their own test configurations and can forget `log`. | - | Optional: at the start of `createApp`, throw a `TypeError` that names `log` when it is not a function. |

## Previous findings

None: this is round 1.

## Tech debt

- Every placeholder has a `TODO(<id>)` and a row in `tech-debt.md`: yes (`TD-app-foundation-1` and `TD-app-foundation-2`, both in `src/app.js`; no other `TODO` in `src/` or `test/`)
- Accepted as debt in this review: F1, F2

## Decision

approved: continue with task-testing. No blocker or major finding remains; F1 and F2 are accepted as debt and need no change before testing.
