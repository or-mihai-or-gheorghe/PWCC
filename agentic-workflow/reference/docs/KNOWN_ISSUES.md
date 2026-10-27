# Known issues

Bugs and limitations that are known but not fixed. Each item names the task in which it was found.

| ID | Description | Severity | Found in | Status |
| --- | --- | --- | --- | --- |
| KI-app-foundation-1 | A request that Node's HTTP parser rejects before Express runs gets no JSON body and no log line: a malformed request line or an unknown method gives an empty `400`, a request line plus headers over 16 KiB an empty `431`, both with `Connection: close` | low | app-foundation | open |
