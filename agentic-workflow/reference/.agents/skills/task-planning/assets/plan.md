---
task: <slug>
artifact: plan
version: 1               # +1 for every revision
scope_version: 1
answers_critique_round: 0   # the critique round this version answers; 0 for the first version
---

# Plan: <title>

## Summary

<What changes and why, in three to five lines.>

## Context

- `<file or document>`: <what matters for this task>

## Files

| # | File | Action | Purpose |
| --- | --- | --- | --- |
| 1 | `src/<file>.js` | create / modify / delete | <purpose> |

## Steps

### Step 1. <name>

<What to do, precisely enough to follow without guessing. Add a code snippet only for non-trivial or critical parts.>

```javascript
// snippet
```

## API and data

| Method | Path | Request | Responses |
| --- | --- | --- | --- |
| POST | `/<path>` | `{ … }` | 201 `{ … }`; 400 `{ "error": "…" }` |

<Data model changes, configuration (environment variables), new dependencies with their version.>

## Tests

| ID | File | Checks | Requirement | New / existing |
| --- | --- | --- | --- | --- |
| T1 | `test/<file>.test.js` | <behavior> | R1 | new |

Commands: `npm test`, `npm run lint`

## Placeholders and tech debt

| Placeholder | Why | Removed by |
| --- | --- | --- |
| <stub, fake, dummy data> | <reason> | <follow-up slug> |

## Size

- Production code: about <n> changed lines in <n> files; new runtime dependencies: <none / name>
- Increment budget: <fits / does not fit>

## Risks

- <risk>: <mitigation>

## Changes since the previous version

<Only from version 2: how each required change was addressed, for example "C1: …".>
