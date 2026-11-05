# When hook v15 asks for AUDIT (testnet xahau-test.net, 2026-11-04)

Testnet only, a fresh faucet address of the bot (rE1WKq…), hook v15 by HookHash, hook code unchanged.
Rule: F = OwnerCount − hook entries − tokens in boxes − tickets; if a token is put into the box, F−1. If F>1, an AUDIT with count ≥ F is needed.

- OK S0: before SetHook | OwnerCount=0 (Hook 0, URIToken 0, hook entries 0, in boxes 0) F=0 AUDIT=no →  
- OK S1: SetHook | after: OwnerCount=1 (Hook 1, URIToken 0, hook entries 0, in boxes 0) F=1 AUDIT=no → tesSUCCESS 91F1E58519A65D6CED06A66B44E86C20240B6B5D3E43A351E92DBE91A24C7253
- OK A1: link box 1 XAH | OwnerCount=1 (Hook 1, URIToken 0, hook entries 0, in boxes 0) F=1 AUDIT=no | page: no AUDIT → tgs: packed 9A98D6C2A26B3BC47BC34703E2914253D2D8A8EE382B07FA26989E60A291F9EA
- OK A2: link box with token t1 (+1 XAH) | OwnerCount=5 (Hook 1, URIToken 1, hook entries 3, in boxes 0) F=2 AUDIT=no | page: no AUDIT → tgs: packed DCC0BD0E926DE1309CD9F4D7D33FF698C3A194CDE766D336198824C5985BAECD
- OK A3: link box with token t2 | OwnerCount=8 (Hook 1, URIToken 2, hook entries 5, in boxes 1) F=2 AUDIT=no | page: no AUDIT → tgs: packed 777E485B17BA5C6684004DEE9947CDA255BDEAD225B44B3865C937B5F8943097
- OK A4: link box 1 XAH again | OwnerCount=10 (Hook 1, URIToken 2, hook entries 7, in boxes 2) F=1 AUDIT=no | page: no AUDIT → tgs: packed 80CCF3B1A1F8F5DB6D0A55C9ADECAEC2D6E7AF00DA1E1B5D5FB43ED6A06B9F45
- OK A5: key token: only 1 XAH (key on the address) | OwnerCount=12 (Hook 1, URIToken 3, hook entries 8, in boxes 2) F=2 AUDIT=no | page: AUDIT needed → tgs: audit 7EA5567BC48FFDD45C7054FF63B365287A9F964C56F877AC48BC28157329958A
- OK A6: key token: token t3 (key on the address) | OwnerCount=13 (Hook 1, URIToken 4, hook entries 8, in boxes 2) F=3 AUDIT=no | page: AUDIT needed → tgs: audit 1DE80A8B61DF000B16A3F0B44523873879B9A49B1E6119BE3D1FEEFCF0716688
- OK B1: AUDIT | after: OwnerCount=15 (Hook 1, URIToken 4, hook entries 10, in boxes 2) F=3 AUDIT=done/3 → tgs: audited BC37B78085DD5FB642D79708AEEEC332509CA4CBD6CD32AF3AD6683B318EEA8D
- OK B2: key token: token t3 after AUDIT | OwnerCount=15 (Hook 1, URIToken 4, hook entries 10, in boxes 2) F=3 AUDIT=done/3 | page: no AUDIT → tgs: packed C4086A6E207EE57DCD0B9F6F186E01A588E77134EA91BFAEBC9DBBCBF8BF7214
- OK B3: key token: 1 XAH after AUDIT | OwnerCount=18 (Hook 1, URIToken 4, hook entries 13, in boxes 3) F=2 AUDIT=done/3 | page: no AUDIT → tgs: packed 96F4C60C428674FE6BEB326A237A6C4547BD6D40C6CEC92EC4D6485F026792FC
- OK B4: link box 1 XAH, 2 more free tokens on the address | OwnerCount=22 (Hook 1, URIToken 6, hook entries 15, in boxes 3) F=4 AUDIT=done/3 | page: AUDIT needed → tgs: audit A2AFB0CFEE5A4614716F682A9D2A531FC68DE2E1CC237A539B1F436EE8737A4A
- NOT OK B5: box with t4 (t5 free) | OwnerCount=22 (Hook 1, URIToken 6, hook entries 15, in boxes 3) F=4 AUDIT=done/3 | page: no AUDIT → tgs: packed 37A03876BEDFF7718C7543AE25B76A24D3C363DDF0939EED0D7470563EE436FF
- OK B6: AUDIT | after: OwnerCount=24 (Hook 1, URIToken 6, hook entries 17, in boxes 4) F=3 AUDIT=done/3 → tgs: audited 215EEC60CEDF494705EACF33CCA002B599C6CCCF9F3BA69169C9484AE264AF5D
- NOT OK B7: box with t4 after 2nd AUDIT | OwnerCount=24 (Hook 1, URIToken 6, hook entries 17, in boxes 4) F=3 AUDIT=done/3 | page: no AUDIT → tgs: locked E784339B42F4230291A6579713B0BC8C779C56196BEC55029768C599CDA9B716
- OK C1: hook deletion (without NSDELETE) | OwnerCount=23 (Hook 0, URIToken 6, hook entries 17, in boxes 4) F=2 AUDIT=done/3 → tesSUCCESS D93A8119F8B34BF1C6B2666EA8ACA86A1ACA2A7F531BC6124DCB4B036C4F687F
- OK C2: reinstall v15 | OwnerCount=24 (Hook 1, URIToken 6, hook entries 17, in boxes 4) F=3 AUDIT=done/3 → tesSUCCESS 1A384CDB7326560D132B929C44EF94F62747E24790D6634572C74E63BD6A3D5E
- OK C3: after reinstall: box with t5 (F within the old AUDIT) | OwnerCount=24 (Hook 1, URIToken 6, hook entries 17, in boxes 4) F=3 AUDIT=done/3 | page: no AUDIT → tgs: packed 9368F12BED6FD142A1B1CE846236E60FD0C3EF202A49B9483A09F805A636E08C
- OK C4: after reinstall: 1 XAH | OwnerCount=26 (Hook 1, URIToken 6, hook entries 19, in boxes 5) F=2 AUDIT=done/3 | page: no AUDIT → tgs: packed 21FAA820472D280AB1440AA0237A357A0F7C0268FC4081F853A6A6C9B3793AB2
- OK C5: after reinstall: 1 XAH, +2 new tokens above AUDIT | OwnerCount=29 (Hook 1, URIToken 8, hook entries 20, in boxes 5) F=4 AUDIT=done/3 | page: AUDIT needed → tgs: audit 71246FCAB37210B37FB55C25DCE1F33AFB0C3DAFFD8CC2FDFD76E08C208FADCB
- OK C6: AUDIT | after: OwnerCount=29 (Hook 1, URIToken 8, hook entries 20, in boxes 5) F=4 AUDIT=done/4 → tgs: audited CE57606B824FF2660B19B86168B361ADF315F45D26A4F7C223BEEC4704551327
- OK C7: after new AUDIT: box with t6 | OwnerCount=29 (Hook 1, URIToken 8, hook entries 20, in boxes 5) F=4 AUDIT=done/4 | page: no AUDIT → tgs: packed 5025A6A94705876F695AEEFB5564717A71278BAAAA7A0786D031733CED84956A


Page/hook match: 14 of 14 PACK (B7 is an error of the test itself: t4 was already in a box, "tgs: locked"; B5: the expectation in the test was set wrong, hook and page matched).
The first run (run1_contaminated.log) was spoiled by a double start of the script and is not counted.
