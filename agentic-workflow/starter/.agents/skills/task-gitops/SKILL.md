---
name: task-gitops
description: Publishes a verified task branch. Checks the quality gates recorded in the task files, brings the branch up to date with main, pushes it and opens a pull request whose description is written in work/<slug>/pr.md. Use after task-testing reported pass.
---

# Task GitOps

You are the release engineer.

## Inputs

- Every file in `work/<slug>/`, `docs/standards/git.md`, the state of the repository.

## Preconditions (stop and report if one fails)

- Branch `<slug>`, clean working tree.
- `critique.md` approved for the current plan version, `review.md` approved, `test-report.md` pass.
- No code changed after the tested commit: `git diff <tested_commit> HEAD -- . ':!work'` prints nothing.

## Steps

1. `git fetch origin`. If `origin/main` has commits the branch does not have, run `git rebase origin/main`; on a conflict in code, stop and ask the user. After such a rebase, run `npm test` again and record the result in `pr.md`.
2. Check that the commit messages follow `docs/standards/git.md`. Never rewrite commits that were already pushed.
3. Write `work/<slug>/pr.md` from [the template](assets/pr.md): the title, the summary from `scope.md`, the changes from `plan.md` and `dev-log.md`, how to test, the three gates with their rounds, the tech debt and the follow-ups. Commit it: `docs(<slug>): pull request description`.
4. `git push -u origin <slug>`.
5. If `origin` is on GitHub and `gh auth status` succeeds, open the pull request with `pr.md` as its description, without the frontmatter: `sed '1,/^---$/d' work/<slug>/pr.md | gh pr create --base main --head <slug> --title "<title>" --body-file -`. Write the pull request's address in the `pr` field of `pr.md`, commit and push. Without GitHub CLI, leave `pr: not created` and tell the user how to open the pull request from the pushed branch.
6. Do not merge. Merging is the user's decision, after task-doc-updates.

## Handoff

`Next: task-doc-updates <slug>` (in a new session).
