---
task: <slug>
artifact: review
round: 1
plan_version: 1
reviewed_commit: <sha>    # HEAD when the review started
verdict: changes-requested   # approved | changes-requested
---

# Code review: <slug>, round <n>

## Reviewed

- `git diff main...<sha>`: <n> files, +<n> / -<n> lines
- `npm test`: <n> passed, <n> failed; `npm run lint`: <result>

## Plan conformance

| Plan step | Implemented | Notes |
| --- | --- | --- |
| 1. <name> | yes / partly / no | |

## Findings

| ID | Severity | Location | Finding | Rule | Required change |
| --- | --- | --- | --- | --- | --- |
| F1 | blocker / major / minor / nit | `src/<file>.js:<line>` | | <rule ID> | |

## Previous findings

<From round 2: whether each earlier finding is fixed.>

## Tech debt

- Every placeholder has a `TODO(<id>)` and a row in `tech-debt.md`: <yes / no>
- Accepted as debt in this review: <finding IDs, or none>

## Decision

<approved: continue with task-testing. changes-requested: blockers and majors go back to task-development.>
