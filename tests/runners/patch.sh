#!/bin/bash
# repoint copies to local node only
cd /workspace/box_token/v15/auto
for f in */*.js; do
 sed -i -e "s#const URL='https://xahau-test.net',NET=21338,HOOKHASH='[0-9A-F]*'#const URL='http://127.0.0.1:5005',NET=21337,HOOKHASH=process.env.HH#" \
  -e "s#'/workspace/v14_tools/sign_claim.js','--priv'#'/workspace/v14_tools/sign_claim.js','--net','21337','--url','http://127.0.0.1:5005','--priv'#" "$f"
done
grep -n "https\?://" */*.js | grep -v "127.0.0.1" | cut -c1-160
grep -c "127.0.0.1:5005" */*.js
