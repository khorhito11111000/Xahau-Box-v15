// Creates fresh faucet-accounts for suite: node mkaccounts.js <dir> [donos_for_issuer]
// Secrets are written ONLY to <dir>/accounts_SECRET.json (chmod 600), are not printed to the console.
const T='/workspace/testnet_kit/tools';const x=require('/workspace/box_token/v15/auto/mods/node_modules/xahau');const fs=require('fs');
const URL='https://xahau-test.net',NET=21338;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function rpc(m,p={}){for(let i=0;i<6;i++){try{const r=await fetch(URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({method:m,params:[p]})});return (await r.json()).result;}catch(e){await sleep(2000);}}throw Error('rpc '+m);}
async function faucet(){for(let i=0;i<10;i++){try{const r=await fetch(URL+'/accounts',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});const j=await r.json();if(j.account&&j.account.secret)return {address:j.account.classicAddress,secret:j.account.secret};}catch(e){}await sleep(5000);}throw Error('faucet');}
async function waitAcc(a){for(let i=0;i<40;i++){const r=await rpc('account_info',{account:a,ledger_index:'validated'});if(r.account_data)return BigInt(r.account_data.Balance);await sleep(2000);}throw Error('no acc');}
(async()=>{const dir=process.argv[2];const donors=Number(process.argv[3]||2);fs.mkdirSync(dir,{recursive:true});const f=dir+'/accounts_SECRET.json';
 if(fs.existsSync(f)){console.log('exists',f);return;}
 const acc=[];for(let i=0;i<5;i++)acc.push(await faucet());
 for(const a of acc){const w=x.Wallet.fromSeed(a.secret,{algorithm:'ecdsa-secp256k1'});if(w.address!==a.address)throw Error('alg mismatch');await waitAcc(a.address);}
 fs.writeFileSync(f,JSON.stringify(acc,null,1),{mode:0o600});
 const I=acc[0].address;let funded=0;
 for(let k=0;k<donors;k++){const d=await faucet();await waitAcc(d.address);const w=x.Wallet.fromSeed(d.secret,{algorithm:'ecdsa-secp256k1'});
  const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
  const t={TransactionType:'Payment',Account:w.address,Destination:I,Amount:String(BigInt(ai.account_data.Balance)-1500000n),NetworkID:NET,Sequence:ai.account_data.Sequence,Fee:'1000',LastLedgerSequence:cur+20};
  const s=w.sign(t);const r=await rpc('submit',{tx_blob:s.tx_blob});
  for(let i=0;i<20;i++){const v=await rpc('tx',{transaction:s.hash});if(v&&v.validated){if(v.meta.TransactionResult==='tesSUCCESS')funded++;break;}await sleep(2000);}}
 const bals=[];for(const a of acc)bals.push(String(await waitAcc(a.address)));
 console.log('OK',dir,'addresses',acc.map(a=>a.address.slice(0,6)).join(','),'balances',bals.join(','),'donors ok',funded);})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
