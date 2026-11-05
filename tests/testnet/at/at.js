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

// ===== AUDIT trigger tests =====
const ZT='0'.repeat(64);
async function nsAll(a){let out=[],m;for(let i=0;i<20;i++){const r=await rpc('account_namespace',Object.assign({account:a,namespace_id:NS,ledger_index:'validated'},m?{marker:m}:{}));out=out.concat(r.namespace_entries||[]);m=r.marker;if(!m)break;}return out;}
const K_META='',K_AUD='';
// page formula (js/app.js acct()+needsAudit), keys found by data length: META 17B(34 hex), AUD 41B(82 hex)
async function state(){const info=(await rpc('account_info',{account:I.address,ledger_index:'validated'})).account_data;const ns=await nsAll(I.address);
 const meta=ns.find(e=>e.HookStateData.length===34),aud=ns.find(e=>e.HookStateData.length===82);
 const locks=meta?BigInt('0x'+meta.HookStateData.slice(16,32)):0n;const oc=BigInt(info.OwnerCount||0),sc=BigInt(info.HookStateScale||1),hsc=BigInt(info.HookStateCount||0),tic=BigInt(info.TicketCount||0);
 const ex=locks+hsc*sc+tic;const F=oc>ex?oc-ex:0n;const ob=(await rpc('account_objects',{account:I.address,ledger_index:'validated',limit:400})).account_objects||[];
 const uri=ob.filter(o=>o.LedgerEntryType==='URIToken').length,hk=ob.filter(o=>o.LedgerEntryType==='Hook').length;
 return {oc,hsc,locks,F,uri,hk,aud:aud?{done:aud.HookStateData.slice(32,34)!=='00',count:BigInt('0x'+aud.HookStateData.slice(16,32))}:null};}
const needsAudit=(v,hasTok)=>{let F=v.F;if(hasTok&&F)F-=1n;if(F<=1n)return false;return !(v.aud&&v.aud.done&&F<=v.aud.count);};
const desc=v=>`OwnerCount=${v.oc} (Hook ${v.hk}, URIToken ${v.uri}, hook entries ${v.hsc}, in boxes ${v.locks}) F=${v.F} AUDIT=${v.aud?(v.aud.done?'done':'not done')+'/'+v.aud.count:'no'}`;
let MM=0,PP=0;
async function tryPack(sc,name,b,expectAudit){const v=await state();const pred=needsAudit(v,!!b.tid);
 const g=await send(I,{TransactionType:'Invoke',HookParameters:P(packParams(b))},'PACK '+name);
 const got=/tgs: audit/.test(g.hook)?'audit':/packed/.test(g.hook)?'packed':g.hook;
 const match=(pred&&got==='audit')||(!pred&&got==='packed');if(match)PP++;else MM++;
 rec(sc,`${name} | ${desc(v)} | page:${pred?'needed AUDIT':'without AUDIT'}`,expectAudit?'tgs: audit':'tgs: packed',g.hook,(expectAudit?got==='audit':got==='packed')&&match,g.hash);return got;}
async function doAudit(sc){const a=await audit();const v=await state();rec(sc,'AUDIT | after: '+desc(v),'tgs: audited',a.hook,/audited/.test(a.hook),a.hash);}
const kvc=()=>{const k=boxKey();return k.VC;};
(async()=>{
 const HD=Buffer.from(fs.readFileSync('/workspace/box_token/v15/builder_tgsboxv15.wasm')).toString('hex').toUpperCase();
 let v=await state();rec('S0','before SetHook | '+desc(v),'info','',true);
 let g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookHash:HOOKHASH,HookNamespace:NS,HookOn:HOOKON,Flags:1}}]},'SetHook');
 if(g.result!=='tesSUCCESS'){g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{CreateCode:HD,HookNamespace:NS,HookOn:HOOKON,HookApiVersion:0,Flags:1}}]},'SetHook code');}
 v=await state();rec('S1','SetHook | after: '+desc(v),'tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
 await tryPack('A1','link box 1 XAH',{vc:kvc(),amt:1000000n},false);
 const t1=await mint('t1');await tryPack('A2','link box with token t1 (+1 XAH)',{vc:kvc(),tid:t1,amt:1000000n},false);
 const t2=await mint('t2');await tryPack('A3','link box with token t2',{vc:kvc(),tid:t2,amt:0n},false);
 await tryPack('A4','link box 1 XAH again',{vc:kvc(),amt:1000000n},false);
 const key=await mintURI(H('https://xahaubox.com/img/key.json?k='+crypto.randomBytes(8).toString('hex')),'key');
 await tryPack('A5','key token: only 1 XAH (key on the address)',{mode:'T',ktid:key,vc:kvc(),amt:1000000n},true);
 const t3=await mint('t3');await tryPack('A6','key token: token t3 (key on the address)',{mode:'T',ktid:key,vc:kvc(),tid:t3,amt:0n},true);
 await doAudit('B1');
 await tryPack('B2','key token: token t3 after AUDIT',{mode:'T',ktid:key,vc:kvc(),tid:t3,amt:0n},false);
 await tryPack('B3','key token: 1 XAH after AUDIT',{mode:'T',ktid:key,vc:kvc(),amt:1000000n},false);
 const t4=await mint('t4'),t5=await mint('t5');
 await tryPack('B4','link box 1 XAH, 2 more free tokens on the address',{vc:kvc(),amt:1000000n},true);
 await tryPack('B5','box with t4 (t5 free)',{vc:kvc(),tid:t4,amt:0n},true);
 await doAudit('B6');
 await tryPack('B7','box with t4 after 2nd AUDIT',{vc:kvc(),tid:t4,amt:0n},false);
 // C: hook reinstall, old entry AUDIT
 g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{CreateCode:'',Flags:1}}]},'SetHook delete');v=await state();rec('C1','hook deletion (without NSDELETE) | '+desc(v),'tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
 g=await send(I,{TransactionType:'SetHook',Hooks:[{Hook:{HookHash:HOOKHASH,HookNamespace:NS,HookOn:HOOKON,Flags:1}}]},'SetHook reinstall');v=await state();rec('C2','reinstall v15 | '+desc(v),'tesSUCCESS',g.result,g.result==='tesSUCCESS',g.hash);
 await tryPack('C3','after reinstall: box with t5 (F within the old AUDIT)',{vc:kvc(),tid:t5,amt:0n},false);
 await tryPack('C4','after reinstall: 1 XAH',{vc:kvc(),amt:1000000n},false);
 const t6=await mint('t6'),t7=await mint('t7');
 await tryPack('C5','after reinstall: 1 XAH, +2 new tokens above AUDIT',{vc:kvc(),amt:1000000n},true);
 await doAudit('C6');
 await tryPack('C7','after new AUDIT: box with t6',{vc:kvc(),tid:t6,amt:0n},false);
 console.log('MATCH',PP,'MISMATCH',MM);fs.writeFileSync(D+'/res.json',JSON.stringify({rows,txlog,PP,MM},(k,v)=>typeof v==='bigint'?String(v):v,1));process.exit(0);
})().catch(e=>{console.error('CRASH',e.message);fs.writeFileSync(D+'/res.json',JSON.stringify({rows,txlog,PP,MM,crash:e.message},(k,v)=>typeof v==='bigint'?String(v):v,1));process.exit(1);});
