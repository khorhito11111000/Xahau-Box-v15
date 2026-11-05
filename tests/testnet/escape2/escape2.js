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

(async()=>{await ensureHook();const sc='ESC2';let g;
 const ns=async()=>((await rpc('account_namespace',{account:I.address,namespace_id:NS,ledger_index:'validated'})).namespace_entries||[]).length;
 // 1) Owner hole: delete the hook (Flags 1, state remains), take the token of a closed box Y
 const Y=await newBox('Box Y2 (key, token+1 XAH)',{amt:1000000n});await packOk('OWNER',Y);
 g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{CreateCode:'',Flags:1}}]},'SetHook delete hook');chk('OWNER','[limitation] Issuer deletes the hook while the box is closed','SetHook does not pass through the hook → deletion possible (trust in issuer)',g,true,!done(g));rows[rows.length-1].lim=true;
 if(done(g)){const t=await remitKey(I,R1,Y.tid,'Y2 without hook');chk('OWNER','[limitation] Remit of closed box token after hook deletion','tesSUCCESS = token left (no protection without the hook)',t,true,!done(t));rows[rows.length-1].lim=true;
  if(done(t))await send(R1,{TransactionType:'Remit',Destination:I.address,URITokenIDs:[Y.tid]},'return Y2');}
 // 2) Cleanup: restore hook by HookHash and delete namespace state
 g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookHash:HOOKHASH,HookNamespace:NS,HookOn:HOOKON,Flags:1}}]},'SetHook return');chk('CLEANUP','Hook restored by HookHash (with HookOn)','tesSUCCESS',g,done(g),true);await ensureHook(); /* fixed: previously without HookOn and without a check: on failure, tests went on without the hook */
 const before=await ns();g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookNamespace:NS,Flags:2}}]},'SetHook NSDelete');const after=await ns();
 chk('CLEANUP',`State deletion (hsfNSDelete): entries ${before} → ${after}`,'tesSUCCESS, 0 entries',g,done(g)&&after===0,true);
 // 3) Clean “before/after” test OPEN” for XAH + correct EscrowFinish
 const W2=await newBox('Box W (key, token+100 XAH, EXP)',{amt:100000000n});W2.exp=(await seq())+40;await packOk(sc,W2);
 const big=async()=>(await bal(I.address))-60000000n;
 g=await send(I,{TransactionType:'EscrowCreate',Destination:R1.address,Amount:String(await big()),FinishAfter:now()+5,CancelAfter:now()+900},'EscrowCreate large before OPEN');chk(sc,'EscrowCreate more than free, box closed','rejected tgs: reserve',g,rej(g,'tgs: reserve'),true);
 g=await send(I,{TransactionType:'EscrowCreate',Destination:R1.address,Amount:'1000000',FinishAfter:now()+10,CancelAfter:now()+3600},'EscrowCreate 1 XAH');const es=(await rpc('tx',{transaction:g.hash})).Sequence;chk(sc,'EscrowCreate 1 XAH from free','allowed',g,done(g),true);
 await sleep(20000);g=await send(R1,{TransactionType:'EscrowFinish',Owner:I.address,OfferSequence:es},'EscrowFinish');chk(sc,'EscrowFinish R1: only 1 leaves XAH of escrow','allowed',g,done(g),true);
 while((await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index<=W2.exp+1)await sleep(3000);
 g=await openBox(W2.vc,'W');chk(sc,'OPEN box W after expiry','tgs: opened',g,(g.hook||'').includes('tgs: opened'),true);await emitted(g,'W refund');
 // FinishAfter must be < CancelAfter; using correct values:
 g=await send(I,{TransactionType:'EscrowCreate',Destination:R1.address,Amount:String(await big()),FinishAfter:now()+20,CancelAfter:now()+30},'EscrowCreate large after OPEN');const es2=done(g)?(await rpc('tx',{transaction:g.hash})).Sequence:0;
 chk(sc,'Same large amount in EscrowCreate after OPEN','allowed',g,done(g),true);
 if(es2){await sleep(45000);g=await send(I,{TransactionType:'EscrowCancel',Owner:I.address,OfferSequence:es2},'EscrowCancel');chk(sc,'EscrowCancel: large amount returned','allowed',g,done(g),true);}
 g=await send(I,{TransactionType:'PaymentChannelCreate',Destination:R1.address,Amount:String((await bal(I.address))-60000000n),SettleDelay:5,PublicKey:I.publicKey},'PayChan large after OPEN');chk(sc,'PaymentChannelCreate large after OPEN','allowed',g,done(g),true);
 if(done(g)){const id=g.meta.AffectedNodes.find(n=>n.CreatedNode&&n.CreatedNode.LedgerEntryType==='PayChannel').CreatedNode.LedgerIndex;
  await send(I,{TransactionType:'PaymentChannelClaim',Channel:id,Flags:0x00020000},'PayChan close 1');await sleep(15000);const c=await send(I,{TransactionType:'PaymentChannelClaim',Channel:id,Flags:0x00020000},'PayChan close 2');rows.push({sc,name:'Channel closed, XAH returned',expect:'tesSUCCESS',got:c.result,ok:done(c),hash:c.hash,safe:true});}
 const objs=await rpc('account_objects',{account:I.address,ledger_index:'validated'});const types={};for(const o of objs.account_objects)types[o.LedgerEntryType]=(types[o.LedgerEntryType]||0)+1;
 const fin={hookStateEntries:await ns(),objects:types,balance:String(await bal(I.address))};
 const prev={rows:[]};const pt=[];
 prev.rows=[...prev.rows,...rows];prev.escape2={...fin,finished:new Date().toISOString()};prev.totalTx=pt.length+txlog.length;prev.pass=prev.rows.filter(r=>r.ok).length;prev.fail=prev.rows.filter(r=>!r.ok).length;
 fs.writeFileSync(D+'/results.json',JSON.stringify(prev,null,1));fs.writeFileSync(D+'/txlog.json',JSON.stringify([...pt,...txlog],null,1));
 console.log('ESC2 TOTAL',rows.filter(r=>r.ok).length+'/'+rows.length,'tx',txlog.length,JSON.stringify(fin));})().catch(e=>{console.error('CRASH',e);fs.writeFileSync(D+'/escape2_crash.json',JSON.stringify({rows,txlog},null,1));process.exit(1);});
