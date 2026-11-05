#!/bin/bash
# TESTNET ONLY (xahau-test.net, 21338). Fresh faucet accounts per suite. v15 by HookHash.
B=/workspace/box_token/v15/testnet; export NODE_PATH=/workspace/box_token/v15/auto/mods/node_modules
for s in ${SUITES:-main escape escape2 gaps gaps2 race multisign newtests audit auditb extra x7r4}; do
 cd $B; node mkaccounts.js $B/$s 2 > $s/mkacc.log 2>&1 || { echo "$s MKACC FAIL"; continue; }
 f=$(ls $s/*.js | head -1); (cd $s && timeout 7200 node $(basename $f) > run.log 2>&1; echo "exit $?" >> run.log)
 echo "$s PASS=$(grep -ac '^PASS' $s/run.log) FAIL=$(grep -ac '^FAIL' $s/run.log) $(tail -1 $s/run.log) $(date +%H:%M)"
done
