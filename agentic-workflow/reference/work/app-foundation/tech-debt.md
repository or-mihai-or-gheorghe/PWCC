---
task: app-foundation
artifact: tech-debt
---

# Tech debt: app-foundation

| ID | Location | Description | Kind | Removed by | Status |
| --- | --- | --- | --- | --- | --- |
| TD-app-foundation-1 | `src/app.js` | `helmet()` is not mounted, so responses carry no security headers (SEC-7); a second runtime dependency would exceed the budget | placeholder | security-headers | open |
| TD-app-foundation-2 | `src/app.js` | CORS is not mounted, so there is no cross-origin policy (SEC-8); a second runtime dependency would exceed the budget and no browser client exists yet | placeholder | cors-policy | open |
