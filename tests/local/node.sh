#!/bin/bash
# usage: node.sh start BIN CFG fresh|load LOG ; node.sh stop
D=/workspace/box_token/v15/node
if [ "$1" = stop ]; then
  curl -s -X POST http://127.0.0.1:5005 -d '{"method":"stop","params":[{}]}' >/dev/null
  P=$(cat $D/node.pid 2>/dev/null); for i in $(seq 1 30); do kill -0 $P 2>/dev/null || { echo "node stopped"; exit 0; }; sleep 1; done
  echo "node did not stop, killing"; kill -9 $P; exit 0
fi
BIN=$2; CFG=$3; MODE=$4; LOG=$5
DB=$(grep -A1 '^\[database_path\]' $CFG | tail -1)
if [ "$MODE" = fresh ]; then rm -rf $DB; mkdir -p $DB; nohup $BIN --conf $CFG -a --start >> $LOG 2>&1 & echo $! > $D/node.pid
elif [ "$MODE" = load ]; then nohup $BIN --conf $CFG -a --load >> $LOG 2>&1 & echo $! > $D/node.pid
else nohup $BIN --conf $CFG -a --ledgerfile "$MODE" >> $LOG 2>&1 & echo $! > $D/node.pid; fi
for i in $(seq 1 40); do sleep 1; r=$(curl -s -X POST http://127.0.0.1:5005 -d '{"method":"server_info","params":[{}]}'); echo "$r" | grep -q '"server_state"' && { echo "$r" | python3 -c 'import json,sys;i=json.load(sys.stdin)["result"]["info"];print("node up",i["build_version"],i["server_state"],"peers",i.get("peers"),"net",i.get("network_id"),"vl",i.get("validated_ledger",{}).get("seq"))'; exit 0; }; done
echo "node failed to start"; tail -5 $LOG; exit 1
