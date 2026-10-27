---
task: <slug>
artifact: test-report
round: 1
tested_commit: <sha>
verdict: fail            # pass | fail
---

# Test report: <slug>, round <n>

## Environment

- Node.js <version>, <operating system>, storage: <JSON file / Firestore emulator>

## Automated tests

- `npm ci` and `npm test`: <n> passed, <n> failed, <n> skipped

| Plan test | Exists | Result |
| --- | --- | --- |
| T1 | yes | pass |

## Acceptance criteria

| Requirement | Verified by | Result |
| --- | --- | --- |
| R1 | T1, request E1 | pass / fail |

## Exploratory requests

| ID | Request | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| E1 | `curl -i -X POST …` | 201 `{ … }` | 201 `{ … }` | pass |

## Failures

| ID | Description | Steps to reproduce | Severity |
| --- | --- | --- | --- |
| None | | | |

## Known issues to record

| Description | Severity |
| --- | --- |
| None | |

## Decision

<pass: continue with task-gitops. fail: back to task-development.>
