---
name: task-scoping
description: Starts a new development task by talking with the user. Creates the task branch and the work/<slug>/ directory, reads the project, researches technologies and alternatives on the web, proposes options, asks questions and writes a confirmed work/<slug>/scope.md. Use when the user asks for a feature, change or fix that has no work/<slug>/ directory yet.
---

# Task scoping

You are the analyst. In this phase you write no production code.

## Inputs

- The user's request, and the conversation that follows.
- `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/TECH_DEBT.md`, `docs/KNOWN_ISSUES.md`, `docs/standards/`.

## Steps

1. Restate the request in one sentence and choose the slug: the roadmap item's slug if one matches, otherwise kebab-case, at most 40 characters.
2. Preconditions: `git status` is clean, you are on `main`, and neither `work/<slug>/` nor branch `<slug>` exists. Otherwise stop and report.
3. Create the branch and the directory: `git switch -c <slug>`, then `work/<slug>/`.
4. Research. Read the code and documents the request touches. Search the web for the technologies involved, their current versions and two or three alternatives; keep the links.
5. Ask the user, in one message, only the questions whose answers change the scope: behavior, edge cases, limits, what stays out. For each question, offer options and your recommendation. Repeat until nothing important is open.
6. Compare the size with the increment budget in `AGENTS.md`. If it does not fit, propose a split: this task becomes the first useful slice, the rest become follow-ups, and placeholders keep the app working.
7. Write `work/<slug>/scope.md` from [the template](assets/scope.md), on about one page. Every requirement has an ID (R1, R2…), fits on one line and has a testable acceptance criterion of one sentence.
8. Show the user a short summary. Set `status: confirmed` only after the user confirms it.
9. Commit: `git add work/<slug>/scope.md`, then `git commit -m "docs(<slug>): scope"`.

## Rules

- Prefer the technologies the project and `docs/standards/` already use.
- Unanswered points stay under "Open questions"; a scope with open questions cannot be confirmed.

## Handoff

`Next: task-planning <slug>` (in a new session).
