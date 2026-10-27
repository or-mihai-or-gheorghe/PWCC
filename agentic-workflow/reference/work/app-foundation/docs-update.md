---
task: app-foundation
artifact: docs-update
pr: not created
---

# Documentation update: app-foundation

| Document | Change | Source |
| --- | --- | --- |
| `README.md` | Status line; features (health check, JSON errors, request log); Node.js 22.13.0; setup, `PORT`, run, test and manual curl checks; workflow example now `user-registration` | `scope.md` (R1 to R13, Constraints), `dev-log.md`, `test-report.md`, `critique.md` (S4) |
| `docs/ARCHITECTURE.md` | Overview; four components; request flow; decisions D5 to D12 | `scope.md` (Options considered, Constraints), `plan.md` |
| `docs/ROADMAP.md` | Item 1 `done`, pull request `not created`; follow-ups `security-headers`, `cors-policy`, `structured-logging` | `scope.md` (Follow-ups), `plan.md` (Risks), `pr.md` |
| `docs/TECH_DEBT.md` | `TD-app-foundation-1` and `-2` added as open; the findings accepted as debt added as `TD-app-foundation-F1` (digits-only `PORT` rule not pinned by a test) and `TD-app-foundation-F2` (`config.log` not checked); no earlier item to resolve | `tech-debt.md`, `review.md` (F1 nit, F2 minor) |
| `docs/KNOWN_ISSUES.md` | `KI-app-foundation-1` (requests rejected by Node's HTTP parser get no JSON and no log line), `low` | `test-report.md` (Known issues to record) |

## Proposed standards changes

- None
