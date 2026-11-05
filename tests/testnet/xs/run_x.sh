#!/bin/bash
# TESTNET ONLY. usage: run_x.sh x15 x4 ...
cd /workspace/box_token/v15/testnet/xs; export WASM=/workspace/box_token/v15/builder_tgsboxv15.wasm
for s in "$@"; do d=t15; [ -f v14b/$s.js ] && d=v14b
 ACCFILE=res/${s}_accounts_SECRET.json OUT=res/$s.json timeout 10800 node $d/$s.js > res/$s.log 2>&1; echo "exit $?" >> res/$s.log
 echo "$s PASS=$(grep -ac '^PASS' res/$s.log) FAIL=$(grep -ac '^FAIL' res/$s.log) $(grep -a 'RESULT' res/$s.log|tail -1) $(date +%H:%M)"; done
