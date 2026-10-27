---
task: <slug>
artifact: pr
branch: <slug>
base: main
pr: not created          # the pull request's address, once created
---

# <type>(<scope>): <title>

## Summary

<What the increment adds, from scope.md, in two or three lines.>

## Changes

- <change, with the main files>

## How to test

```bash
npm ci
npm test
```

<Manual checks: requests or API collection.>

## Quality gates

| Gate | Task file | Result |
| --- | --- | --- |
| Plan critique | `critique.md`, round <n> | approved |
| Code review | `review.md`, round <n> | approved |
| Tests | `test-report.md`, round <n> | pass |

## Tech debt

- <TD id>: <description>, or None

## Follow-ups

- <slug>: <one line>, or None
