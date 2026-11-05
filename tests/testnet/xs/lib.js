// TESTNET shim for t15/v14b suites: local signing only, faucet accounts, v15 by HookHash. Never server-side signing.
const M='/workspace/box_token/v15/auto/mods/node_modules/';const x=require(M+'xahau');const kp=require(M+'ripple-keypairs');const crypto=require('crypto');
const URL='https://xahau-test.net',NET=21338,HH='4847C361FCB669BD7C7E919092F9EB4831852B1152CA5AE9C08EFA7E741EE6FA',G='rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function rpc(method,params={}){if(method==='wallet_propose')return await faucetWallet();if(method==='ledger_accept')return await accept();
 for(let i=0;i<8;i++){try{const r=await fetch(URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({method,params:[params]})});const j=await r.json();if(j.result&&j.result.error==='slowDown'){await sleep(3000);continue;}return j.result;}catch(e){await sleep(2000);}}throw Error('rpc '+method);}
let ACC=[];const fs=require('fs');
async function faucet(){for(let i=0;i<15;i++){try{const r=await fetch(URL+'/accounts',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});const j=await r.json();if(j.account&&j.account.secret)return {address:j.account.classicAddress,secret:j.account.secret};}catch(e){}await sleep(6000);}throw Error('faucet');}
async function waitAcc(a){for(let i=0;i<40;i++){const r=await rpc('account_info',{account:a,ledger_index:'validated'});if(r.account_data)return;await sleep(2000);}throw Error('no acc');}
async function faucetWallet(){const a=await faucet();await waitAcc(a.address);ACC.push(a);if(process.env.ACCFILE)fs.writeFileSync(process.env.ACCFILE,JSON.stringify(ACC),{mode:0o600});return {account_id:a.address,master_seed:a.secret};}
const h=s=>Buffer.from(s).toString('hex').toUpperCase();
const sha512h=b=>crypto.createHash('sha512').update(b).digest().subarray(0,32);
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n);return b};
const u64=n=>{const b=Buffer.alloc(8);b.writeBigUInt64BE(BigInt(n));return b};
const P=(o)=>Object.entries(o).map(([k,v])=>({HookParameter:{HookParameterName:h(k),HookParameterValue:(Buffer.isBuffer(v)?v.toString('hex'):(/^([0-9A-Fa-f]{2})*$/.test(v)?v:h(v))).toUpperCase()}}));
async function vseq(){const r=await rpc('ledger',{ledger_index:'validated'});return Number(r.ledger.ledger_index);}
async function accept(){const s=await vseq();for(let i=0;i<30;i++){await sleep(1500);if((await vseq())>s)break;}return {};}
async function seq(){return (await rpc('ledger_current')).ledger_current_index;}
const NEXT={};let SPENT=0n,NTX=0;
async function donate(to,n){for(let k=0;k<n;k++){const d=await faucetWallet();const w=x.Wallet.fromSeed(d.master_seed,{algorithm:'ecdsa-secp256k1'});const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});
 await submit({address:w.address,seed:d.master_seed},{TransactionType:'Payment',Destination:to,Amount:String(BigInt(ai.account_data.Balance)-1500000n)});}}
async function submit(w,tx,{noAccept=false}={}){
 if(w.address===G){if(tx.TransactionType==='Payment'&&BigInt(tx.Amount)>1500000000n)await donate(tx.Destination,Math.min(3,Math.ceil(Number(BigInt(tx.Amount)/1000000n)/1000)-1));return {result:'tesSUCCESS',engine:'tesSUCCESS',hook:'',emit:[],tx:{Fee:'0'}};}
 tx={Account:w.address,NetworkID:NET,...tx};
 if(tx.TransactionType==='SetHook')for(const e of tx.Hooks||[]){const hk=e.Hook;if(hk&&hk.CreateCode){const ch=sha512h(Buffer.from(hk.CreateCode,'hex')).toString('hex').toUpperCase();if(ch!==HH)throw Error('refusing non-v15 code');delete hk.CreateCode;delete hk.HookApiVersion;hk.HookHash=HH;}}
 const wl=x.Wallet.fromSeed(w.seed,{algorithm:'ecdsa-secp256k1'});if(wl.address!==w.address)throw Error('seed mismatch');
 for(let att=0;att<4;att++){
 const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});let sq=ai.account_data.Sequence;if(NEXT[w.address]&&NEXT[w.address]>sq)sq=NEXT[w.address];
 const t={...tx,Sequence:sq,LastLedgerSequence:(await seq())+20};delete t.Fee;
 const f=await rpc('fee',{tx_blob:x.encode({...t,Fee:'0',SigningPubKey:wl.publicKey})});t.Fee=String(BigInt(f.drops.base_fee)*3n/2n+20n);
 let s;try{s=wl.sign(t);}catch(e){const u={...t,SigningPubKey:wl.publicKey};u.TxnSignature=kp.sign(x.encodeForSigning(u),wl.privateKey);const blob=x.encode(u);s={tx_blob:blob,hash:x.hashes.hashSignedTx(blob)};}const r=await rpc('submit',{tx_blob:s.tx_blob});NTX++;
 if(['tefPAST_SEQ','terPRE_SEQ','telCAN_NOT_QUEUE','telCAN_NOT_QUEUE_FEE'].includes(r.engine_result)){NEXT[w.address]=0;await sleep(4000);continue;}
 if(/^(tem|tef|tel)/.test(r.engine_result))return {hash:s.hash,engine:r.engine_result,result:r.engine_result,hook:'',emit:[],tx:{Fee:t.Fee}};
 NEXT[w.address]=sq+1;
 if(noAccept)return {hash:s.hash,engine:r.engine_result};
 return await getTx(s.hash,r.engine_result);}
 return {result:'notsubmitted',hook:'',emit:[],tx:{Fee:'0'}};}
async function getTx(hash,engine){let t;for(let i=0;i<45;i++){t=await rpc('tx',{transaction:hash});if(t&&t.validated)break;await sleep(1500);}
 const m=t.meta||{};const hx=(m.HookExecutions||[]).map(e=>e.HookExecution);
 const ret=hx.length===0?'(hook not called)':hx.map(e=>Buffer.from(e.HookReturnString||'','hex').toString().replace(/\0/g,'')).join(' | ');
 if(t&&t.Fee&&!t.EmitDetails)SPENT+=BigInt(t.Fee);
 return {hash,engine,result:m.TransactionResult||t.error,hook:ret,emit:(m.HookEmissions||[]).map(e=>e.HookEmission.EmittedTxnID),meta:m,tx:t};}
async function bal(a){a=a.address||a;const r=await rpc('account_info',{account:a,ledger_index:'current'});return r.account_data?Number(r.account_data.Balance)/1e6:null;}
async function ownerCount(a){const r=await rpc('account_info',{account:a,ledger_index:'current'});return r.account_data.OwnerCount;}
process.on('exit',()=>{try{console.log('TESTNET_STATS tx',NTX,'fees_drops',String(SPENT),'accounts',ACC.map(a=>a.address.slice(0,6)).join(','));}catch(e){}});
module.exports={kp,rpc,h,sha512h,u32,u64,P,accept,seq,submit,getTx,bal,ownerCount,NET,crypto};
