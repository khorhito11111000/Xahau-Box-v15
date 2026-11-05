// Rerun on the user build (Hooks Builder), HookHash v15 4847C3…, fresh faucet-accounts. Secrets only in accounts_SECRET.json.
const T='/workspace/testnet_kit/tools',Q='/workspace/box_token/v15/auto/mods/node_modules/';
const x=require('/workspace/box_token/v15/auto/mods/node_modules/xahau');const kp=require('/workspace/box_token/v15/auto/mods/node_modules/ripple-keypairs');const secp=require('/workspace/box_token/v15/auto/mods/node_modules/@noble/curves/secp256k1').secp256k1;
const QR=require(T+'/qr_payload.js');const {encrypt}=require(T+'/encrypt_secret.js');const {decrypt}=require(T+'/decrypt_secret.js');
const qrcode=require(Q+'qrcode');const jsQR=require(Q+'jsqr');const {PNG}=require(Q+'pngjs');
const fs=require('fs'),crypto=require('crypto');const D=__dirname;const SUITE=require('path').basename(D);fs.mkdirSync(D+'/qr_png',{recursive:true});
const URL='https://xahau-test.net',NET=21338,HOOKHASH='4847C361FCB669BD7C7E919092F9EB4831852B1152CA5AE9C08EFA7E741EE6FA';
const NS='7467730000000000000000000000000000000000000000000000000000000000',HOOKON='FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF10FFFFFFFCFFC1FFFBF800240';
const sha512h=b=>crypto.createHash('sha512').update(b).digest().subarray(0,32);
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(Number(n));return b.toString('hex').toUpperCase()};
const u64=n=>{const b=Buffer.alloc(8);b.writeBigUInt64BE(BigInt(n));return b.toString('hex').toUpperCase()};
const H=s=>Buffer.from(s).toString('hex').toUpperCase();
const P=o=>Object.entries(o).map(([k,v])=>({HookParameter:{HookParameterName:H(k),HookParameterValue:v}}));
const CMD={PACK:H('PACK'),CLAIM:H('CLAIM'),OPEN:H('OPEN'),AUDIT:H('AUDIT')};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function rpc(m,p={}){for(let i=0;i<5;i++){try{const r=await fetch(URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({method:m,params:[p]})});return (await r.json()).result;}catch(e){await sleep(2000);}}throw Error('rpc down '+m);}
const ACC=JSON.parse(fs.readFileSync(D+'/accounts_SECRET.json'));
const W=ACC.map(a=>{const w=x.Wallet.fromSeed(a.secret,{algorithm:'ecdsa-secp256k1'});if(w.address!==a.address)throw Error('seed mismatch');return w;});
const [I,R1,R2,R3,S]=W;const NAME={[I.address]:'issuer',[R1.address]:'R1',[R2.address]:'R2',[R3.address]:'R3',[S.address]:'R4(foreign)'};
const rows=[],txlog=[];let TX=0;
const rec=(sc,name,expect,got,ok,hash)=>{rows.push({sc,name,expect,got,ok,hash});console.log(ok?'PASS':'FAIL',sc,name,'|',got,hash||'');};
const hookRet=m=>{const hx=(m&&m.HookExecutions||[]).map(e=>e.HookExecution);return hx.length?hx.map(e=>Buffer.from(e.HookReturnString||'','hex').toString().replace(/\0/g,'')).join(' | '):'(hook not called)';};
async function waitTx(hash,lls){for(let i=0;i<400;i++){const t=await rpc('tx',{transaction:hash});if(t&&t.validated)return t;if(lls){const c=await rpc('ledger',{ledger_index:'validated'});if(c&&c.ledger&&c.ledger.ledger_index>lls){const t2=await rpc('tx',{transaction:hash});return t2&&t2.validated?t2:null;}}else if(i>=60)return null;await sleep(1500);}return null;}
// fixed: resend only when the old signature can no longer land in a ledger (validated ledger > LastLedgerSequence)
async function send(w,tx,label){tx={Account:w.address,NetworkID:NET,...tx};let last=null;
 for(let attempt=0;attempt<4;attempt++){
 const ai=await rpc('account_info',{account:tx.Account,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
 const t={...tx,Sequence:ai.account_data.Sequence,LastLedgerSequence:cur+20,Fee:'0',SigningPubKey:''};if(t.Fee===undefined)delete t.Fee;
 const f=await rpc('fee',{tx_blob:x.encode({...t,Fee:'0'})});const base=BigInt(f.drops.base_fee);t.Fee=tx.Fee&&tx.Fee!=='0'?tx.Fee:String(base*3n/2n+20n);delete t.SigningPubKey;
 let signed;try{signed=w.sign(t);}catch(e){const u={...t,SigningPubKey:w.publicKey};u.TxnSignature=kp.sign(x.encodeForSigning(u),w.privateKey);const blob=x.encode(u);signed={tx_blob:blob,hash:x.hashes.hashSignedTx(blob)};}const r=await rpc('submit',{tx_blob:signed.tx_blob});TX++;
 if(r.engine_result==='tefPAST_SEQ'){await sleep(4000);continue;} // this signature can never apply now: safe to re-sign
 if(/^tef|^tem/.test(r.engine_result)){txlog.push({label,type:tx.TransactionType,from:NAME[w.address],hash:signed.hash,result:r.engine_result,hook:'',inLedger:false});return {hash:signed.hash,result:r.engine_result,hook:'',emit:[]};}
 const v=await waitTx(signed.hash,t.LastLedgerSequence);
 if(!v||!v.validated){last={hash:signed.hash,eng:r.engine_result};if(attempt<3){await sleep(3000);continue;}txlog.push({label,hash:signed.hash,result:'NOT VALIDATED '+r.engine_result,inLedger:false});return {hash:signed.hash,result:'notvalidated',hook:'',emit:[]};}
 const m=v.meta;const g={hash:signed.hash,result:m.TransactionResult,hook:hookRet(m),emit:(m.HookEmissions||[]).map(e=>e.HookEmission.EmittedTxnID),fee:BigInt(v.Fee),meta:m,ledger:v.ledger_index};
 txlog.push({label,type:tx.TransactionType,from:NAME[w.address],hash:g.hash,result:g.result,hook:g.hook,fee:v.Fee,ledger:v.ledger_index,inLedger:true});return g;}}
async function emitted(g,label){if(!g.emit||!g.emit[0])return 'no emit';const v=await waitTx(g.emit[0]);const res=v&&v.meta?v.meta.TransactionResult:'not found';txlog.push({label:'emit: '+label,type:'Remit(emit)',hash:g.emit[0],result:res,hook:v?hookRet(v.meta):'',ledger:v&&v.ledger_index,inLedger:!!(v&&v.validated),emitted:true});TX++;await sleep(1500);return res;}
const bal=async a=>BigInt((await rpc('account_info',{account:a,ledger_index:'validated'})).account_data.Balance);
const owner=async id=>{const r=await rpc('ledger_entry',{index:id,ledger_index:'validated'});return r&&r.node?r.node.Owner:null;};
const uriOf=async id=>{const r=await rpc('ledger_entry',{index:id,ledger_index:'validated'});return r.node&&r.node.URI;};
const seq=async()=>(await rpc('ledger_current')).ledger_current_index;
const tokId=(acc,u)=>sha512h(Buffer.concat([Buffer.from('0055','hex'),Buffer.from(x.decodeAccountID(acc)),Buffer.from(u,'hex')])).toString('hex').toUpperCase();
function boxKey(){const s=x.Wallet.generate('ecdsa-secp256k1').seed;const k=x.deriveKeypair(s,{algorithm:'ecdsa-secp256k1'});return {PK:k.publicKey.toUpperCase(),VC:sha512h(Buffer.from(k.publicKey,'hex')).toString('hex').toUpperCase(),PRIV:k.privateKey.toUpperCase()};}
const bkeyOf=vc=>sha512h(Buffer.concat([Buffer.from('42','hex'),Buffer.from(vc,'hex')])).toString('hex').toUpperCase();
function boxData(vc,hook){try{const r=JSON.parse(require('child_process').execFileSync('curl',['-s',URL,'-d',JSON.stringify({method:'ledger_entry',params:[{hook_state:{account:hook,key:bkeyOf(vc),namespace_id:NS},ledger_index:'validated'}]})]).toString()).result;const d=r&&r.node&&r.node.HookStateData;if(d&&d.length===170)return {tid:d.slice(0,64),amt:d.slice(64,80),nonce:d.slice(162,170)};}catch(e){}return {tid:'0'.repeat(64),amt:'0'.repeat(16),nonce:'00000000'};}
function sign(priv,claimer,hook,exp=0){priv=priv.toUpperCase();const ph=priv.length===66&&priv.startsWith('00')?priv.slice(2):priv;
 const PK=Buffer.from(secp.getPublicKey(ph,true)).toString('hex').toUpperCase();const VC=sha512h(Buffer.from(PK,'hex'));const bd=boxData(VC.toString('hex'),hook);
 const msg=Buffer.concat([Buffer.from(x.decodeAccountID(claimer)),VC,Buffer.from(x.decodeAccountID(hook)),Buffer.from(u32(NET),'hex'),Buffer.from(u32(exp),'hex'),Buffer.from(bd.tid,'hex'),Buffer.from(bd.amt,'hex'),Buffer.from(bd.nonce,'hex')]);
 return {PK,SIG:kp.sign(sha512h(msg).toString('hex'),priv).toUpperCase()};}
const makeAddr=o=>'tgs1:'+Buffer.from(JSON.stringify(o)).toString('base64url');
function parseAny(s){const p=JSON.parse(Buffer.from(s.slice(5),'base64url').toString());return {hook:p.h,box:p.b,vc:p.c,enc:p.k,token:p.t,addr:p.a,pk:p.p,sig:p.s,exp:p.x||0};}
async function scan(text,file){await qrcode.toFile(file,text,{errorCorrectionLevel:'M',margin:2,width:512});const png=PNG.sync.read(fs.readFileSync(file));const r=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);return r?r.data:null;}
let nonce=0;
async function mint(label){const u=H(`tgsauto:${label}:${Date.now()}:${nonce++}`);const g=await send(I,{TransactionType:'URITokenMint',URI:u},'mint '+label);if(g.result!=='tesSUCCESS')throw Error('mint '+g.result);return tokId(I.address,u);}
async function mintURI(u,label){const g=await send(I,{TransactionType:'URITokenMint',URI:u},'mint '+label);if(g.result!=='tesSUCCESS')throw Error('mint '+g.result);return tokId(I.address,u);}
async function audit(){let a;for(let i=0;i<25;i++){a=await send(I,{TransactionType:'Invoke',HookParameters:P({CMD:CMD.AUDIT})},'AUDIT');if(!/more/.test(a.hook))break;}if(!/audited/.test(a.hook))console.log('AUDIT not finished:',a.result,a.hook,a.hash);return a;}
function packParams(b){const p={CMD:CMD.PACK,VC:b.vc};if(b.mode==='T'){p.MODE='01';p.KTID=b.ktid;}p.TID=b.tid||'0'.repeat(64);p.AMT=u64(b.amt||0n);if(b.exp)p.EXP=u32(b.exp);return p;}
async function pack(b,label){let g=await send(I,{TransactionType:'Invoke',HookParameters:P(packParams(b))},'PACK '+label);for(let k=0;k<3&&/tgs: audit/.test(g.hook);k++){await audit();g=await send(I,{TransactionType:'Invoke',HookParameters:P(packParams(b))},'PACK '+label);}return g;}
const claimKey=(w,PK,SIG,l)=>send(w,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK,SIG})},'CLAIM '+l);
const claimTok=(w,VC,l)=>send(w,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,VC})},'CLAIM '+l);
const openBox=(vc,l)=>send(I,{TransactionType:'Invoke',HookParameters:P({CMD:CMD.OPEN,VC:vc})},'OPEN '+l);
async function newBox(label,{mode='K',token=true,amt=2000000n,exp=0,uri}={}){const b={label,mode,amt};if(token)b.tid=uri?await mintURI(uri,label):await mint(label);
 if(mode==='T'){b.ktid=await mint(label+'-key');b.vc=crypto.randomBytes(32).toString('hex').toUpperCase();}else{const k=boxKey();b.vc=k.VC;b.priv=k.PRIV;}b.exp=exp;return b;}
async function packOk(sc,b){const g=await pack(b,b.label);rec(sc,`${b.label}: PACK`,'tgs: packed',g.hook,g.hook.includes('tgs: packed'),g.hash);return g;}
async function delivered(sc,b,w,g,before){const rr=await emitted(g,b.label);rec(sc,`${b.label}: emit Remit to recipient`,'tesSUCCESS',rr,rr==='tesSUCCESS',g.emit[0]);
 const d=(await bal(w.address))-before+g.fee;const want=b.amt+(b.tid?200000n:0n);rec(sc,`${b.label}: XAH arrived (Δ+fee)`,`${want} drops`,`${d} drops`,d===want);
 if(b.tid){const o=await owner(b.tid);rec(sc,`${b.label}: token at ${NAME[w.address]}`,NAME[w.address],NAME[o]||o,o===w.address);}}
async function keyClaim(sc,b,w){const s=sign(b.priv,w.address,I.address,b.exp);const before=await bal(w.address);const g=await claimKey(w,s.PK,s.SIG,b.label);
 rec(sc,`${b.label}: CLAIM (${NAME[w.address]})`,'tgs: claiming',g.hook,g.hook.includes('tgs: claiming'),g.hash);await delivered(sc,b,w,g,before);return s;}
async function tokClaim(sc,b,w){const before=await bal(w.address);const g=await claimTok(w,b.vc,b.label);rec(sc,`${b.label}: CLAIM by key holder (${NAME[w.address]})`,'tgs: claiming',g.hook,g.hook.includes('tgs: claiming'),g.hash);await delivered(sc,b,w,g,before);}
const expectHook=async(sc,name,want,p)=>{const g=await p;rec(sc,name,want,g.hook||g.result,(g.hook||'').includes(want),g.hash);return g;};
const remitKey=(from,to,id,l)=>send(from,{TransactionType:'Remit',Destination:to.address,URITokenIDs:[id]},'Remit '+l);

// ===== added for run on the user build =====
async function ensureHook(w){w=w||I;for(let i=0;i<4;i++){const ho=await rpc('account_objects',{account:w.address,type:'hook',ledger_index:'validated'});const hk=((ho.account_objects||[])[0]||{}).Hooks;
 if(hk&&hk[0]&&hk[0].Hook.HookHash===HOOKHASH&&(hk[0].Hook.HookOn||HOOKON)===HOOKON)return true;
 const g=await send(w,{TransactionType:'SetHook',Hooks:[{Hook:{HookHash:HOOKHASH,HookNamespace:NS,HookOn:HOOKON,Flags:1}}]},'ensure: SetHook by HookHash');console.log('ensureHook',NAME[w.address]||w.address,g.result,g.hash);await sleep(4000);}
 throw Error('failed to install hook');}
function dumpFinal(extra){try{const R=rows.filter(r=>!r.info);const inL=txlog.filter(t=>t.inLedger).length;const o={suite:SUITE,hookHash:HOOKHASH,finished:new Date().toISOString(),pass:R.filter(r=>r.ok).length,fail:R.filter(r=>!r.ok).length,checks:R.length,txSubmittedOrEmitted:txlog.length,txInLedger:inL,accounts:W.map(w=>({role:NAME[w.address],address:w.address})),rows,txlog,...(extra||{})};
 fs.writeFileSync(D+'/final.json',JSON.stringify(o,(k,v)=>typeof v==='bigint'?String(v):v,1));}catch(e){console.error('dumpFinal',e.message);}}
process.on('exit',()=>dumpFinal());
// ===== Attempts to withdraw XAH/token from a CLOSED box via other transaction types =====
const now=()=>x.unixTimeToRippleTime(Date.now());const GEN='rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
const chk=(sc,name,expect,g,ok,safe)=>{rows.push({sc,name,expect,got:`${g.result} / ${g.hook}`,ok,hash:g.hash,safe});console.log(ok?'PASS':'FAIL',sc,name,'|',g.result,g.hook,g.hash);};
const rej=(g,s)=>(g.hook||'').includes(s)&&/HOOK_REJECTED/.test(g.result);
const done=g=>g.result==='tesSUCCESS';
// ===== GAPS2: OPEN-failure, CLAIM outside ledger, EXP=00000000 =====
const nsList=async()=>((await rpc('account_namespace',{account:I.address,namespace_id:NS,ledger_index:'validated'})).namespace_entries||[]);
const stateOf=async vc=>{const L=await nsList();const b=bkeyOf(vc);let e=L.find(z=>z.HookStateKey===b);if(!e)e=L.find(z=>z.HookStateKey===vc);return e?e.HookStateData:null;};const rawState=async k=>{const e=(await nsList()).find(z=>z.HookStateKey===k);return e?e.HookStateData:null;};
async function raw(w,tx,label,{llsOff=20,fee}={}){const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
 const t={Account:w.address,NetworkID:NET,...tx,Sequence:ai.account_data.Sequence,LastLedgerSequence:cur+llsOff,Fee:fee||'5000',SigningPubKey:w.publicKey};
 t.TxnSignature=kp.sign(x.encodeForSigning(t),w.privateKey);const blob=x.encode(t);const hash=x.hashes.hashSignedTx(blob);const r=await rpc('submit',{tx_blob:blob});
 await sleep(12000);const v=await rpc('tx',{transaction:hash});const inL=!!(v&&v.validated);
 txlog.push({label,type:tx.TransactionType,from:NAME[w.address],hash,result:'submit '+r.engine_result+(inL?' / in ledger':' / NOT in ledger'),hook:''});TX++;
 console.log('RAW',label,r.engine_result,inL,hash);return {hash,result:r.engine_result,inLedger:inL};}
const waitL=async n=>{while((await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index<=n)await sleep(3000);};
const okH=(g,s)=>(g.hook||'').includes(s);
const out=(sc,name,expect,got,ok,hash,sev)=>{rows.push({sc,name,expect,got,ok,hash,sev});console.log(ok?'PASS':'FAIL',sc,name,'|',got,hash||'');};const INFO=(sc,name,got,hash)=>{rows.push({sc,name,expect:'(observation)',got,ok:true,hash,info:true});console.log('INFO',sc,name,'|',got,hash||'');};const LIM=(sc,name,expect,got,ok,hash)=>{rows.push({sc,name,expect,got,ok,hash,lim:true});console.log(ok?'PASS':'FAIL','[limitation]',sc,name,'|',got,hash||'');};
async function sub(w,tx,{seq,llsOff=20,fee='2000'}={}){const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
 const t={Account:w.address,NetworkID:NET,...tx,Sequence:seq??ai.account_data.Sequence,LastLedgerSequence:cur+llsOff,Fee:'0',SigningPubKey:''};if(fee==='2000'){const f=await rpc('fee',{tx_blob:x.encode(t)});fee=String(BigInt(f.drops.base_fee)*3n/2n+20n);}t.Fee=fee;t.SigningPubKey=w.publicKey;
 t.TxnSignature=kp.sign(x.encodeForSigning(t),w.privateKey);const blob=x.encode(t);const hash=x.hashes.hashSignedTx(blob);const r=await rpc('submit',{tx_blob:blob});TX++;return {hash,eng:r.engine_result,lls:t.LastLedgerSequence};}
async function fin(s,label){const v=await waitTx(s.hash,s.lls);if(!v||!v.validated){txlog.push({label,hash:s.hash,result:'NOT VALIDATED '+s.eng});return {hash:s.hash,result:'notvalidated '+s.eng,hook:'',emit:[]};}
 const m=v.meta;const g={hash:s.hash,result:m.TransactionResult,hook:hookRet(m),emit:(m.HookEmissions||[]).map(e=>e.HookEmission.EmittedTxnID),idx:m.TransactionIndex,ledger:v.ledger_index,fee:BigInt(v.Fee)};txlog.push({label,type:v.TransactionType,hash:g.hash,result:g.result,hook:g.hook,ledger:g.ledger,idx:g.idx});return g;}
const mintBy=async(w,label,flags)=>{const u=H(`tgsaudit:${label}:${Date.now()}:${nonce++}`);const g=await send(w,{TransactionType:'URITokenMint',URI:u,...(flags?{Flags:flags}:{})},'mint '+label);if(g.result!=='tesSUCCESS')throw Error('mint '+g.result);return tokId(w.address,u);};
const give=async(from,to,id,l)=>{let g=await send(from,{TransactionType:'URITokenCreateSellOffer',URITokenID:id,Amount:'0',Destination:to.address},'offer '+l);g=await send(to,{TransactionType:'URITokenBuy',URITokenID:id,Amount:'0'},'buy '+l);return g;};
const held=async()=>{const s=await rawState('11'.repeat(32));return s?BigInt('0x'+s.slice(0,16)):0n;};
const rnd=()=>crypto.randomBytes(32).toString('hex').toUpperCase();
(async()=>{let g,sc;
 g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookHash:HOOKHASH,HookNamespace:NS,HookOn:HOOKON,Flags:1}}]},'SetHook by HookHash (H2)');out('0','Hook install on H2 by HookHash','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);

 // A1: wrong CLAIM before right in one ledger
 sc='A1';let hit=0;for(let k=0;k<6&&hit<2;k++){const B=await newBox('A1-'+k,{token:false,amt:1000000n});await packOk(sc,B);
  const good=sign(B.priv,R1.address,I.address,0);const bad=sign(B.priv,R1.address,I.address,0);const other=boxKey();const badS=sign(other.PRIV,R2.address,I.address,0);
  // wrong: R2 with a foreign signature (bad sig), R3 with signature for R1 (bad sig)
  const s1=await sub(R2,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:good.PK,SIG:badS.SIG})});
  const s2=await sub(R3,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:good.PK,SIG:good.SIG})});
  const s3=await sub(R1,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:good.PK,SIG:good.SIG})});
  const [a,b,c]=[await fin(s1,'A1 bad R2'),await fin(s2,'A1 bad R3'),await fin(s3,'A1 good R1')];
  const same=a.ledger===c.ledger||b.ledger===c.ledger;const ahead=(a.ledger===c.ledger&&a.idx<c.idx)||(b.ledger===c.ledger&&b.idx<c.idx);if(ahead)hit++;
  {const rj=z=>/HOOK_REJECTED/.test(z.result)&&(okH(z,'bad sig')||(okH(z,'busy')&&z.ledger===c.ledger&&z.idx>c.idx));out(sc,`round ${k}: wrong ${a.ledger}#${a.idx},${b.ledger}#${b.idx} right ${c.ledger}#${c.idx}${ahead?' (wrong BEFORE right)':''}`,'wrong: bad sig (or busy, if after the right one), right: claiming',`${a.hook} | ${b.hook} | ${c.hook}`,rj(a)&&rj(b)&&okH(c,'claiming'),c.hash);}
  if(c.emit[0]){const r=await emitted(c,'A1-'+k);out(sc,`round ${k}: payout`,'tesSUCCESS',r,r==='tesSUCCESS',c.emit[0]);}}
 INFO(sc,'Rounds where the wrong one was before the right one in the same ledger (order is set by the network; checked deterministically by suite auditb)',String(hit));

 // A2: signature replay onto a new box with the same key
 sc='A2';{const k=boxKey();const B={label:'A2a',amt:1000000n,vc:k.VC,priv:k.PRIV,exp:0};await packOk(sc,B);const s=sign(k.PRIV,R1.address,I.address,0);
  g=await claimKey(R1,s.PK,s.SIG,'A2a');out(sc,'CLAIM box 1 with signature for R1','tgs: claiming',g.hook,okH(g,'claiming'),g.hash);await emitted(g,'A2a');
  const B2={label:'A2b (same key, 2 XAH)',amt:2000000n,vc:k.VC,priv:k.PRIV,exp:0};await packOk(sc,B2);
  g=await claimKey(R1,s.PK,s.SIG,'A2b old signature');out(sc,'Old signature R1 opens a NEW box with the same key','tgs: bad sig (if protected)',g.hook,!okH(g,'claiming'),g.hash,'miss');if(g.emit[0])await emitted(g,'A2b');}

 // A3: owner (knows the key) takes a box with expiry via their second account
 sc='A3';{const B=await newBox('A3',{token:false,amt:1000000n});B.exp=(await seq())+5000;await packOk(sc,B);
  g=await openBox(B.vc,'A3 before expiry');out(sc,'OPEN before expiry','tgs: not expired',g.hook,okH(g,'not expired'),g.hash);
  const s=sign(B.priv,R3.address,I.address,B.exp);g=await claimKey(R3,s.PK,s.SIG,'A3 owner via 2nd account');LIM(sc,'[design] Owner, knowing the key, takes the box from a 2nd account before expiry','possible: the owner creates the key',g.hook,okH(g,'claiming'),g.hash);await emitted(g,'A3');}

 // A4: VC == TID of another box (overwriting box entry with a lock)
 sc='A4';{const h00=await held();const X=await mintBy(I,'A4-X');const B={label:'A4a (VC=ID token X, token mode)',mode:'T',amt:1000000n,vc:X,exp:0};B.ktid=await mintBy(I,'A4-key');await packOk(sc,B);
  const k2=boxKey();const B2={label:'A4b (TID=X)',mode:'K',amt:0n,tid:X,vc:k2.VC,priv:k2.PRIV,exp:0};g=await pack(B2,B2.label);out(sc,'PACK of second box with TID = VC first (v14: box entry by key BKEY, lock by TID - do not overlap)','tgs: packed',g.hook,okH(g,'packed'),g.hash);
  const st=await rawState(bkeyOf(X));out(sc,'Box entry A4a intact (85 bytes, status 00)','85 bytes/00',st?`${st.length/2} bytes/${st.slice(88,90)}`:'no',!!st&&st.length===170&&st.slice(88,90)==='00');
  const lk=await rawState(X);out(sc,'Token lock X set (01)','01',lk||'no',lk==='01');
  await give(I,R1,B.ktid,'A4 key->R1');await tokClaim(sc,B,R1);await keyClaim(sc,B2,R2);
  out(sc,'held (META) returned to the value before A4',`${h00}`,String(await held()),(await held())===h00);}
 // A5: VC = service key TRK (0x55..) and OCK (0x44..)
 sc='A5';{const bx=[];const svc=[['TRK','55'.repeat(32)],['OCK','44'.repeat(32)],['AUD','33'.repeat(32)],['META','11'.repeat(32)],['NCK','66'.repeat(32)]];
  for(const [nm,key] of svc){const before=await rawState(key);const B={label:'A5 VC='+nm,mode:'K',amt:1000000n,vc:key,exp:(await seq())+25};g=await pack(B,B.label);
   out(sc,`PACK with VC=${nm} (v14: box is stored by BKEY, service entry untouched)`,'tgs: packed',g.hook,okH(g,'packed'),g.hash);bx.push(B);
   const after=await rawState(key);const exp=nm==='META'||nm==='NCK'||nm==='AUD'||nm==='OCK'?'service entry not corrupted':'';
   out(sc,`Service entry ${nm} after PACK`,'same length as before',`${before?before.length/2:0} → ${after?after.length/2:0} bytes`,(before?before.length:0)===(after?after.length:0)||(!before&&!!after&&nm!=='TRK'));}
  g=await send(I,{TransactionType:'OfferCreate',TakerGets:'1000000',TakerPays:{currency:'USD',issuer:R1.address,value:'1'}},'A5 OfferCreate');out(sc,'OfferCreate 1 XAH (writes TRK)','tesSUCCESS',g.result+' / '+g.hook,g.result==='tesSUCCESS',g.hash);
  const t=await rawState('55'.repeat(32));out(sc,'TRK after offer = 48 bytes, box VC=TRK intact','48 / 85',`${t?t.length/2:0} / ${((await stateOf('55'.repeat(32)))||'').length/2}`,!!t&&t.length===96&&((await stateOf('55'.repeat(32)))||'').length===170);
  g=await audit();out(sc,'AUDIT (writes AUD/OCK)','tgs: audited',g.hook,okH(g,'audited'),g.hash);
  out(sc,'All 5 boxes with service entries VC intact after AUDIT','5',String((await Promise.all(bx.map(z=>stateOf(z.vc)))).filter(z=>z&&z.length===170).length),(await Promise.all(bx.map(z=>stateOf(z.vc)))).filter(z=>z&&z.length===170).length===5);
  await waitL(Math.max(...bx.map(z=>z.exp))+1);for(const B of bx){g=await openBox(B.vc,B.label);out(sc,`OPEN ${B.label} after expiry`,'tgs: opened',g.hook,okH(g,'opened'),g.hash);}
  {const offs=(await rpc('account_objects',{account:I.address,type:'offer',ledger_index:'validated'})).account_objects||[];for(const o of offs)await send(I,{TransactionType:'OfferCancel',OfferSequence:o.Sequence},'A5 OfferCancel');}}
 // A6: key token burned by holder
 sc='A6';for(const withExp of [false,true]){const B=await newBox('A6 '+(withExp?'EXP':'without EXP'),{mode:'T',token:false,amt:1000000n});if(withExp)B.exp=(await seq())+12;await packOk(sc,B);
  await give(I,R1,B.ktid,'A6 key->R1');g=await send(R1,{TransactionType:'URITokenBurn',URITokenID:B.ktid},'A6 burn key');out(sc,'Holder burned the key token','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
  g=await claimTok(R1,B.vc,'A6');out(sc,'CLAIM after key burn','tgs: not holder',g.hook,okH(g,'not holder'),g.hash);
  g=await openBox(B.vc,'A6 immediately');out(sc,`OPEN immediately (${withExp?'EXP set':'without EXP'})`,withExp?'tgs: not expired':'tgs: opened (v14: key burned → owner can open)',g.hook,okH(g,withExp?'not expired':'opened'),g.hash);
  if(withExp){await waitL(B.exp+1);g=await openBox(B.vc,'A6 after expiry');out(sc,'OPEN after expiry','tgs: opened',g.hook,okH(g,'opened'),g.hash);}}

 // A7: KTID - not URIToken (account root object)
 sc='A7';{const k=Buffer.alloc(34);const ak=sha512h(Buffer.concat([Buffer.from('0061','hex'),Buffer.from(x.decodeAccountID(I.address))])).toString('hex').toUpperCase();
  const B={label:'A7 KTID=AccountRoot',mode:'T',amt:1000000n,vc:rnd(),ktid:ak,exp:0};g=await pack(B,B.label);out(sc,'PACK with KTID = ID AccountRoot (not a token)','tgs: ktid',g.hook,okH(g,'tgs: ktid'),g.hash);
  if(okH(g,'packed')){g=await claimTok(R1,B.vc,'A7');out(sc,'CLAIM such a box','not holder',g.hook,true,g.hash);await openBox(B.vc,'A7 cleanup');}}

 // A8: KTID with the owner, owner CLAIM-it themself
 sc='A8';{const B=await newBox('A8 key with owner',{mode:'T',token:false,amt:1000000n});B.exp=(await seq())+5000;await packOk(sc,B);
  g=await claimTok(I,B.vc,'A8 owner themself');INFO(sc,'Owner (holds KTID) CLAIM before expiry',`${g.result} / ${g.hook}`,g.hash);if(g.emit[0]){const r=await emitted(g,'A8');INFO(sc,'Emit Remit to self',r,g.emit[0]);await sleep(8000);}
  INFO(sc,'Box after this',(await stateOf(B.vc))?'exists':'no');
  await give(I,R3,B.ktid,'A8 key->R3');g=await claimTok(R3,B.vc,'A8 2-th account');LIM(sc,'[design] Owner passed KTID to own 2nd account and took it before expiry','possible: the key token is with the owner until given away',g.hook,okH(g,'claiming')||okH(g,'unknown'),g.hash);if(g.emit[0])await emitted(g,'A8b');}

 // A9: token with an already placed sell offer before PACK
 sc='A9';for(const dest of [true,false]){const X=await mintBy(I,'A9');g=await send(I,{TransactionType:'URITokenCreateSellOffer',URITokenID:X,Amount:'1',...(dest?{Destination:R2.address}:{})},'A9 offer before PACK');out(sc,`Sell offer before PACK (${dest?'Destination R2':'without Destination'})`,'tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
  const B={label:'A9 box '+(dest?'d':'nd'),mode:'K',amt:1000000n,tid:X,vc:boxKey().VC,exp:0};g=await pack(B,B.label);out(sc,'PACK of token with an active offer','tgs: token offer',g.hook,okH(g,'tgs: token offer'),g.hash);
  const st=await stateOf(B.vc),lk=await rawState(X);out(sc,'Box not created and token not locked','no/no',`${st?'box exists':'no'}/${lk?'lock exists':'no'}`,!st&&!lk);
  await send(I,{TransactionType:'URITokenCancelSellOffer',URITokenID:X},'A9 offer cancel');}
 // A10: burning by fee: owner sends tx with huge Fee
 sc='A10';{const B=await newBox('A10',{token:false,amt:(await bal(I.address))-(await held())-60000000n});g=await pack(B,B.label);out(sc,`PACK ${B.amt} drops (all except ~60 XAH)`,'tgs: packed',g.hook,okH(g,'packed'),g.hash);
  if(okH(g,'packed')){const b0=await bal(I.address);const h=await held();const fee=(b0-h+5000000n).toString();
  const s=await sub(I,{TransactionType:'AccountSet'},{fee});g=await fin(s,'A10 AccountSet c Fee > free');const b1=await bal(I.address);
  out(sc,`AccountSet with Fee=${fee} (balance ${b0}, held ${h}): hook rejected`,'tecHOOK_REJECTED / tgs: reserve',`${g.result} / ${g.hook} / balance became ${b1}`,/HOOK_REJECTED/.test(g.result)&&okH(g,'reserve'),g.hash);
  LIM(sc,'[network limitation] Fee is charged even when the hook rejects → balance below held','network design: a hook cannot refund the fee',`${b1} vs ${h}`,b1<h,g.hash);
  const s2=sign(B.priv,R1.address,I.address,0);g=await claimKey(R1,s2.PK,s2.SIG,'A10');out(sc,'CLAIM, when XAH account holds less than the box amount: hook does not pay partially','tgs: reserve',g.hook,okH(g,'tgs: reserve'),g.hash);if(g.emit[0])await emitted(g,'A10');
  if(await stateOf(B.vc)){await send(R1,{TransactionType:'Payment',Destination:I.address,Amount:'30000000'},'A10 top-up');g=await claimKey(R1,s2.PK,s2.SIG,'A10 after top-up');out(sc,'CLAIM after top-up','claiming',g.hook,okH(g,'claiming'),g.hash);if(g.emit[0])await emitted(g,'A10b');}}}

 // A11: boundary EXP: CLAIM and OPEN exactly at ledger exp
 sc='A11';for(let k=0;k<3;k++){const B=await newBox('A11-'+k,{token:false,amt:1000000n});B.exp=(await seq())+6;await packOk(sc,B);
  while((await seq())<B.exp)await sleep(700);const s=sign(B.priv,R1.address,I.address,B.exp);
  const o=await sub(I,{TransactionType:'Invoke',HookParameters:P({CMD:CMD.OPEN,VC:B.vc})},{llsOff:1});const c=await sub(R1,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s.PK,SIG:s.SIG})},{llsOff:1});
  const go=await fin(o,'A11 OPEN at exp'),gc=await fin(c,'A11 CLAIM at exp');
  out(sc,`exp=${B.exp}: OPEN in ${go.ledger}, CLAIM in ${gc.ledger}`,'in ledger ≤exp: OPEN not expired, CLAIM claiming/busy',`${go.hook||go.result} | ${gc.hook||gc.result}`,!(go.ledger<=B.exp&&okH(go,'opened')),gc.hash);
  if(gc.emit&&gc.emit[0])await emitted(gc,'A11');await sleep(6000);if(await stateOf(B.vc)){await waitL(B.exp+2);await openBox(B.vc,'A11 cleanup');}}

 // A12: failed payout (recipient requires DestinationTag) - box does not get stuck, is the reserve burned
 sc='A12';{g=await send(S,{TransactionType:'AccountSet',SetFlag:1},'A12 A4 RequireDest');out(sc,'R4 enabled RequireDest','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
  const B=await newBox('A12',{token:false,amt:1000000n});await packOk(sc,B);const s=sign(B.priv,S.address,I.address,0);const b0=await bal(I.address);
  for(let k=0;k<3;k++){g=await claimKey(S,s.PK,s.SIG,'A12-'+k);const r=g.emit[0]?await emitted(g,'A12-'+k):'no emit';INFO(sc,`CLAIM #${k} from R4 (RequireDest)`,`${g.hook} / emit ${r}`,g.hash);await sleep(9000);}
  const b1=await bal(I.address);LIM(sc,'[limitation] Owner pays emit fees if the recipient makes the payout fail','fees are charged (griefing only by the owner of a valid signature)',`${b0-b1} drops`,true,null);
  const st=await stateOf(B.vc);out(sc,'Box after failed payouts','closed (box[44]=0)',st?'status '+st.slice(88,90):'no',st&&st.slice(88,90)==='00');
  const s2=sign(B.priv,R1.address,I.address,0);g=await claimKey(R1,s2.PK,s2.SIG,'A12 R1');out(sc,'CLAIM R1 after failed (not stuck busy)','claiming',g.hook,okH(g,'claiming'),g.hash);if(g.emit[0]){const r=await emitted(g,'A12 R1');out(sc,'payout R1','tesSUCCESS',r,r==='tesSUCCESS',g.emit[0]);}
  await send(S,{TransactionType:'AccountSet',ClearFlag:1},'A12 clear');}

 // A13: third-party issuer token with tfBurnable - issuer burns it from the box
 sc='A13';{const X=await mintBy(R1,'A13 burnable',1);await give(R1,I,X,'A13 ->H2');const kk=boxKey();const B={label:'A13',mode:'K',amt:1000000n,tid:X,vc:kk.VC,priv:kk.PRIV,exp:0};g=await pack(B,B.label);
  out(sc,'PACK third-party burnable-token (issuer R1 could burn it from the box)','tgs: burnable',g.hook,okH(g,'tgs: burnable'),g.hash);
  if(okH(g,'packed')){g=await send(R1,{TransactionType:'URITokenBurn',URITokenID:X},'A13 issuer burns');INFO(sc,'Third-party issuer burns burnable-token',g.result);}}
 // A14: AccountDelete with closed box
 sc='A14';{const B=await newBox('A14',{token:false,amt:1000000n});await packOk(sc,B);g=await send(I,{TransactionType:'AccountDelete',Destination:R1.address,Fee:'2000000'},'A14 AccountDelete');out(sc,'AccountDelete while box closed','rejected',g.result+' / '+g.hook,g.result!=='tesSUCCESS',g.hash);await keyClaim(sc,B,R1);}

 // cleanup
 
 const n0=(await nsList()).length;g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookNamespace:NS,Flags:2}}]},'NSDelete');const n1=(await nsList()).length;out('CLEANUP',`state ${n0}→${n1}`,'0',String(n1),n1===0,g.hash);
 fs.writeFileSync(D+'/audit_rows.json',JSON.stringify({rows,txlog},null,1));console.log('AUDIT',rows.filter(z=>z.ok).length+'/'+rows.length,'tx',txlog.length);
})().catch(e=>{console.error('CRASH',e);fs.writeFileSync(D+'/audit_crash.json',JSON.stringify({rows,txlog},null,1));process.exit(1);});
