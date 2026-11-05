const L=require('../lib');const {kp,rpc,h,sha512h,u32,u64,P,accept,submit,getTx}=L;
const ac=require('ripple-address-codec');const fs=require('fs');const crypto=require('crypto');
const NS='7467730000000000000000000000000000000000000000000000000000000000',HOOKON='FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF10FFFFFFFCFFC1FFFBF800240';const rows=[];
const rec=(sc,name,exp,got,ok)=>{rows.push({sc,name,exp,got,ok});console.log(ok?'PASS':'FAIL',sc,name,'|',got);};
const tag=crypto.randomBytes(4).toString('hex');
async function wallet(p){const r=await rpc('wallet_propose',{passphrase:p+tag});return {address:r.account_id,seed:r.master_seed};}
function newKey(){const s=kp.generateSeed({algorithm:'ecdsa-secp256k1'});const k=kp.deriveKeypair(s);return {pk:k.publicKey,priv:k.privateKey,vc:sha512h(Buffer.from(k.publicKey,'hex'))};}
const bkey=vc=>sha512h(Buffer.concat([Buffer.from([0x42]),vc])).toString('hex').toUpperCase();
let H;async function boxRec(vc){const r=await rpc('ledger_entry',{hook_state:{account:H.address,key:bkey(vc),namespace_id:NS},ledger_index:'current'});return r.node?r.node.HookStateData:null;}
async function sign(key,opener,Hacc,exp,over={}){const d=(await boxRec(key.vc))||'0'.repeat(170);const tid=over.tid||d.slice(0,64),amt=over.amt||d.slice(64,80),non=over.nonce||d.slice(162,170);
 const msg=Buffer.concat([Buffer.from(ac.decodeAccountID(opener)),key.vc,Buffer.from(ac.decodeAccountID(Hacc)),u32(L.NET),u32(exp),Buffer.from(tid,'hex'),Buffer.from(amt,'hex'),Buffer.from(non,'hex')]);return kp.sign(sha512h(msg).toString('hex'),key.priv);}
const seqn=async()=>(await rpc('ledger_current')).ledger_current_index;
(async()=>{const G={address:'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',seed:process.env.GENESIS_SEED};
H=await wallet('H');const B=await wallet('B'),C=await wallet('C');const A=H;
for(const w of [H,B,C])await submit(G,{TransactionType:'Payment',Destination:w.address,Amount:'5000000000',Fee:'10'});
const code=fs.readFileSync(process.env.WASM).toString('hex').toUpperCase();
for(const w of [H,B]){const r=await submit(w,{TransactionType:'SetHook',Fee:'20000000',Hooks:[{Hook:{CreateCode:code,HookOn:HOOKON,HookNamespace:NS,HookApiVersion:0,Flags:1}}]});rec('0','SetHook '+(w===H?'A':'B'),'tesSUCCESS',r.result,r.result==='tesSUCCESS');}
const invTo=(w,dst,p,o)=>submit(w,{TransactionType:'Invoke',Fee:'2000000',...(dst?{Destination:dst.address}:{}),HookParameters:P(p)},o);
const inv=(w,p,o)=>invTo(w,w===H?null:H,p,o);
const audit=async(w)=>{for(let i=0;i<10;i++){const q=await invTo(w,null,{CMD:'AUDIT'});if(!/more/.test(q.hook))break;}};
const pack=async(k,amt,extra={})=>{const pp={CMD:'PACK',VC:k.vc,TID:'00'.repeat(32),AMT:u64(amt),...extra};let r=await inv(H,pp);if(/audit/.test(r.hook)){await audit(H);r=await inv(H,pp);}return r;};
const claim=async(w,k,o)=>inv(w,{CMD:'CLAIM',PK:k.pk,SIG:await sign(k,w.address,H.address,0)},o);
const st=async(acc)=>(await rpc('account_objects',{account:acc.address,type:'hook_state',ledger_index:'current'})).account_objects||[];
const snap=async acc=>{const ai=(await rpc('account_info',{account:acc.address,ledger_index:'current'})).account_data;const o=[ai.HookStateCount];for(const k of ['11','22','33','44','55','66']){const r=await rpc('ledger_entry',{hook_state:{account:acc.address,key:k.repeat(32),namespace_id:NS},ledger_index:'current'});o.push(r.node?r.node.HookStateData:'-');}return JSON.stringify(o);};
const ballance=async a=>BigInt((await rpc('account_info',{account:a.address,ledger_index:'current'})).account_data.Balance);
let mn=0;const mint=async(w)=>{const u=h('x15:'+tag+':'+(mn++));await submit(w,{TransactionType:'URITokenMint',URI:u});return sha512h(Buffer.concat([Buffer.from('0055','hex'),Buffer.from(ac.decodeAccountID(w.address)),Buffer.from(u,'hex')])).toString('hex').toUpperCase();};
const owner=async id=>{const r=await rpc('ledger_entry',{index:id,ledger_index:'current'});return r&&r.node?r.node.Owner:null;};
await audit(B); // B also an active hook with state
// T1: VC-box on A, B (with hook) opens
{const k=newKey();let r=await pack(k,10000000);rec('T1','A PACK VC-box','tgs: packed',r.hook,/packed/.test(r.hook));
 const sB=await snap(B);const b0=await ballance(B);
 r=await claim(B,k);rec('T1','B(hook) CLAIM on A','claiming',r.result+' '+r.hook,/claiming/.test(r.hook));const fee=BigInt(r.tx.Fee);
 await accept();await accept();const e=r.emit&&r.emit[0]?await getTx(r.emit[0]):null;rec('T1','payout Remit','tesSUCCESS',e?e.result:'no',e&&e.result==='tesSUCCESS');
 const d=(await ballance(B))-b0+fee;rec('T1','B received XAH','>=10000000',String(d),d>=10000000n);
 rec('T1','box on A erased','no',(await boxRec(k.vc))?'exists':'no',!(await boxRec(k.vc)));
 rec('T1','hook state B unchanged','same',(await snap(B))===sB?'same':'changed',(await snap(B))===sB);}
// T2: key token box on A, key at B (with hook), B opens
{const VID=await mint(H),KID=await mint(H);const VC=crypto.randomBytes(32).toString('hex').toUpperCase();
 let r=await inv(H,{CMD:'PACK',VC,MODE:'01',KTID:KID,TID:VID,AMT:u64(10000000)});if(/audit/.test(r.hook)){await audit(H);r=await inv(H,{CMD:'PACK',VC,MODE:'01',KTID:KID,TID:VID,AMT:u64(10000000)});}
 rec('T2','A PACK key token box','tgs: packed',r.hook,/packed/.test(r.hook));
 r=await submit(H,{TransactionType:'URITokenCreateSellOffer',Fee:'2000000',URITokenID:KID,Amount:'0',Destination:B.address});rec('T2','A offer key->B','tesSUCCESS',r.result+' '+r.hook,r.result==='tesSUCCESS');
 r=await submit(B,{TransactionType:'URITokenBuy',Fee:'2000000',URITokenID:KID,Amount:'0'});rec('T2','B buy key','tesSUCCESS',r.result+' '+r.hook,r.result==='tesSUCCESS');
 const sB=await snap(B);
 r=await inv(C,{CMD:'CLAIM',VC});rec('T2','(neg) C without key CLAIM','not holder',r.hook,/not holder/.test(r.hook));
 r=await inv(B,{CMD:'CLAIM',VC});rec('T2','B(hook) CLAIM by key on A','claiming',r.result+' '+r.hook,/claiming/.test(r.hook));
 await accept();await accept();const e=r.emit&&r.emit[0]?await getTx(r.emit[0]):null;rec('T2','payout Remit','tesSUCCESS',e?e.result:'no',e&&e.result==='tesSUCCESS');
 rec('T2','voucher at B','B',(await owner(VID))===B.address?'B':String(await owner(VID)),(await owner(VID))===B.address);
 rec('T2','hook state B unchanged','same',(await snap(B))===sB?'same':'changed',(await snap(B))===sB);
 r=await inv(B,{CMD:'CLAIM',VC});rec('T2','(neg) repeated CLAIM','unknown',r.hook,/unknown/.test(r.hook));}
// T3: own commands A as in v14
{const k=newKey();const EXPV=(await seqn())+8;let r=await pack(k,1000000,{EXP:u32(EXPV)});rec('T3','A PACK with EXP','packed',r.hook,/packed/.test(r.hook));
 r=await inv(H,{CMD:'OPEN',VC:k.vc});rec('T3','A OPEN before expiry','not expired',r.hook,/not expired/.test(r.hook));
 {const ex=parseInt(r.tx&&0||0);}while((await seqn())<=EXPV+1)await accept();r=await inv(H,{CMD:'OPEN',VC:k.vc});rec('T3','A OPEN after expiry','opened',r.hook,/opened/.test(r.hook));
 for(let i=0;i<3;i++)await accept();
 r=await inv(H,{CMD:'SYNC'});rec('T3','A SYNC','idle/synced',r.hook,/idle|synced/.test(r.hook));
 r=await invTo(H,H,{CMD:'SYNC'});rec('T3','A SYNC with Destination=A (as v14)','idle/synced',r.result+' '+r.hook,/idle|synced/.test(r.hook)||/tem|tef/.test(r.result));
 r=await invTo(H,null,{CMD:'XXXX'});rec('T3','A unknown command without Destination','cmd error as v14',r.hook,/tgs: (cmd|unknown)/.test(r.hook));}
// T4: outgoing Invoke A->the other does not touch state A
{const s0=await snap(H);const k=newKey();
 for(const [nm,p] of [['PACK',{CMD:'PACK',VC:k.vc,TID:'00'.repeat(32),AMT:u64(1000000)}],['OPEN',{CMD:'OPEN',VC:k.vc}],['SYNC',{CMD:'SYNC'}],['AUDIT',{CMD:'AUDIT'}],['garbage',{CMD:'ZZZZ'}]]){
  let r=await invTo(H,C,p);rec('T4','A->C Invoke '+nm,'tgs: pass',r.result+' '+r.hook,/tgs: pass/.test(r.hook));}
 rec('T4','state A unchanged','same',(await snap(H))===s0?'same':'changed',(await snap(H))===s0);
 let r=await invTo(H,C,{CMD:'PACK',VC:k.vc,TID:'00'.repeat(32),AMT:u64(1000000)});rec('T4','box not created','no',(await boxRec(k.vc))?'exists':'no',!(await boxRec(k.vc)));}
fs.writeFileSync(process.env.OUT,JSON.stringify(rows,null,1));
console.log('RESULT',rows.filter(x=>x.ok).length,'/',rows.length);process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
