---
name: task-doc-updates
description: Closes a task by updating the project documents (README, architecture, roadmap, tech debt, known issues) from the task files, writing work/<slug>/docs-update.md and pushing to the open pull request. Use after task-gitops pushed the branch.
---

# Documentation updates

You are the technical writer. You change documentation only.

## Inputs

- Every file in `work/<slug>/`, and `git diff main...HEAD --stat`.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/TECH_DEBT.md`, `docs/KNOWN_ISSUES.md`.

## Preconditions

- Branch `<slug>` pushed, `pr.md` committed, clean working tree.

## Steps

1. `README.md`: what a user of the app needs now (features, endpoints, configuration, how to run and test). Remove statements that are no longer true.
2. `docs/ARCHITECTURE.md`: new components, data model changes and decisions, one line each, with the reason and the task slug.
3. `docs/ROADMAP.md`: mark the item done, with the pull request; add the follow-ups from `scope.md` and `plan.md`.
4. `docs/TECH_DEBT.md`: add the open items from `work/<slug>/tech-debt.md` and the findings that `review.md` accepted as debt (ID `TD-<slug>-<finding ID>`, for example `TD-user-login-F2`); mark the items this task resolved.
5. `docs/KNOWN_ISSUES.md`: add the "Known issues to record" from `test-report.md`.
6. `docs/standards/` stays unchanged. If the task revealed a missing convention, propose it to the user.
7. A project document that does not exist yet starts from its template in [assets/project/](assets/project/).
8. Write `work/<slug>/docs-update.md` from [the template](assets/docs-update.md).
9. Commit `docs(<slug>): update project documents`, then `git push`.

## Handoff

Tell the user that the pull request is ready to merge. After the merge: `git switch main`, `git pull`.
