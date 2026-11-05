#!/bin/bash
# usage: runall.sh <wasm-name> ; local standalone only
W=$1; A=/workspace/box_token/v15/auto; N=/workspace/box_token/v15/node; R=$A/res_$W; mkdir -p $R
cd $N && ./node.sh stop >/dev/null 2>&1; ./node.sh start /workspace/emitfail_local/bin/xahaud_4119 $N/xahaud.cfg fresh $N/node.out || exit 1
cd $A && (CLOSE=2 ./closer.sh & echo $! > closer.pid)
WASM=../$W.wasm HHFILE=$R/.hh node setup.js def
export NODE_PATH=/workspace/box_token/v15/auto/mods/node_modules; export HH=$(cat $R/.hh)
for s in ${SUITES:-main escape escape2 gaps gaps2 race multisign newtests audit auditb extra}; do
 rm -rf $R/$s; mkdir -p $R/$s; cp $A/$s/*.js $R/$s/; node setup.js acc $R/$s >/dev/null
 f=$(ls $R/$s/*.js); (cd $R/$s && timeout 3600 node $(basename $f) > run.log 2>&1; echo "exit $?" >> run.log)
 echo "$s PASS=$(grep -ac '^PASS' $R/$s/run.log) FAIL=$(grep -ac '^FAIL' $R/$s/run.log) $(tail -1 $R/$s/run.log)"
done
kill $(cat closer.pid); cd $N && ./node.sh stop
