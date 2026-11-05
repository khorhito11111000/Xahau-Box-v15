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

const nsList=async()=>((await rpc('account_namespace',{account:I.address,namespace_id:NS,ledger_index:'validated'})).namespace_entries||[]);
async function prep(w,tx,label){tx={Account:w.address,NetworkID:NET,...tx};const ai=await rpc('account_info',{account:w.address,ledger_index:'current'});const cur=(await rpc('ledger_current')).ledger_current_index;
 const t={...tx,Sequence:ai.account_data.Sequence,LastLedgerSequence:cur+40,Fee:'0',SigningPubKey:''};const f=await rpc('fee',{tx_blob:x.encode(t)});t.Fee=String(BigInt(f.drops.base_fee)*3n/2n+20n);delete t.SigningPubKey;
 const s=w.sign(t);return {w,label,blob:s.tx_blob,hash:s.hash,lls:t.LastLedgerSequence};}
async function burst(thunks){
 const items=await Promise.all(thunks.map(f=>f()));
 // waiting for a fresh ledger so all land in one
 const l0=(await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index;while((await rpc('ledger',{ledger_index:'validated'})).ledger.ledger_index===l0)await sleep(300);
 const sub=await Promise.all(items.map(i=>rpc('submit',{tx_blob:i.blob})));TX+=items.length;
 const out=[];for(let k=0;k<items.length;k++){const i=items[k];const v=await waitTx(i.hash,i.lls);const m=v&&v.meta;
  const g={label:i.label,from:NAME[i.w.address],hash:i.hash,engine:sub[k].engine_result,result:m?m.TransactionResult:'notvalidated',hook:m?hookRet(m):'',ledger:v&&v.ledger_index,idx:m&&m.TransactionIndex,emit:m?(m.HookEmissions||[]).map(e=>e.HookEmission.EmittedTxnID):[],fee:(v&&v.validated)?BigInt(v.Fee):0n};
  txlog.push({label:i.label,type:'Invoke',from:g.from,hash:g.hash,result:g.result,hook:g.hook,ledger:g.ledger,txIndex:g.idx,fee:String(g.fee)});out.push(g);}
 out._items=items;return out;}
const garbageSig=()=>'3045022100'+crypto.randomBytes(32).toString('hex').toUpperCase()+'0220'+crypto.randomBytes(32).toString('hex').toUpperCase().replace(/^[89A-F]/,'1');
async function round(rn){const all=[R1,R2,R3,S];
 const cases=[];
 // A: burner
 {const b=await newBox(`R${rn} box A (bearer)`,{amt:2000000n});await packOk('RACE',b);const s1=sign(b.priv,R1.address,I.address,0),s3=sign(b.priv,R3.address,I.address,0);
  cases.push({b,kind:'A',items:[()=>prep(R1,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s1.PK,SIG:s1.SIG})},`R${rn} A: R1 legitimate CLAIM`),
   ()=>prep(R3,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s3.PK,SIG:s3.SIG})},`R${rn} A: R3 also knows the key (own valid signature)`),
   ()=>prep(R2,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s1.PK,SIG:s1.SIG})},`R${rn} A: R2 copies PK+SIG R1`),
   ()=>prep(S,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s1.PK,SIG:garbageSig()})},`R${rn} A: R4 garbage signature`)]});}
 // C: addressed for R1
 {const b=await newBox(`R${rn} box C (addressed R1)`,{amt:2000000n});await packOk('RACE',b);const s1=sign(b.priv,R1.address,I.address,0);
  cases.push({b,kind:'C',items:[()=>prep(R1,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s1.PK,SIG:s1.SIG})},`R${rn} C: R1 addressee`),
   ...[R2,R3,S].map(w=>()=>prep(w,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,PK:s1.PK,SIG:s1.SIG})},`R${rn} C: ${NAME[w.address]} copies QR R1`))]});}
 // D: token, key at R2
 {const b=await newBox(`R${rn} box D (token, key at R2)`,{mode:'T',amt:2000000n});await packOk('RACE',b);await remitKey(I,R2,b.ktid,`R${rn} key D → R2`);
  cases.push({b,kind:'D',items:[()=>prep(R2,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,VC:b.vc})},`R${rn} D: R2 holder`),
   ...[R1,R3,S].map(w=>()=>prep(w,{TransactionType:'Invoke',Destination:I.address,HookParameters:P({CMD:CMD.CLAIM,VC:b.vc})},`R${rn} D: ${NAME[w.address]} without key`))]});}
 for(const c of cases){const sc=`RACE-${c.kind}`;const before={};for(const w of all)before[w.address]=await bal(w.address);
  const res=await burst(c.items);c.prepped=res._items;const ledgers=[...new Set(res.map(r=>r.ledger))];
  rows.push({sc,name:`R${rn} ${c.kind}: all ${res.length} CLAIM in one ledger`,expect:'1 ledger',got:`ledgers ${ledgers.join(',')}`,ok:ledgers.length===1&&!!ledgers[0],safe:true,ledger:ledgers[0]});
  for(const r of res)rows.push({sc,name:`${r.label} (ledger position ${r.idx})`,expect:'',got:`${r.result} / ${r.hook}`,ok:true,hash:r.hash,ledger:r.ledger,info:true});
  const winners=res.filter(r=>r.hook.includes('tgs: claiming'));
  const legitLabel=c.kind==='A'?['R1','R3']:c.kind==='C'?['R1']:['R2'];
  rows.push({sc,name:`R${rn} ${c.kind}: exactly one winner, and it is legitimate`,expect:`1 of ${legitLabel.join('/')}`,got:winners.map(w=>w.from).join(',')||'nobody',ok:winners.length===1&&legitLabel.includes(winners[0].from),safe:winners.length<=1});
  let er='no';if(winners[0]&&winners[0].emit[0]){const v=await waitTx(winners[0].emit[0]);er=v&&v.meta?v.meta.TransactionResult:'not found';txlog.push({label:`emit ${c.b.label}`,type:'Remit(emit)',hash:winners[0].emit[0],result:er,ledger:v&&v.ledger_index});TX++;}
  rows.push({sc,name:`R${rn} ${c.kind}: emitted Remit`,expect:'tesSUCCESS',got:er,ok:er==='tesSUCCESS',hash:winners[0]&&winners[0].emit[0],safe:true});
  await sleep(4000);const emits=res.reduce((n,r)=>n+r.emit.length,0);
  rows.push({sc,name:`R${rn} ${c.kind}: emits total`,expect:'1',got:String(emits),ok:emits===1,safe:emits<=1});
  const deltas=[];let paid=0;for(const w of all){const myFee=res.filter(r=>r.from===NAME[w.address]).reduce((s,r)=>s+r.fee,0n);const d=(await bal(w.address))-before[w.address]+myFee;deltas.push(`${NAME[w.address]}:${d}`);if(d>0n)paid++;
   if(winners[0]&&winners[0].from===NAME[w.address]){rows.push({sc,name:`R${rn} ${c.kind}: winner ${NAME[w.address]} received amount+reserve`,expect:'2200000',got:String(d),ok:d===2200000n,safe:true});}}
  rows.push({sc,name:`R${rn} ${c.kind}: XAH only one received (Δ without fees)`,expect:'1 account with Δ>0',got:deltas.join(' '),ok:paid===1,safe:paid<=1});
  const o=await owner(c.b.tid);rows.push({sc,name:`R${rn} ${c.kind}: token with winner`,expect:winners[0]?winners[0].from:'-',got:NAME[o]||o,ok:!!winners[0]&&NAME[o]===winners[0].from,safe:true});
  // losers after: replay, must be unknown
  for(const it of c.prepped.filter(i=>!winners[0]||NAME[i.w.address]!==winners[0].from).slice(0,1)){const tx=x.decode(it.blob);delete tx.TxnSignature;delete tx.SigningPubKey;delete tx.Sequence;delete tx.LastLedgerSequence;delete tx.Fee;delete tx.Account;
   const g=await send(it.w,tx,`replay after race ${it.label}`);rows.push({sc,name:`R${rn} ${c.kind}: loser ${NAME[it.w.address]} repeats after`,expect:'rejected (unknown/bad sig/not holder)',got:`${g.result} / ${g.hook}`,ok:/HOOK_REJECTED/.test(g.result),hash:g.hash,safe:true});}}
 {const L=await nsList();const left=cases.filter(c=>L.some(e=>e.HookStateKey===bkeyOf(c.b.vc))).length;const lk=cases.filter(c=>c.b.tid&&L.some(e=>e.HookStateKey===c.b.tid)).length;rows.push({sc:'RACE',name:`R${rn}: after round of box entries ${left}, token locks ${lk} (service total ${L.length})`,expect:'0 and 0',got:`${left}/${lk}`,ok:left===0&&lk===0,safe:true});} /* fixed: previously the total number of entries was compared with 3, while service entries in v14 more (META,NCK,AUD,OCK,TRK) */}
(async()=>{await ensureHook();for(let rn=1;rn<=3;rn++)await round(rn);
 const n0=(await nsList()).length;const g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookNamespace:NS,Flags:2}}]},'SetHook NSDelete');const n1=(await nsList()).length;
 rows.push({sc:'CLEANUP',name:`Hook state cleared (${n0} → ${n1})`,expect:'0',got:String(n1),ok:n1===0&&g.result==='tesSUCCESS',hash:g.hash,safe:true});
 const objs=(await rpc('account_objects',{account:I.address,ledger_index:'validated'})).account_objects;const types={};for(const o of objs)types[o.LedgerEntryType]=(types[o.LedgerEntryType]||0)+1;
 const fin={objects:types,balance:String(await bal(I.address))};const checks=rows.filter(r=>!r.info);
 const r={rows:[]};const pt=[];
 r.rows=[...r.rows,...checks];r.race={...fin,finished:new Date().toISOString(),detail:rows.filter(r=>r.info)};r.totalTx=pt.length+txlog.length;r.pass=r.rows.filter(x=>x.ok).length;r.fail=r.rows.filter(x=>!x.ok).length;
 fs.writeFileSync(D+'/results.json',JSON.stringify(r,null,1));fs.writeFileSync(D+'/txlog.json',JSON.stringify([...pt,...txlog],null,1));fs.writeFileSync(D+'/race_rows.json',JSON.stringify({rows,txlog},null,1));
 console.log('RACE TOTAL',checks.filter(x=>x.ok).length+'/'+checks.length,'tx',txlog.length,JSON.stringify(fin),r.pass,r.fail,r.totalTx);})().catch(e=>{console.error('CRASH',e);fs.writeFileSync(D+'/race_crash.json',JSON.stringify({rows,txlog},null,1,(k,v)=>typeof v==='bigint'?String(v):v));process.exit(1);});
