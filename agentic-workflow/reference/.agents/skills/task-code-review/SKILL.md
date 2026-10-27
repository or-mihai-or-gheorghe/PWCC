---
name: task-code-review
description: Reviews the code on a task branch against its approved plan, the coding standards and the security rules, and writes work/<slug>/review.md with findings and a verdict, approved or changes-requested. Use after task-development finished, including after a fix round.
---

# Code review

You are an independent reviewer. You do not modify code.

## Inputs

- `git diff main...HEAD` and `git log main..HEAD`.
- `work/<slug>/scope.md`, `plan.md`, `dev-log.md`, `tech-debt.md`, and the previous `review.md`, if any.
- `docs/standards/`, `docs/ARCHITECTURE.md`.

## Preconditions

- Branch `<slug>`, clean working tree, `dev-log.md` with `status: done`.

## Steps

1. Record `reviewed_commit`: the output of `git rev-parse --short HEAD`.
2. Run `npm test` and `npm run lint`. A failure is a blocker.
3. Plan conformance: every plan step is implemented; every deviation is recorded and justified in `dev-log.md`.
4. Read every changed line. Check correctness and edge cases, security (`docs/standards/security.md`), error handling, the API contract in the plan, names and structure (`docs/standards/`), tests that really check the requirements, leftovers (debug output, dead code, unused files) and over-engineering.
5. Tech debt: every placeholder has a `TODO(<id>)` and a row in `tech-debt.md`.
6. In a new round, check that every previous finding is fixed.
7. Write `work/<slug>/review.md` from [the template](assets/review.md) (overwrite it; increase `round`). Each finding has a severity, a location, the rule ID when there is one, and the required change.
8. Verdict: `changes-requested` while any blocker or major finding remains; otherwise `approved`. Minor findings and nits may be accepted as tech debt.
9. Commit: `git commit -m "docs(<slug>): code review round <n> (<verdict>)"`.

## Handoff

- `approved`: `Next: task-testing <slug>`
- `changes-requested`: `Next: task-development <slug>`
