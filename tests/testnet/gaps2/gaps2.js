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
try{const c=JSON.parse(fs.readFileSync(D+'/gaps2_crash.json'));txlog.push(...c.txlog.map(t=>({...t,label:t.label+' (interrupted run 1)'})));}catch(e){}
const stateOf=async vc=>{const L=await nsList();const b=bkeyOf(vc);let e=L.find(z=>z.HookStateKey===b);if(!e)e=L.find(z=>z.HookStateKey===vc);return e?e.HookStateData:null;}; // v14: box entry is stored under key sha512h(0x42||VC) - look for it first
async function raw(w,tx,label,{llsOff=20,fee}={}){const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
 const t={Account:w.address,NetworkID:NET,...tx,Sequence:ai.account_data.Sequence,LastLedgerSequence:cur+llsOff,Fee:fee||'5000',SigningPubKey:w.publicKey};
 t.TxnSignature=kp.sign(x.encodeForSigning(t),w.privateKey);const blob=x.encode(t);const hash=x.hashes.hashSignedTx(blob);const r=await rpc('submit',{tx_blob:blob});
 await sleep(12000);const v=await rpc('tx',{transaction:hash});const inL=!!(v&&v.validated);
 txlog.push({label,type:tx.TransactionType,from:NAME[w.address],hash,result:'submit '+r.engine_result+(inL?' / in ledger':' / NOT in ledger'),hook:''});TX++;
 console.log('RAW',label,r.engine_result,inL,hash);return {hash,result:r.engine_result,inLedger:inL};}
const waitL=async n=>{while((await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index<=n)await sleep(3000);};
const okH=(g,s)=>(g.hook||'').includes(s);
(async()=>{await ensureHook();let g;
 // ---- N2: CLAIM, that did not land in a ledger ----
 let sc='N2';const A=await newBox('Box N2 (key, 1 XAH, EXP)',{token:false,amt:1000000n});A.exp=(await seq())+300;await packOk(sc,A);
 const a0=await stateOf(A.vc);const s=sign(A.priv,R1.address,I.address,A.exp);
 const cl={TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s.PK,SIG:s.SIG})};
 let r=await raw(R1,cl,'N2 CLAIM with expired LastLedgerSequence',{llsOff:-2});rows.push({sc,name:'CLAIM with LastLedgerSequence in the past',expect:'tefMAX_LEDGER, not in ledger',got:r.result+(r.inLedger?' / in ledger':' / not in ledger'),ok:r.result==='tefMAX_LEDGER'&&!r.inLedger,hash:r.hash});
 r=await raw(R1,cl,'N2 CLAIM with Fee=1 drop',{fee:'1'});rows.push({sc,name:'CLAIM with 1 drop fee',expect:'telINSUF_FEE_P, not in ledger',got:r.result+(r.inLedger?' / in ledger':' / not in ledger'),ok:/^tel|^tef|^tem/.test(r.result)&&!r.inLedger,hash:r.hash});
 const a1=await stateOf(A.vc);rows.push({sc,name:'Box entry unchanged',expect:'byte for byte as after PACK',got:a1===a0?'matches':'CHANGED',ok:a1===a0});
 const b1=await bal(R1.address);g=await claimKey(R1,s.PK,s.SIG,'N2 normal CLAIM');rec(sc,'Same CLAIM with normal LLS/Fee','tgs: claiming',g.hook,okH(g,'tgs: claiming'),g.hash);await delivered(sc,A,R1,g,b1);
 // ---- N1: OPEN ----
 sc='N1';const B=await newBox('Box N1 (key, 1 XAH, EXP)',{token:false,amt:1000000n});B.exp=(await seq())+6;await packOk(sc,B);
 g=await openBox(B.vc,'N1 before expiry');rec(sc,'OPEN before EXP','tgs: not expired',g.hook,okH(g,'tgs: not expired'),g.hash);
 await waitL(B.exp+1);const b0=await stateOf(B.vc);
 const op={TransactionType:'Invoke',HookParameters:P({CMD:CMD.OPEN,VC:B.vc})};
 r=await raw(I,op,'N1 OPEN with expired LLS',{llsOff:-2});rows.push({sc,name:'OPEN after EXP, LastLedgerSequence in the past',expect:'tefMAX_LEDGER, not in ledger',got:r.result+(r.inLedger?' / in ledger':' / not in ledger'),ok:r.result==='tefMAX_LEDGER'&&!r.inLedger,hash:r.hash});
 r=await raw(I,op,'N1 OPEN with Fee=1 drop',{fee:'1'});rows.push({sc,name:'OPEN with 1 drop fee',expect:'tel*, not in ledger',got:r.result+(r.inLedger?' / in ledger':' / not in ledger'),ok:!r.inLedger,hash:r.hash});
 g=await send(R1,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.OPEN,VC:B.vc})},'N1 OPEN foreign');rec(sc,'OPEN not by owner (R1) after EXP','tgs: owner',g.hook||g.result,okH(g,'tgs: owner'),g.hash);
 const s2=sign(B.priv,R2.address,I.address,B.exp);g=await claimKey(R2,s2.PK,s2.SIG,'N1 CLAIM after EXP');rec(sc,'CLAIM after EXP','tgs: expired',g.hook,okH(g,'tgs: expired'),g.hash);
 const b2=await stateOf(B.vc);rows.push({sc,name:'Box closed after failures',expect:'entry unchanged',got:b2===b0?'matches':'CHANGED',ok:b2===b0&&!!b2});
 g=await openBox(B.vc,'N1 repeated OPEN');rec(sc,'Repeated OPEN by owner','tgs: opened',g.hook,okH(g,'tgs: opened'),g.hash);
 rows.push({sc,name:'OPEN without emit (assets are already on the account)',expect:'0 emits',got:String(g.emit.length),ok:g.emit.length===0});
 rows.push({sc,name:'Box entry erased',expect:'no',got:(await stateOf(B.vc))?'exists':'no',ok:!(await stateOf(B.vc))});
 g=await openBox(B.vc,'N1 third OPEN');rec(sc,'Third OPEN','tgs: unknown',g.hook,okH(g,'tgs: unknown'),g.hash);
 // ---- N3: EXP=00000000 vs without EXP ----
 sc='N3';const pk0=b=>({CMD:CMD.PACK,VC:b.vc,TID:'0'.repeat(64),AMT:u64(b.amt),EXP:'00000000'});
 const C=await newBox('Box N3a (EXP=00000000)',{token:false,amt:1000000n});
 g=await send(I,{TransactionType:'Invoke',HookParameters:P(pk0(C))},'PACK N3a EXP=00000000');rec(sc,'PACK with EXP=00000000','?',g.hook,okH(g,'tgs: packed'),g.hash);
 const cs=await stateOf(C.vc);rows.push({sc,name:'Bytes EXP in entry (box[40..43])',expect:'00000000',got:cs?cs.slice(80,88):'no entry',ok:!!cs&&cs.slice(80,88)==='00000000'});
 g=await openBox(C.vc,'N3a OPEN immediately');rec(sc,'OPEN by owner immediately (EXP=00000000 = no expiry)','tgs: not expired',g.hook,okH(g,'tgs: not expired'),g.hash);
 const C2=await newBox('Box N3b (EXP=00000000)',{token:false,amt:1000000n});
 g=await send(I,{TransactionType:'Invoke',HookParameters:P(pk0(C2))},'PACK N3b EXP=00000000');rec(sc,'PACK №2 with EXP=00000000','tgs: packed',g.hook,okH(g,'tgs: packed'),g.hash);
 const s3=sign(C2.priv,R2.address,I.address,0);const bb=await bal(R2.address);g=await claimKey(R2,s3.PK,s3.SIG,'N3b CLAIM');rec(sc,'CLAIM R2 (signature with exp=0)','tgs: claiming',g.hook,okH(g,'tgs: claiming'),g.hash);await delivered(sc,C2,R2,g,bb);
 const E=await newBox('Box N3c (EXP not set)',{token:false,amt:1000000n});await packOk(sc,E);
 const es=await stateOf(E.vc);rows.push({sc,name:'Bytes EXP in entry, EXP not set',expect:'00000000',got:es?es.slice(80,88):'no',ok:!!es&&es.slice(80,88)==='00000000'});
 g=await openBox(E.vc,'N3c OPEN immediately');rec(sc,'OPEN by owner immediately (EXP not set)','tgs: not expired',g.hook,okH(g,'tgs: not expired'),g.hash);
 // cleanup
 for(const bx of [C,E])if(await stateOf(bx.vc)){await keyClaim('N3-cleanup',bx,R1);} /* boxes without expiry OPEN cannot open, taking back CLAIM-er */
 const n0=(await nsList()).length;g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookNamespace:NS,Flags:2}}]},'SetHook NSDelete');const n1=(await nsList()).length;
 rec('CLEANUP',`Hook state cleared (${n0} → ${n1})`,'0',String(n1),n1===0,g.hash);
 const pt=[];fs.writeFileSync(D+'/txlog.json',JSON.stringify([...pt,...txlog],null,1));fs.writeFileSync(D+'/gaps2_rows.json',JSON.stringify({rows,txlog},null,1));
 const R={rows:[]};R.rows=[...R.rows,...rows];R.totalTx=pt.length+txlog.length;R.pass=R.rows.filter(z=>z.ok).length;R.fail=R.rows.filter(z=>!z.ok).length;R.gaps2={finished:new Date().toISOString()};fs.writeFileSync(D+'/results.json',JSON.stringify(R,null,1));
 console.log('GAPS2',rows.filter(z=>z.ok).length+'/'+rows.length,'tx',txlog.length);})().catch(e=>{console.error('CRASH',e);fs.writeFileSync(D+'/gaps2_crash.json',JSON.stringify({rows,txlog},null,1));process.exit(1);});
