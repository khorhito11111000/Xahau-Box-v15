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
(async()=>{const out={started:new Date().toISOString(),network:'Xahau Testnet 21338',hookHash:HOOKHASH,accounts:W.map(w=>({role:NAME[w.address],address:w.address}))};
 const startBal={};for(const w of W)startBal[NAME[w.address]]=String(await bal(w.address));out.startBalances=startBal;
 // 0. Install by HookHash, then HookOn separate SetHook
 let g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookHash:HOOKHASH,HookNamespace:NS,Flags:1}}]},'SetHook by HookHash');
 rec('0','Hook install by HookHash (without wasm)','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
 g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookOn:HOOKON,HookNamespace:NS}}]},'SetHook HookOn');
 rec('0','Separate SetHook: HookOn','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
 const ho=await rpc('account_objects',{account:I.address,type:'hook',ledger_index:'validated'});const hk=ho.account_objects[0].Hooks[0].Hook;
 rec('0','Hook on account: HookHash matched','HookHash '+HOOKHASH.slice(0,8),`${hk.HookHash.slice(0,8)} HookOn ${hk.HookOn||'(default from definition)'}`,hk.HookHash===HOOKHASH,null);
 // 1. AUDIT: 10 mints, PACK without audit
 const pre=[];for(let i=0;i<10;i++)pre.push(await mint('audit'+i));
 const b1={label:'Box 1 (key, XAH+token)',mode:'K',amt:3000000n,tid:pre[0],...(()=>{const k=boxKey();return {vc:k.VC,priv:k.PRIV};})(),exp:0};
 await expectHook('1','After 10 mints PACK without AUDIT','tgs: audit',send(I,{TransactionType:'Invoke',HookParameters:P(packParams(b1))},'PACK without AUDIT'));
 const a=await audit();rec('1','AUDIT','tgs: audit ok/done',a.hook,a.result==='tesSUCCESS',a.hash);
 await packOk('1',b1);
 // 2-8 key mode
 const b2={label:'Box 2 (key, token only)',mode:'K',amt:0n,tid:pre[1],...(()=>{const k=boxKey();return {vc:k.VC,priv:k.PRIV};})(),exp:0};await packOk('3',b2);
 const b3=await newBox('Box 3 (key, only XAH)',{token:false,amt:2000000n});await packOk('4',b3);
 const k5=boxKey();await expectHook('5','Repeated PACK with box 2 token in use','tgs: locked',send(I,{TransactionType:'Invoke',HookParameters:P(packParams({...b2,vc:k5.VC}))},'PACK locked'));
 await expectHook('6','Repeated PACK with the same VC box 3','tgs: exists',send(I,{TransactionType:'Invoke',HookParameters:P(packParams(b3))},'PACK exists'));
 // 7 bad sig: R1 sends a signature made for R2
 {const s=sign(b2.priv,R2.address,I.address,0);await expectHook('7','CLAIM box 2 from R1 with signature for R2','tgs: bad sig',claimKey(R1,s.PK,s.SIG,'bad sig'));}
 // 14,15,18,19,20,23 while boxes are locked
 await expectHook('14','Issuer steals a locked token Remit-er','tgs: locked',remitKey(I,R1,b1.tid,'theft'));
 await expectHook('23','Sell offer on locked token','tgs: locked',send(I,{TransactionType:'URITokenCreateSellOffer',URITokenID:b1.tid,Amount:'1000000'},'sell locked'));
 {const g=await send(I,{TransactionType:'Payment',Destination:R1.address,Amount:'1000000'},'Payment free');rec('15a','Payment 1 XAH from free','tesSUCCESS',g.result+' / '+g.hook,g.result==='tesSUCCESS',g.hash);}
 {const bl=await bal(I.address);const g=await send(I,{TransactionType:'Payment',Destination:R1.address,Amount:String(bl-3000000n)},'Payment above free');rec('15b','Payment of almost the whole balance (using locked XAH)','tgs: reserve',g.hook,g.hook.includes('tgs: reserve'),g.hash);}
 {const bl=await bal(I.address);const bx=await newBox('Boundary box',{token:false,amt:bl-2000000n});const g=await pack(bx,'not enough');rec('18','PACK for more than available','tgs: not enough',g.hook,g.hook.includes('tgs: not enough'),g.hash);}
 await expectHook('19','OfferCreate on XAH','tgs: offer',send(I,{TransactionType:'OfferCreate',TakerGets:String((await bal(I.address))-1000000n),TakerPays:{currency:'USD',issuer:R1.address,value:'1'}},'OfferCreate'));
 await expectHook('20','CheckCreate on XAH','tgs: check',send(I,{TransactionType:'CheckCreate',Destination:R1.address,SendMax:String((await bal(I.address))-1000000n)},'CheckCreate'));
 // opening
 const s1=await keyClaim('2',b1,R1);await keyClaim('3',b2,R2);await keyClaim('4',b3,R3);
 for(const [b,w] of [[b1,R1],[b3,R3]]){const s=sign(b.priv,w.address,I.address,0);await expectHook('8',`Repeated CLAIM: ${b.label}`,'tgs: unknown',claimKey(w,s.PK,s.SIG,'replay'));}
 // 9,13 token mode
 const b4=await newBox('Box 4 (token, token+3 XAH)',{mode:'T',amt:3000000n});await packOk('9',b4);
 await expectHook('13','CLAIM box 4 without key (R4)','tgs: not holder',claimTok(S,b4.vc,'not holder'));
 {const g=await remitKey(I,R1,b4.ktid,'box 4 key');rec('9','Transfer of box 4 key → R1','tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);}await tokClaim('9',b4,R1);
 // 10-12 EXP with real waiting
 const b5=await newBox('Box 5 (key, EXP)',{amt:2000000n});b5.exp=(await seq())+25;await packOk('10',b5);
 await expectHook('10','OPEN box 5 before expiry','tgs: not expired',openBox(b5.vc,'before expiry'));
 console.log('waiting EXP',b5.exp);while((await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index<=b5.exp+1)await sleep(3000);
 {const s=sign(b5.priv,R1.address,I.address,b5.exp);await expectHook('11','CLAIM box 5 after expiry','tgs: expired',claimKey(R1,s.PK,s.SIG,'after expiry'));
  const g=await openBox(b5.vc,'after expiry');rec('12','OPEN box 5 after expiry','tgs: opened',g.hook,g.hook.includes('tgs: opened'),g.hash);const e=await emitted(g,'refund');const o=await owner(b5.tid);rec('12','Box 5 token returned to issuer','issuer',`emit ${e}, owner ${NAME[o]||o}`,o===I.address,g.emit[0]);
  await expectHook('21','Repeated OPEN box 5','tgs: unknown',openBox(b5.vc,'replay'));}
 // 16,17 hand to hand
 const b6=await newBox('Box 6 (token, hand to hand)',{mode:'T'});await packOk('16',b6);
 for(const [f,t] of [[I,R1],[R1,R2]]){const g=await remitKey(f,t,b6.ktid,'key 6');rec('16',`Key of box 6: ${NAME[f.address]} → ${NAME[t.address]}`,'tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);}
 await expectHook('17','Former holder R1 opens box 6','tgs: not holder',claimTok(R1,b6.vc,'former'));await tokClaim('16',b6,R2);
 // 24 key sale
 const b7=await newBox('Box 7 (token, key sale)',{mode:'T'});await packOk('24',b7);
 {let g=await send(I,{TransactionType:'URITokenCreateSellOffer',URITokenID:b7.ktid,Amount:'5000000',Destination:R3.address},'sell key');rec('24','Sell offer key for 5 XAH for R3','tesSUCCESS',g.result+' / '+g.hook,g.result==='tesSUCCESS',g.hash);
  g=await send(R3,{TransactionType:'URITokenBuy',URITokenID:b7.ktid,Amount:'5000000'},'buy key');rec('24','R3 buys key (URITokenBuy)','tesSUCCESS',g.result,g.result==='tesSUCCESS'&&(await owner(b7.ktid))===R3.address,g.hash);}
 await tokClaim('24',b7,R3);
 // 22 several boxes at once (4 key + 4 token), opened in random order
 const multi=[];const RR=[R1,R2,R3];for(let i=0;i<8;i++){const b=await newBox(`Multi ${i+1} (${i%2?'token':'key'})`,{mode:i%2?'T':'K'});b.w=RR[i%3];multi.push(b);}
 for(const b of multi)await packOk('22',b);
 for(const b of [...multi].sort(()=>Math.random()-.5)){if(b.mode==='T'){await remitKey(I,b.w,b.ktid,b.label);await tokClaim('22',b,b.w);}else await keyClaim('22',b,b.w);}
 // QR
 const qr=[];const add=async(v,l,w,o={})=>{let b;if(v==='B'){const code=`TEST-GIFT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;const e=encrypt(code);b=await newBox(l,{uri:e.URI});b.code=code;b.enc=e.KEY;}else b=await newBox(l,{mode:v==='D'?'T':'K',...o});b.v=v;b.w=w;qr.push(b);return b;};
 await add('A','QR-A1 bearer',R1);await add('A','QR-A2 bearer',R2);await add('B','QR-B1 code',R1);await add('B','QR-B2 code',R3);
 await add('C','QR-C1 addressed',R2);await add('C','QR-C2 addressed',R3);await add('D','QR-D1 token',R1);await add('D','QR-D2 token',R2);
 const bx=await add('X','QR-X with expiry',R3);
 for(const b of qr){if(b.v==='X')b.exp=(await seq())+20;await packOk('QR-'+b.v,b);}
 const text=b=>b.v==='A'?QR.make({hook:I.address,box:b.priv}):b.v==='X'?QR.make({hook:I.address,box:b.priv,exp:b.exp}):b.v==='B'?QR.make({hook:I.address,box:b.priv,enc:b.enc,token:b.tid}):b.v==='C'?(s=>makeAddr({v:1,h:I.address,a:b.w.address,p:s.PK,s:s.SIG}))(sign(b.priv,b.w.address,I.address,0)):QR.make({hook:I.address,vc:b.vc});
 for(const b of qr.filter(b=>b.v!=='X')){const sc='QR-'+b.v;const t=text(b);const sn=await scan(t,`${D}/qr_png/${b.label.replace(/\s/g,'_')}.png`);rec(sc,`${b.label}: PNG → jsQR matched`,'matched',sn===t?'matched':'mismatch',sn===t);const q=parseAny(sn);
  if(b.v==='A'||b.v==='B'){const s=sign(q.box,b.w.address,q.hook,q.exp);if(b.v==='A')await expectHook(sc,`${b.label}: intercepted signature from a foreign R4`,'tgs: bad sig',claimKey(S,s.PK,s.SIG,'interception'));
   const before=await bal(b.w.address);const g=await claimKey(b.w,s.PK,s.SIG,b.label);rec(sc,`${b.label}: CLAIM by QR`,'tgs: claiming',g.hook,g.hook.includes('tgs: claiming'),g.hash);await delivered(sc,b,b.w,g,before);
   if(b.v==='B'){const u=await uriOf(q.token);let dec;try{dec=decrypt(u,q.enc);}catch(e){dec='ERR '+e.message;}const raw=Buffer.from(u,'hex').toString().slice(0,14);rec(sc,`${b.label}: code from ledger (${raw}…) decrypted`,b.code,dec,dec===b.code);}
   await expectHook(sc,`${b.label}: rescan`,'tgs: unknown',claimKey(b.w,s.PK,s.SIG,'replay QR'));}
  if(b.v==='C'){rec(sc,`${b.label}: in QR no secret`,'no field b',Object.keys(JSON.parse(Buffer.from(t.slice(5),'base64url'))).join(','),!q.box);await expectHook(sc,`${b.label}: foreign R4 with addressed QR`,'tgs: bad sig',claimKey(S,q.pk,q.sig,'foreign addressed'));
   const before=await bal(b.w.address);const g=await claimKey(b.w,q.pk,q.sig,b.label);rec(sc,`${b.label}: CLAIM addressee`,'tgs: claiming',g.hook,g.hook.includes('tgs: claiming'),g.hash);await delivered(sc,b,b.w,g,before);}
  if(b.v==='D'){await expectHook(sc,`${b.label}: R4 without key by QR`,'tgs: not holder',claimTok(S,q.vc,'QR not holder'));await remitKey(I,b.w,b.ktid,b.label);await tokClaim(sc,b,b.w);
   await expectHook(sc,`${b.label}: replay`,'tgs: unknown',claimTok(b.w,q.vc,'replay D'));}}
 {const sc='QR-X';const t=text(bx);const sn=await scan(t,`${D}/qr_png/QR-X.png`);rec(sc,'QR-X: PNG → jsQR matched','matched',sn===t?'matched':'mismatch',sn===t);const q=parseAny(sn);
  while((await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index<=bx.exp+1)await sleep(3000);
  const s=sign(q.box,bx.w.address,q.hook,q.exp);await expectHook(sc,'QR-X: CLAIM after expiry','tgs: expired',claimKey(bx.w,s.PK,s.SIG,'X after expiry'));
  const g=await openBox(bx.vc,'X');rec(sc,'QR-X: OPEN by issuer after expiry','tgs: opened',g.hook,g.hook.includes('tgs: opened'),g.hash);await emitted(g,'X refund');}
 // result
 const ns=await rpc('account_namespace',{account:I.address,namespace_id:NS,ledger_index:'validated'});out.hookStateLeft=(ns.namespace_entries||[]).length;
 const endBal={};for(const w of W)endBal[NAME[w.address]]=String(await bal(w.address));out.endBalances=endBal;
 out.finished=new Date().toISOString();out.totalTx=txlog.length;out.pass=rows.filter(r=>r.ok).length;out.fail=rows.filter(r=>!r.ok).length;out.rows=rows;
 fs.writeFileSync(D+'/results.json',JSON.stringify(out,null,1));fs.writeFileSync(D+'/txlog.json',JSON.stringify(txlog,null,1));
 console.log(`TOTAL ${out.pass} PASS / ${out.fail} FAIL, tx ${txlog.length}`);})().catch(e=>{console.error('CRASH',e);fs.writeFileSync(D+'/txlog_crash.json',JSON.stringify({txlog,rows},null,1));process.exit(1);});
