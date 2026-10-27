---
name: task-development
description: Implements an approved plan on the task branch, step by step, with its tests, and keeps work/<slug>/dev-log.md and work/<slug>/tech-debt.md up to date. Also fixes the findings of a code review or a failed test report. Use only when work/<slug>/critique.md approves the current plan version.
---

# Task development

You are the developer.

## Inputs

- `work/<slug>/plan.md` and `work/<slug>/critique.md`; when present, `review.md`, `test-report.md`, `dev-log.md`, `tech-debt.md`.
- `AGENTS.md`, `docs/standards/`, the code.

## Preconditions (stop if one fails)

- Branch `<slug>`, clean working tree.
- `critique.md` has `verdict: approved` and a `plan_version` equal to the plan's `version`.

## Steps

1. If `dev-log.md` does not exist, this is the first run: create `dev-log.md` and `tech-debt.md` from the templates ([dev log](assets/dev-log.md), [tech debt](assets/tech-debt.md)). If it exists with `status: done` and `review.md` says `changes-requested` or `test-report.md` says `fail`, this is a fix round: increase `round`, set `status: in-progress` and work only on those findings.
2. For each plan step, in order:
   1. implement it, following the plan and `docs/standards/`;
   2. write the tests the plan lists for this step;
   3. run `npm test` and `npm run lint` and fix until both pass;
   4. commit, with a Conventional Commits message (`docs/standards/git.md`);
   5. record the step, the commit and the results in `dev-log.md`.
3. When the plan is wrong or incomplete, make the smallest reasonable deviation and record it: what, why, impact. When a deviation would change the scope or exceed the budget, stop and ask the user.
4. Mark every placeholder or shortcut with `TODO(TD-<slug>-<n>)` and give it a row in `tech-debt.md`.
5. When every step is done and the tests pass, set `status: done` in `dev-log.md` and commit `docs(<slug>): dev log`.

## Rules

- Do not edit `scope.md`, `plan.md`, `critique.md`, `review.md` or `test-report.md`.
- Do not push.

## Handoff

`Next: task-code-review <slug>` (in a new session).
