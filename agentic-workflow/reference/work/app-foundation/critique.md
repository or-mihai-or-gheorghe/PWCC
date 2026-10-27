---
task: app-foundation
artifact: critique
round: 1
plan_version: 1
verdict: approved   # approved | changes-requested
---

# Plan critique: app-foundation, round 1

## Checklist

| Check | Result | Notes |
| --- | --- | --- |
| Every requirement in `scope.md` is covered | pass | R1 to R13 map to Steps 1 to 6. Every acceptance criterion has a test (T1 to T14) or a command, except the failing-test case of R12 (S1). |
| One logical increment; existing behavior keeps working | pass | New files only; `src/` and `test/` do not exist yet. `.gitignore` already ignores `.env` and `node_modules/` and matches neither `.env.example` nor `package-lock.json`. |
| Within the increment budget (files, lines, dependencies) | pass | Own estimate: about 150 production lines in 8 non-test files (limit about 300 lines and 10 files), 3 test files (not counted), 1 runtime dependency (`express`). The generated lock file, about 1,750 lines for this dependency set, is not code (S3). All four pinned versions exist on the registry. |
| Testable: essential tests mapped to requirements, commands given | pass | T1 to T14 cover R1, R2 and R4 to R9 (success path plus the security and data error cases, TEST-3); R3, R10, R11 and R13 have commands. Checked on Node 22.22.2: `node --test "test/*.test.js"` exits 0 when nothing matches and skips helper files (a bare `node --test` runs them); `--env-file` works with `--watch`, a shell variable wins over `.env`, a missing `.env` stops with `.env: not found`. |
| Concise: under about 200 lines, snippets only for critical parts | pass | 192 lines, mostly tables. The three snippets carry the security-relevant behavior (SEC-10, API-6, Express 5 startup errors). |
| Follows `docs/standards/` (rule IDs) | pass | API-4, API-6, API-7, JS-6, JS-8, JS-10, SEC-10, TEST-1 to TEST-6 and GIT-2 to GIT-4 are respected. SEC-7 and SEC-8 are deferred by scope R10 and marked. TEST-8: see S4. |
| Consistent with `docs/ARCHITECTURE.md` | pass | Matches D1 (Node 22 or newer, Express 5, CommonJS) and D4 (`node:test`, `fetch`); no component exists that could conflict. |
| No over-engineering | pass | Factories only where `log` is injected (R8); one middleware file; no setting besides `PORT`; every test maps to an acceptance case of the scope. |
| Placeholders recorded, with what removes them | pass | `TD-app-foundation-1` and `-2`, removed by security-headers and cors-policy; task-development writes them to `tech-debt.md`. |
| Snippets correct and secure | pass | Checked on Express 5.3.0: malformed JSON gives 400, a 150 kb body gives 413 without a connection reset, thrown and rejected errors give 500 `Internal server error` with the stack only in the log, `status: 200` gives 500, `OPTIONS` and `DELETE` on `/health` give the JSON 404. `EADDRINUSE` reaches the listen callback and the process then ends with exit code 1. The log line exists before a same-process `fetch` resolves (2,000 requests) and holds no query string. The Step 2 config form works on ESLint 10.13.0: `var` and `==` fail, `fetch` is a known global, and an empty `test/` aborts ESLint, so the order of Steps 2 and 3 is right. |
| Risks identified | pass | Four risks listed; no important risk is missing. |

## Required changes

| ID | Plan section | Problem | Required change |
| --- | --- | --- | --- |
| - | - | None. | - |

## Suggestions

- S1. R12: add a row to "Checks without a test" for the failing-test case: break one assertion, run `npm test; echo $?` (expect a non-zero code), restore it.
- S2. R5: no route reads a body in this increment, so the parser's valid-body path has no test. Say so in `dev-log.md`, so task-testing does not report a gap; the first increment with a body-reading route exercises it.
- S3. Size: note in `dev-log.md` that the generated lock file is not counted against the 300-line budget, so task-code-review does not read the diff size as an overrun.
- S4. TEST-8: the manual `curl http://localhost:3000/health` belongs in the README text that task-doc-updates writes.

## Decision

Approved: development can start.
