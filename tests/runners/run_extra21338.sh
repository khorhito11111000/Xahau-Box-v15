#!/bin/bash
# local standalone net 21338 only
cd /workspace/box_token/v15/node3 && DB=$(grep -A1 '^\[database_path\]' xahaud.cfg|tail -1); rm -rf $DB; mkdir -p $DB
nohup /workspace/emitfail_local/bin/xahaud_4119 --conf $PWD/xahaud.cfg -a --start > node.out 2>&1 & echo $! > node.pid; sleep 8
cd ../auto; R=res_x21338; rm -f $R/extra/run.log; export RPC=http://127.0.0.1:5025 NETID=21338 NODE_PATH=$PWD/mods/node_modules
WASM=../tgstkshookbox_15.wasm HHFILE=$R/.hh node setup.js def && node setup.js acc $PWD/$R/extra >/dev/null || exit 1
(while true; do curl -s -X POST $RPC -d '{"method":"ledger_accept","params":[{}]}' >/dev/null; sleep 2; done) & CP=$!
cd $R/extra && HH=$(cat ../.hh) timeout 3000 node extra.js > run.log 2>&1; kill $CP
echo "extra21338 PASS=$(grep -ac ^PASS run.log) FAIL=$(grep -ac ^FAIL run.log)"; grep -a ^FAIL run.log | cut -c1-120
kill $(cat /workspace/box_token/v15/node3/node.pid)
