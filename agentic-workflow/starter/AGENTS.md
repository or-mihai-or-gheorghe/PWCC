# AGENTS.md

Instructions for every coding agent working in this repository (Antigravity CLI `agy`, Claude Code, Codex and others).

## Project

Task API: a REST backend in Node.js and Express 5 with user registration, JWT authentication, authorization and CRUD over tasks. Data lives in a local JSON file first and in Cloud Firestore later. Read `README.md` and `docs/ARCHITECTURE.md` first.

All code, comments, documents and commit messages are in English.

## Project documents

| Document | Content | Written by |
| --- | --- | --- |
| `README.md` | what the app does, how to install, run and test it | task-doc-updates |
| `docs/ARCHITECTURE.md` | components, data model, decisions | task-doc-updates |
| `docs/ROADMAP.md` | planned and finished increments | task-doc-updates |
| `docs/TECH_DEBT.md` | open shortcuts and placeholders | task-doc-updates |
| `docs/KNOWN_ISSUES.md` | known bugs and limitations | task-doc-updates |
| `docs/standards/*.md` | coding standards, with rule IDs | humans only |

## Workflow

Every change is a task with a slug (kebab-case, for example `user-registration`), a branch with the same name and a directory `work/<slug>/`. A task goes through eight phases. Each phase is a skill in `.agents/skills/` and runs in a new agent session.

| # | Skill | Reads | Writes | Continue when |
| --- | --- | --- | --- | --- |
| 1 | task-scoping | the user, project documents, the web | `scope.md` | the user confirms the scope |
| 2 | task-planning | `scope.md`, `critique.md`, documents, code | `plan.md` | always |
| 3 | task-plan-critique | `plan.md`, `scope.md`, documents, code | `critique.md` | verdict `approved` |
| 4 | task-development | approved `plan.md`, findings | code, tests, `dev-log.md`, `tech-debt.md` | tests pass |
| 5 | task-code-review | diff, `plan.md`, `dev-log.md`, `tech-debt.md` | `review.md` | verdict `approved` |
| 6 | task-testing | `scope.md`, `plan.md`, the running app | `test-report.md` | verdict `pass` |
| 7 | task-gitops | all task files, git | `pr.md`, pushed branch, pull request | branch pushed |
| 8 | task-doc-updates | all task files, project documents | project documents, `docs-update.md` | the user merges |

Loops: critique `changes-requested` goes back to task-planning; review `changes-requested` or test `fail` goes back to task-development, then to task-code-review again.

## Rules for every phase

1. One phase per session. Read this file, then the skill, then only the inputs the skill lists.
2. Write task files from the skill's template, in `assets/`. Keep the frontmatter; never edit a file that belongs to another phase.
3. Check the preconditions first. If one fails, stop and say what is missing.
4. When information is missing, ask the user; do not invent requirements.
5. Commit your phase's output on the task branch. Only task-gitops and task-doc-updates push.
6. Keep task files short and precise: tables instead of prose, no text copied from other files. `scope.md` fits on about one page; `plan.md` stays under about 200 lines.
7. Check in proportion to the change: run each check once; no repeated runs, mutation testing or prototypes outside the repository.
8. End with the next step, in the form `Next: <skill> <slug>`.

## Increment budget

A task is one logical increment: testable on its own, and every existing test still passes.

- At most about 300 changed lines of production code (tests and documents not counted) and 10 files.
- At most one new runtime dependency.
- Tests are essential, not exhaustive: one test for the success path of each requirement, plus one for each error case that protects security or data. A requirement usually needs one to three tests.

Larger work is split. A part that is not implemented yet is replaced by an explicit placeholder (a stub, a fake adapter, seeded dummy data, a monkey patch in tests), marked in code with `TODO(TD-<slug>-<n>)` and recorded in `work/<slug>/tech-debt.md`.

## Commands

- `npm install`, `npm test` (node:test), `npm run lint` (ESLint), `npm start`, `npm run dev`.
- Configuration comes from environment variables, in development from `.env` (`node --env-file=.env`). Never commit `.env`, keys or `node_modules`.
