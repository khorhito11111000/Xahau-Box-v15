# Xahau Box — hook v15: tests and reports

Private repository with the test material and test reports for hook v15 of Xahau Box.

- **HookHash (v15, Hooks Builder build):** `4847C361…` (see the on-chain hook; full hash in the testnet logs).
- **What changed vs v14:** one change. If the hook account itself sends an `Invoke` to another address, the hook lets it pass (`tgs: pass`) and writes nothing. Everything else works as in v14. Details: [reports/REPORT.md](reports/REPORT.md).
- **Source and wasm:** not in this repository yet (left out on purpose; may be added later).

## What the tests cover

- PACK / OPEN / CLAIM / SYNC / AUDIT for all box kinds: link (VC) boxes, addressed boxes, key-token boxes, gift codes, mixed boxes under one key.
- Expiry, races in one ledger, replays, foreign signatures, multisign, offers on locked tokens, issuer burn/theft attempts, hook deletion and reinstall.
- Two hook accounts talking to each other in both directions (the v15 change).
- When the hook requires AUDIT (testnet trigger tests).
- xahc 1.12.1 static analysis: build, lint, sim, fuzz, and a cbmc proof of PACK.

## Results

| Suite | Testnet v15 (21338) | Local standalone (Builder wasm) |
|---|---|---|
| main | 167, 0 FAIL | 167, 0 FAIL |
| escape | 28, 0 FAIL | 28, 0 FAIL |
| escape2 | 13, 0 FAIL | 13, 0 FAIL |
| gaps | 22, 0 FAIL | 22, 0 FAIL |
| gaps2 | 25, 0 FAIL | 25, 0 FAIL |
| race | 9, 0 FAIL | 9, 0 FAIL |
| multisign | 13, 0 FAIL | 13, 0 FAIL |
| newtests | 93, 0 FAIL | 93, 0 FAIL |
| audit | 99, 0 FAIL | 99, 0 FAIL |
| auditb | 11, 0 FAIL | 11, 0 FAIL |
| scen | 21, 0 FAIL | 21/21 |
| x15 | 30, 0 FAIL | 30/30 |
| x4 | 65, 0 FAIL | 65/65 |
| x2 | 297, 0 FAIL | 297/297 |
| x3 | 170, 0 FAIL | 170/170 |
| l14 | 30, 0 FAIL | 30/30 |
| extra | 113/115 (2 × X7, expiry timing on the test side) | 106/111 (4 × X7, 1 × X8, test/protocol side) |

AUDIT trigger tests (testnet, 2026-11-04): page and hook agree on 14 of 14 PACK. See [reports/AUDIT_TRIGGER_TESTS.md](reports/AUDIT_TRIGGER_TESTS.md).

xahc 1.12.1 (offline):
- build, lint, sim, fuzz: same results as v14, no new findings.
- cbmc PACK: `PK4_sig_ux` proved (13 s); the "exists check removed" mutant was caught; `PK4_tok_ux` and `PK4_sig_u` timed out with no counterexample.

## Layout

```
reports/
  REPORT.md                 main report (local, Builder rerun, testnet, xahc)
  AUDIT_TRIGGER_TESTS.md    when v15 asks for AUDIT (testnet)
tests/
  testnet/                  testnet suites: scripts, results (*.json), logs
    xs/                     x2, x3, x4, x15, scen, l14 runner and results
    at/                     AUDIT trigger test scripts and results
  local/                    local standalone node scripts (t15, v14b) and results (res/)
  runners/                  shell runners used for the automated suites
  xahc/logs/                xahc build/lint/sim/fuzz logs and summary
  xahc/cbmc_logs/           cbmc PACK proof logs and summary
```

Test account secrets are not in this repository. Scripts read them from local `accounts_SECRET.json` files (git-ignored) or from environment variables such as `GENESIS_SEED` (local standalone node only).
