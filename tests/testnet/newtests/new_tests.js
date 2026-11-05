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
async function waitTx(hash,lls){for(let i=0;i<60;i++){const t=await rpc('tx',{transaction:hash});if(t&&t.validated)return t;if(lls){const c=await rpc('ledger_current');if(c.ledger_current_index>lls+1&&i>5)return t;}await sleep(1500);}return null;}
async function send(w,tx,label){tx={Account:w.address,NetworkID:NET,...tx};let last=null;
 for(let attempt=0;attempt<4;attempt++){
 const ai=await rpc('account_info',{account:tx.Account,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
 const t={...tx,Sequence:ai.account_data.Sequence,LastLedgerSequence:cur+20,Fee:'0',SigningPubKey:''};if(t.Fee===undefined)delete t.Fee;
 const f=await rpc('fee',{tx_blob:x.encode({...t,Fee:'0'})});const base=BigInt(f.drops.base_fee);t.Fee=tx.Fee&&tx.Fee!=='0'?tx.Fee:String(base*3n/2n+20n);delete t.SigningPubKey;
 let signed;try{signed=w.sign(t);}catch(e){const u={...t,SigningPubKey:w.publicKey};u.TxnSignature=kp.sign(x.encodeForSigning(u),w.privateKey);const blob=x.encode(u);signed={tx_blob:blob,hash:x.hashes.hashSignedTx(blob)};}const r=await rpc('submit',{tx_blob:signed.tx_blob});TX++;
 if(r.engine_result==='tefPAST_SEQ'||r.engine_result==='terPRE_SEQ'||r.engine_result==='telCAN_NOT_QUEUE'){await sleep(4000);continue;}
 if(/^tef|^tem|^tel/.test(r.engine_result)){txlog.push({label,type:tx.TransactionType,from:NAME[w.address],hash:signed.hash,result:r.engine_result,hook:'',inLedger:false});return {hash:signed.hash,result:r.engine_result,hook:'',emit:[]};}
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
const stateOf=async vc=>{const L=await nsList();const b=bkeyOf(vc);let e=L.find(z=>z.HookStateKey===b);if(!e)e=L.find(z=>z.HookStateKey===vc);return e?e.HookStateData:null;}; // v14: box entry is stored under key sha512h(0x42||VC) - look for it first
async function raw(w,tx,label,{llsOff=20,fee}={}){const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
 const t={Account:w.address,NetworkID:NET,...tx,Sequence:ai.account_data.Sequence,LastLedgerSequence:cur+llsOff,Fee:fee||'5000',SigningPubKey:w.publicKey};
 t.TxnSignature=kp.sign(x.encodeForSigning(t),w.privateKey);const blob=x.encode(t);const hash=x.hashes.hashSignedTx(blob);const r=await rpc('submit',{tx_blob:blob});
 await sleep(12000);const v=await rpc('tx',{transaction:hash});const inL=!!(v&&v.validated);
 txlog.push({label,type:tx.TransactionType,from:NAME[w.address],hash,result:'submit '+r.engine_result+(inL?' / in ledger':' / NOT in ledger'),hook:''});TX++;
 console.log('RAW',label,r.engine_result,inL,hash);return {hash,result:r.engine_result,inLedger:inL};}
const waitL=async n=>{while((await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index<=n)await sleep(3000);};
const okH=(g,s)=>(g.hook||'').includes(s);
const out=(sc,name,expect,got,ok,hash)=>{rows.push({sc,name,expect,got,ok,hash});console.log(ok?'PASS':'FAIL',sc,name,'|',got,hash||'');};
const mintBy=async(w,label,flags)=>{const u=H(`tgsv14:${label}:${Date.now()}:${nonce++}`);const g=await send(w,{TransactionType:'URITokenMint',URI:u,...(flags?{Flags:flags}:{})},'mint '+label);if(g.result!=='tesSUCCESS')throw Error('mint '+g.result);return tokId(w.address,u);};
const give=async(from,to,id,l)=>{await send(from,{TransactionType:'URITokenCreateSellOffer',URITokenID:id,Amount:'0',Destination:to.address},'offer '+l);return send(to,{TransactionType:'URITokenBuy',URITokenID:id,Amount:'0'},'buy '+l);};
const E=(sc,name,want,g)=>out(sc,name,want,g.hook||g.result,(g.hook||'').includes(want),g.hash);
const SC=require('/workspace/v14_tools/sign_claim.js');
(async()=>{let g,sc;
 g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookHash:HOOKHASH,HookNamespace:NS,HookOn:HOOKON,Flags:1}}]},'SetHook v14');out('0','Hook v14 on account','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
 // N1 offer before PACK
 sc='N1';{const t=await mint('N1');g=await send(I,{TransactionType:'URITokenCreateSellOffer',URITokenID:t,Amount:'1000000'},'offer without Destination');
  g=await pack({vc:boxKey().VC,tid:t,amt:1000000n},'N1');E(sc,'PACK of token with an active offer (without Destination)','tgs: token offer',g);
  const t2=await mint('N1b');await send(I,{TransactionType:'URITokenCreateSellOffer',URITokenID:t2,Amount:'0',Destination:R1.address},'offer R1');
  g=await pack({vc:boxKey().VC,tid:t2,amt:0n},'N1b');E(sc,'PACK of token with offer to a second account','tgs: token offer',g);
  g=await send(I,{TransactionType:'URITokenCancelSellOffer',URITokenID:t2},'offer cancel');out(sc,'Offer cancel','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
  const B={label:'N1c',tid:t2,amt:1000000n,...(k=>({vc:k.VC,priv:k.PRIV}))(boxKey()),exp:0};await packOk(sc,B);
  g=await send(R1,{TransactionType:'URITokenBuy',URITokenID:t2,Amount:'0'},'buying a locked token R1');out(sc,'URITokenBuy of locked token (offer gone already)','not tesSUCCESS',`${g.result} / ${g.hook}`,g.result!=='tesSUCCESS',g.hash);
  g=await send(I,{TransactionType:'URITokenCreateSellOffer',URITokenID:t2,Amount:'0',Destination:R1.address},'offer on locked');E(sc,'New offer on a locked token','tgs: locked',g);
  await keyClaim(sc,B,R1);
  g=await send(I,{TransactionType:'URITokenCreateSellOffer',URITokenID:t,Amount:'0'},'no');// t already with offer: buying an unlocked token must pass
  g=await send(R2,{TransactionType:'URITokenBuy',URITokenID:t,Amount:'1000000'},'buying unlocked');out(sc,'Buying an UNlocked token (hook lets it pass)','tesSUCCESS',`${g.result} / ${g.hook}`,g.result==='tesSUCCESS',g.hash);}
 // N2 OPEN no expiry
 sc='N2';{const B=await newBox('N2a',{token:false,amt:1000000n});await packOk(sc,B);E(sc,'OPEN box without EXP','tgs: not expired',await openBox(B.vc,'N2a'));
  const C=await newBox('N2b',{token:false,amt:1000000n});g=await send(I,{TransactionType:'Invoke',HookParameters:P({...packParams(C),EXP:'00000000'})},'PACK EXP=0');E(sc,'PACK with EXP=00000000','tgs: packed',g);
  E(sc,'OPEN box with EXP=00000000','tgs: not expired',await openBox(C.vc,'N2b'));
  g=await send(I,{TransactionType:'Invoke',HookParameters:P({...packParams(await newBox('N2x',{token:false,amt:1000000n})),EXP:'0000'})},'PACK EXP=0000');E(sc,'PACK with EXP=0000 (2 bytes)','tgs: exp',g);
  const s0=await seq();const D2=await newBox('N2c',{token:false,amt:1000000n,exp:s0+12});await packOk(sc,D2);E(sc,'OPEN before expiry','tgs: not expired',await openBox(D2.vc,'N2c'));
  await waitL(D2.exp+1);E(sc,'OPEN after expiry','tgs: opened',await openBox(D2.vc,'N2c'));
  await keyClaim(sc,B,R1);await keyClaim(sc,C,R2);}
 // N3 key collisions
 sc='N3';{const t=await mint('N3');const B={label:'N3a',amt:1000000n,vc:t,exp:0,mode:'T',ktid:await mint('N3key')};g=await pack(B,'N3a VC=TID');E(sc,'PACK of token box with VC = ID token','tgs: packed',g);
  const C={label:'N3b',tid:t,amt:1000000n,...(k=>({vc:k.VC,priv:k.PRIV}))(boxKey()),exp:0};await packOk(sc,C);
  await give(I,R1,B.ktid,'key N3a R1');await tokClaim(sc,B,R1);await keyClaim(sc,C,R2);
  for(const v of ['55','66','11','33','44']){const D={label:'N3-'+v,amt:1000000n,vc:v.repeat(32),exp:0,mode:'T',ktid:await mint('N3k'+v)};g=await pack(D,'VC='+v);E(sc,`PACK with VC=${v}…${v}`,'tgs: packed',g);
   if(v==='55'){g=await send(I,{TransactionType:'OfferCreate',TakerGets:'1000000',TakerPays:{currency:'USD',issuer:R4address(),value:'1'}},'XAH-offer');out(sc,'XAH-owner offer after PACK VC=55…','tesSUCCESS',`${g.result} / ${g.hook}`,g.result==='tesSUCCESS',g.hash);}
   await give(I,R3,D.ktid,'key '+v);await tokClaim(sc,D,R3);}}
 // N4 burnable tokens
 sc='N4';{const t=await mintBy(R1,'N4burn',1);await give(R1,I,t,'burnable I');g=await pack({vc:boxKey().VC,tid:t,amt:0n},'N4');E(sc,'PACK of burnable token (issuer R1)','tgs: burnable',g);
  const t2=await mintBy(I,'N4own',1);g=await pack({vc:boxKey().VC,tid:t2,amt:0n},'N4b');E(sc,'PACK of own burnable token','tgs: burnable',g);
  const kt=await mintBy(I,'N4key',1);g=await pack({vc:rndv(),mode:'T',ktid:kt,amt:1000000n},'N4c');E(sc,'PACK of token mode with burnable KTID','tgs: burnable',g);
  const t3=await mintBy(R1,'N4ok');await give(R1,I,t3,'non-burnable I');const B={label:'N4d',tid:t3,amt:0n,...(k=>({vc:k.VC,priv:k.PRIV}))(boxKey()),exp:0};await packOk(sc,B);
  g=await send(R1,{TransactionType:'URITokenBurn',URITokenID:t3},'issuer burns');out(sc,'Issuer tries to burn a non-burnable token from a box','not tesSUCCESS',g.result,g.result!=='tesSUCCESS',g.hash);await keyClaim(sc,B,R2);}
 // N5 KTID
 sc='N5';{const ar=sha512h(Buffer.concat([Buffer.from('0061','hex'),Buffer.from(x.decodeAccountID(I.address))])).toString('hex').toUpperCase();
  g=await pack({vc:rndv(),mode:'T',ktid:ar,amt:1000000n},'N5a');E(sc,'KTID = AccountRoot','tgs: ktid',g);
  g=await pack({vc:rndv(),mode:'T',ktid:rndv(),amt:1000000n},'N5b');E(sc,'KTID nonexistent','tgs: ktid',g);
  const B=await newBox('N5c',{mode:'T',token:false,amt:1000000n});await packOk(sc,B);E(sc,'OPEN of token box without EXP, KTID alive','tgs: not expired',await openBox(B.vc,'N5c'));
  await give(I,R1,B.ktid,'key N5c R1');g=await send(R1,{TransactionType:'URITokenBurn',URITokenID:B.ktid},'holder burns key');out(sc,'Holder burned the key token','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
  E(sc,'CLAIM after key burn','tgs: not holder',await claimTok(R1,B.vc,'N5c')); /* fixed: util_keylet(KEYLET_UNCHECKED) always gives 34 bytes, and slot_set of nonexistent object <0 → in code line 330: “tgs: not holder” */
  E(sc,'OPEN by owner, key no longer exists','tgs: opened',await openBox(B.vc,'N5c'));}
 // N6 signature
 sc='N6';{const k=boxKey();const B={label:'N6a',amt:1000000n,vc:k.VC,priv:k.PRIV,exp:0};await packOk(sc,B);const old=sign(k.PRIV,R1.address,I.address,0);
  const bd=boxData(k.VC,I.address);out(sc,'Pack counter in box entry','!=00000000',bd.nonce,bd.nonce!=='00000000');
  g=await claimKey(R1,old.PK,old.SIG,'N6a');E(sc,'CLAIM box 1','tgs: claiming',g);await emitted(g,'N6a');await sleep(8000);
  const B2={...B,label:'N6b'};await packOk(sc,B2);const bd2=boxData(k.VC,I.address);out(sc,'Counter increased on repack',`> ${bd.nonce}`,bd2.nonce,parseInt(bd2.nonce,16)>parseInt(bd.nonce,16));
  E(sc,'CLAIM of new box with OLD signature','tgs: bad sig',await claimKey(R1,old.PK,old.SIG,'N6b old'));
  const wrongAmt=SC.message({claimer:R1.address,vc:k.VC,hook:I.address,net:NET,exp:0,tid:bd2.tid,amt:u64(2000000n),nonce:bd2.nonce});
  E(sc,'Signature with wrong AMT','tgs: bad sig',await claimKey(R1,old.PK,kp.sign(sha512h(wrongAmt).toString('hex'),k.PRIV).toUpperCase(),'N6 bad amt'));
  const r=JSON.parse(require('child_process').execFileSync('node',['/workspace/v14_tools/sign_claim.js','--priv',k.PRIV,'--claimer',R1.address,'--hook',I.address,'--json']).toString());
  const before=await bal(R1.address);g=await claimKey(R1,r.PK,r.SIG,'N6b tool');E(sc,'CLAIM by signature from v14_tools/sign_claim.js','tgs: claiming',g);await delivered(sc,B2,R1,g,before);
  const k3=boxKey();const B3={label:'N6c',amt:1000000n,vc:k3.VC,priv:k3.PRIV,exp:0};await packOk(sc,B3);const sR1=sign(k3.PRIV,R1.address,I.address,0);
  E(sc,'Signature for R1 presents R2','tgs: bad sig',await claimKey(R2,sR1.PK,sR1.SIG,'N6c R2'));await keyClaim(sc,B3,R1);}
 // N7 fee griefing (documentation): AccountSet with a large fee at held>0
 sc='N7';{const B=await newBox('N7',{token:false,amt:2000000n});await packOk(sc,B);const b0=await bal(I.address);
  g=await raw(I,{TransactionType:'AccountSet'},'AccountSet Fee 3 XAH',{fee:'3000000'});const v=await rpc('tx',{transaction:g.hash});const b1=await bal(I.address);
  out(sc,'Hook cannot undo the fee charge (known network limitation)',`charged 3 XAH`,`${v&&v.meta?v.meta.TransactionResult:'?'} / ${hookRet(v&&v.meta)} / Δ=${b0-b1}`,b0-b1===3000000n,g.hash);await keyClaim(sc,B,R1);}
 // cleanup
 g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookNamespace:NS,Flags:2}}]},'NSDelete');out('CLEANUP','NSDelete','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
 fs.writeFileSync(D+'/new_rows.json',JSON.stringify({rows,txlog},null,1));console.log('NEW',rows.filter(z=>z.ok).length+'/'+rows.length);
})().catch(e=>{console.error('CRASH',e);fs.writeFileSync(D+'/new_rows.json',JSON.stringify({rows,txlog,crash:String(e)},null,1));process.exit(1);});
function rndv(){return crypto.randomBytes(32).toString('hex').toUpperCase();}
function R4address(){return S.address;}
