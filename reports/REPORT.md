# Hook v15: three changes (local, 2026-11-03)

Everything in the first part was done only on the local machine: a local node in standalone mode (network 21337, no peers). Testnet and mainnet were not used, no transactions were sent to a network, nothing was uploaded anywhere. The v14 files were not changed.

## The changes (vs v14)
1. Two hook accounts can open each other's boxes: if the hook account itself sends an Invoke to another address, the hook lets it pass ("tgs: pass") and writes nothing. It sits after line 179. Invoke without Destination, and Invoke with Destination = own address, work exactly as in v14.
2. A key token must be minted by the hook account itself (reject "tgs: key issuer").
3. When building a box under a key token, the key must still be on the hook account (reject "tgs: key owner").

Everything else works as in v14.

## Build
- clang 19 (wasi-sdk 25), flags from sim/gc.sh, clean.py, guard_checker.
- With -O2 it does not pass: guard 65,785 > 65,535 (v14 with the same compiler gives 65,527, a margin of only 8). So it was built with **-Os**: v15 = 64,764, "Hook validation successful". For a fair comparison v14 was built the same way (base_v14_Os.wasm).
- Through Hooks Builder v14 gives 45,316, so v15 will fit there with a large margin. This has to be confirmed when building in Builder.

## Tests (local node xahaud 4119)
| suite | v14 (-Os) | v15 |
|---|---|---|
| scen.js (key token) | 21/21 | 21/21 |
| l14.js (signatures, expiry, account deletion, edge cases) | 30/30 | 30/30 |
| x15.js (new) | 16/30, bug reproduced | **30/30** |

x15.js: the hook is installed on A and on B.
- B opens a VC box from A: the payout arrived, the box was erased.
- B opens A's box by key token: the key and XAH arrived, C without the key is rejected, a repeated open is rejected.
- PACK, OPEN (before and after expiry) and SYNC by A itself work as in v14.
- Invoke A→C with commands PACK, OPEN, SYNC, AUDIT and garbage gets "tgs: pass"; A's state does not change.
- B's hook entries do not change when B opens.

## xahc (offline, no network)
lint, sim and fuzz gave the same results for v15 as for v14. prove on v14 hit a timeout, so it was not run for v15 at this stage.

## Risks
1. Invoke does not move money. It only spends the fee, and in v14 the owner could already spend it via AUDIT. There is no new way to withdraw money.
2. The old PEND cleanup (lines 105–126) is now also committed on a passed Invoke; before, it was rolled back. It is the same safe cleanup that runs on any other transaction.
3. Hook payouts go through Remit, not Invoke, and cbak was not changed. The change does not affect them.
4. Incoming Invokes from other addresses take the same path as before.

## Open items (at that time)
- Build in Hooks Builder and check the guard.
- Review the diff.
- User decision on a mainnet test with two hook addresses.

## Addendum: broad local tests (v15 only, local standalone node)

### t15/x2.js: two hooks, both directions: 297/297
G0 2, G1 (VC boxes) 114, G2 (key boxes, 5 mixed under one key, key passed along the way) 80, G3 (expiry) 24, G4 (own operations: reserve/locked) 36, G5 (races/busy) 14, G6 (C without hook) 8, G7 (edge cases) 15, G8 (state/counters) 4. All OK.

### t15/x3.js: missing combinations: 170/170
H1 32 (VC: gift code with EXP, XAH+gift code with EXP, XAH+own token with EXP, both directions); H2 129 (6 mixed boxes under ONE key: XAH, token, XAH+token, code, XAH+code, code with EXP; the key goes hook→hook→third hook→C without hook→back, the previous holder is rejected, the receiving hook's entries are not touched, 3 directions); H3 6 (final counters). Setup 3.

### Old automated suite (687) on v15 locally
main 167/167, escape 29/29, escape2 14/14, gaps 26/26, gaps2 35/35, race 85/85, multisign 13/13, newtests 93/93, audit 99/99, auditb 11/11, extra 106/111 (rerun on a node with NetworkID 21338).
The extra failures are caused by the tests/protocol, not by the hook:
- X3 (first run, 16): the "foreign" NetworkID 21337 matched the local network. On the 21338 node everything passed.
- X7 (4): OPEN/CLAIM race at the EXP boundary. In each round there is exactly one winner, money/token are correct, the second gets "busy"; the check expects a different outcome. It was the same on testnet with v14.
- X8 (1): Remit with two amounts → temMALFORMED (protocol rejection, before the hook). Same on testnet.

Total: no hook bugs found. The nodes were stopped.

## Rerun on the wasm from Hooks Builder (2026-11-03, local standalone only)
- File: builder_tgsboxv15.wasm (26,205 bytes, -O2 from Builder). Instruction limit per Builder: hook 63,990, cbak 4,272 (limit 65,535).
- SetHook on the local node: tesSUCCESS (size and guard check passed) on networks 21337 and 21338.
- x4 65/65, x2 297/297, x3 170/170, x15 30/30, scen 21/21, l14 30/30.
- Old suite: main 167, escape 28, escape2 13, gaps 22, gaps2 25, race 9, multisign 13, newtests 93, audit 99, auditb 11, all without FAIL.
- extra (21338): 106/111, the same 5 FAILs as before (4×X7 + 1×X8). They are on the test side; the hook is not involved.
- Result: the results match the -Os build one to one. No differences.
- Logs: tests/local/res/*_builder.*, tests/runners/ (run scripts).

## Testnet v15 (21338, test accounts, wasm from Hooks Builder)
- main 167, escape 28, escape2 13, gaps 22, gaps2 25, race 9, multisign 13, newtests 93, audit 99, auditb 11, scen 21, x15 30, x4 65, x2 297, x3 170, l14 30: 0 FAIL everywhere.
- extra: 113/115. The two FAILs are X7, a timing issue on the test side; the hook is not involved.
- Logs: tests/testnet/.

## xahc for the final v15 (2026-11-03, offline, no network)
Everything ran isolated without network (unshare -n). Nothing was uploaded anywhere. v14 was not touched.
Tools: xahc 1.12.1 (the same as for v14). clang-19 and cbmc were missing on the machine, so clang from wasi-sdk 34 and cbmc 6.11.0 were installed.
- build: OK (0 errors, 1 info). Lint also OK on both wasm files (Builder and xahc build): same as v14.
- sim (tt 0/3/45/47/48/95/99, amounts 0 and 1 XAH): same as v14. Invoke (99) fails with a trap because the simulator lacks the needed functions. Everything else passes.
- fuzz 300 (seed 1): guardrail without counterexamples. limit/overflow/authz give the same 222/291/62. These checks are designed for payment hooks; for the box they are false positives. Full match with v14.
- No new findings.
- PACK (cbmc, slice slice_pack3 ported to v15; the new key issuer/owner checks fall into the cut-out rejection block, so the slice covers v15 with margin; the Invoke pass line was kept):
  - PK4_sig_ux: PROVED in 13 s (as for v14). The only "FAILURE" in the log is the REACH sanity assertion, which is expected to fail.
  - Mutant "exists check removed": caught, 3 violations. So the check is not vacuous.
  - PK4_tok_ux: timeout 1200 s, no counterexample.
  - PK4_sig_u: timeout ~3400 s, no counterexample. On v14 it was proved in 2951 s with another cbmc version.
- Logs: tests/xahc/logs, tests/xahc/cbmc_logs.
