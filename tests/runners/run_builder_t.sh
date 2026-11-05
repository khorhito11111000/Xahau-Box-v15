#!/bin/bash
# local standalone node2 (5015, net 21337) only
V=/workspace/box_token/v15; N=$V/node2; W=$V/builder_tgsboxv15.wasm
cd $N && DB=$(grep -A1 '^\[database_path\]' xahaud.cfg|tail -1); rm -rf $DB; mkdir -p $DB
nohup /workspace/emitfail_local/bin/xahaud_4119 --conf $N/xahaud.cfg -a --start > node.out 2>&1 & echo $! > node.pid; sleep 10
export RPC=http://127.0.0.1:5015 NETID=21337 WASM=$W
cd $V/node
for t in t15/x4 t15/x2 t15/x3 t15/x15 v14b/scen v14b/l14; do b=$(basename $t)
 OUT=res/${b}_builder.json timeout 3600 node $t.js > res/${b}_builder.log 2>&1; echo "$b exit $? PASS=$(grep -ac ^PASS res/${b}_builder.log) FAIL=$(grep -ac ^FAIL res/${b}_builder.log) $(grep -a 'RESULT\|LOCAL' res/${b}_builder.log|tail -1)"
done
kill $(cat $N/node.pid)
