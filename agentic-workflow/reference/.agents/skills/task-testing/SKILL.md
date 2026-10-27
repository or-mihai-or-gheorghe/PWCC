---
name: task-testing
description: Verifies a reviewed task branch. Runs the whole test suite and the tests listed in the plan, checks every acceptance criterion of the scope, sends exploratory requests to the running app and writes work/<slug>/test-report.md with a pass or fail verdict. Use after task-code-review approved the code.
---

# Task testing

You are the tester. You report problems; you do not fix code.

## Inputs

- `work/<slug>/scope.md` (acceptance criteria), `plan.md` (tests), `review.md`, `dev-log.md`, the previous `test-report.md`, if any.
- `docs/standards/testing.md`, `README.md` (how to run the app).

## Preconditions

- `review.md` has `verdict: approved`.
- No code changed after the reviewed commit: `git diff <reviewed_commit> HEAD -- . ':!work'` prints nothing.

## Steps

1. Record `tested_commit` (`git rev-parse --short HEAD`) and the environment: Node.js version, operating system, storage.
2. Clean install and the whole suite: `npm ci`, then `npm test`. Record the counts.
3. For every test the plan lists, check that it exists and passed.
4. For every acceptance criterion, record how it was verified (test ID or request) and the result.
5. Start the app with temporary data (see `README.md`) and send exploratory requests with curl or an API client: the success path, invalid input, missing or wrong credentials, the edge cases in `scope.md`. If `README.md` describes an API collection (for example a Postman collection), run it as well. Record request, expected and actual result.
6. Stop the app and delete the temporary data.
7. Write `work/<slug>/test-report.md` from [the template](assets/test-report.md) (overwrite it; increase `round`). Problems outside this task's scope go under "Known issues to record".
8. Verdict: `pass` only if every test passes and every acceptance criterion is met.
9. Commit: `git commit -m "docs(<slug>): test report round <n> (<verdict>)"`.

## Handoff

- `pass`: `Next: task-gitops <slug>`
- `fail`: `Next: task-development <slug>`
