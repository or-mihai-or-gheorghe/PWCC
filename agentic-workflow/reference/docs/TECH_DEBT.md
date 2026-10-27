# Tech debt

Open shortcuts and placeholders. Each item comes from a task's `work/<slug>/tech-debt.md`; the code carries the same ID in a `TODO(<id>)` comment.

| ID | Location | Description | Removed by | Status |
| --- | --- | --- | --- | --- |
| TD-app-foundation-1 | `src/app.js` | `helmet()` is not mounted, so responses carry no security headers (`SEC-7`); a second runtime dependency would exceed the increment budget | security-headers | open |
| TD-app-foundation-2 | `src/app.js` | CORS is not mounted, so there is no cross-origin policy (`SEC-8`); a second runtime dependency would exceed the increment budget and no browser client exists yet | cors-policy | open |
| TD-app-foundation-F1 | `test/config.test.js` | The invalid-`PORT` test uses only `abc`, `0` and `70000`, so the digits-only rule (`8e3`, `0x50` and ` 80` are rejected) is not pinned by a test (review F1, accepted) | the next task that touches `src/config.js` | open |
| TD-app-foundation-F2 | `src/app.js` | `createApp` does not check that `config.log` is a function; without it, the first finished response throws in the request logger and ends the server (review F2, accepted) | the next task that touches `createApp` | open |
