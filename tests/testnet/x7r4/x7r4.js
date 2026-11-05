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
// ===== EXTRA: new checks for v14 on the user build =====
const done=g=>g.result==='tesSUCCESS';
const okH=(g,s)=>(g.hook||'').includes(s);
const nsList=async(acc)=>((await rpc('account_namespace',{account:acc||I.address,namespace_id:NS,ledger_index:'validated'})).namespace_entries||[]);
const stateOf=async(vc,acc)=>{const L=await nsList(acc);const e=L.find(z=>z.HookStateKey===bkeyOf(vc));return e?e.HookStateData:null;};
const waitL=async n=>{while((await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index<=n)await sleep(2500);};
const E=(sc,name,want,g)=>{rows.push({sc,name,expect:want,got:`${g.result} / ${g.hook}`,ok:okH(g,want)&&(want.startsWith('tgs: claiming')||want.startsWith('tgs: packed')||want.startsWith('tgs: opened')||want.startsWith('tgs: out')||/HOOK_REJECTED/.test(g.result)),hash:g.hash});console.log(rows[rows.length-1].ok?'PASS':'FAIL',sc,name,'|',g.result,g.hook,g.hash);return g;};
const O=(sc,name,expect,got,ok,hash,extra)=>{rows.push({sc,name,expect,got,ok,hash,...(extra||{})});console.log(ok?'PASS':'FAIL',sc,name,'|',got,hash||'');};
const INFO=(sc,name,got,hash)=>{rows.push({sc,name,expect:'(observation)',got,ok:true,hash,info:true});console.log('INFO',sc,name,'|',got,hash||'');};
const inv=(w,params,label,dest)=>send(w,{TransactionType:'Invoke',...(dest?{Destination:dest}:{}),HookParameters:P(params)},label);
const zero=n=>'0'.repeat(n);const rnd32=()=>crypto.randomBytes(32).toString('hex').toUpperCase();
function msgSign(priv,o){priv=priv.toUpperCase();const ph=priv.length===66&&priv.startsWith('00')?priv.slice(2):priv;const PK=Buffer.from(secp.getPublicKey(ph,true)).toString('hex').toUpperCase();
 const VC=sha512h(Buffer.from(PK,'hex'));const bd=boxData(VC.toString('hex'),o.hook);const f={net:NET,exp:0,...bd,...o};
 const msg=Buffer.concat([Buffer.from(x.decodeAccountID(f.claimer)),VC,Buffer.from(x.decodeAccountID(f.hook)),Buffer.from(u32(f.net),'hex'),Buffer.from(u32(f.exp),'hex'),Buffer.from(f.tid,'hex'),Buffer.from(f.amt,'hex'),Buffer.from(f.nonce,'hex')]);
 return {PK,SIG:kp.sign(sha512h(msg).toString('hex'),priv).toUpperCase(),bd};}
async function sub(w,tx,{seq,llsOff=20}={}){const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
 const t={Account:w.address,NetworkID:NET,...tx,Sequence:seq??ai.account_data.Sequence,LastLedgerSequence:cur+llsOff,Fee:'0',SigningPubKey:''};const f=await rpc('fee',{tx_blob:x.encode(t)});t.Fee=String(BigInt(f.drops.base_fee)*3n/2n+20n);t.SigningPubKey=w.publicKey;
 t.TxnSignature=kp.sign(x.encodeForSigning(t),w.privateKey);const blob=x.encode(t);const hash=x.hashes.hashSignedTx(blob);return {w,blob,hash,lls:t.LastLedgerSequence};}
async function fire(list){const r=await Promise.all(list.map(s=>rpc('submit',{tx_blob:s.blob})));TX+=list.length;return r;}
async function fin(s,label){const v=await waitTx(s.hash,s.lls);if(!v||!v.validated){txlog.push({label,hash:s.hash,result:'NOT VALIDATED',inLedger:false});return {hash:s.hash,result:'notvalidated',hook:'',emit:[],fee:0n};}
 const m=v.meta;const g={hash:s.hash,result:m.TransactionResult,hook:hookRet(m),emit:(m.HookEmissions||[]).map(e=>e.HookEmission.EmittedTxnID),idx:m.TransactionIndex,ledger:v.ledger_index,fee:BigInt(v.Fee)};
 txlog.push({label,type:v.TransactionType,from:NAME[s.w.address],hash:g.hash,result:g.result,hook:g.hook,ledger:g.ledger,txIndex:g.idx,fee:String(g.fee),inLedger:true});return g;}
const keyBox=async(label,o={})=>{const b=await newBox(label,o);return b;};
(async()=>{await ensureHook();let g,sc;
 sc='X7';for(let r=4;r<5;r++){const b=await newBox('X7-'+r+' (key, token+1 XAH, EXP)',{amt:1000000n});await audit(); /* AUDIT in advance, after mint */ b.exp=(await seq())+30;await packOk(sc,b); /* reserve EXP 30 ledgers */const s=sign(b.priv,R1.address,I.address,b.exp);
  const target=b.exp-1+(r%2);while((await seq())<target)await sleep(400);const b0=await bal(R1.address);
  const o=await sub(I,{TransactionType:'Invoke',HookParameters:P({CMD:CMD.OPEN,VC:b.vc})},{llsOff:3});const c=await sub(R1,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s.PK,SIG:s.SIG})},{llsOff:3});
  await fire(r%3===2?[c,o]:[o,c]);const go=await fin(o,'X7 OPEN'),gc=await fin(c,'X7 CLAIM');
  const okOpen=okH(go,'opened'),okClaim=okH(gc,'claiming');let er='no';if(gc.emit&&gc.emit[0])er=await emitted(gc,'X7');await sleep(3000);
  const d=(await bal(R1.address))-b0+gc.fee;const own=await owner(b.tid);
  const ruleO=go.ledger?(go.ledger<=b.exp?'not expired|busy':'opened|busy|claimed|unknown'):'-'; /* fixed: if CLAIM earlier in the same ledger, OPEN receives “busy” (check pending goes before the expiry check, line 310–311) */const ruleC=gc.ledger?(gc.ledger<=b.exp?'claiming|busy|claimed|unknown':'expired|unknown'):'-';
  const paid=okClaim&&er==='tesSUCCESS';const winners=(okOpen?1:0)+(paid?1:0);const exists=!!(await stateOf(b.vc));
  const assetsOk=paid?(d===1200000n&&own===R1.address):(d===0n&&own===I.address);const rules=new RegExp(ruleO).test(go.hook||'')&&new RegExp(ruleC).test(gc.hook||'');
  O(sc,`round ${r}: EXP=${b.exp}; OPEN in ${go.ledger}#${go.idx} “${go.hook}”; CLAIM in ${gc.ledger}#${gc.idx} “${gc.hook}”`,'at most one winner; assets with the winner; rule EXP held; without a winner the box is intact',`winners ${winners}, R1 Δ=${d}, token at ${NAME[own]||own}, box ${exists?'exists':'no'}`,winners<=1&&assetsOk&&(winners===1?!exists:exists)&&rules,gc.hash);
  if(await stateOf(b.vc)){await waitL(b.exp+2);await openBox(b.vc,'X7 cleanup');}}
 console.log('X7R4',rows.filter(z=>!z.info&&z.ok).length+'/'+rows.filter(z=>!z.info).length,'tx',txlog.length);
})().catch(e=>{console.error('CRASH',e);process.exitCode=1;});
