// Two-hook broad suite, LOCAL standalone only (RPC env, default 127.0.0.1:5015)
process.env.RPC=process.env.RPC||'http://127.0.0.1:5015';
const L=require('../lib');const {kp,rpc,h,sha512h,u32,u64,P,accept,submit,getTx}=L;
const ac=require('ripple-address-codec');const fs=require('fs');const crypto=require('crypto');
const NS='7467730000000000000000000000000000000000000000000000000000000000',HOOKON='FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF10FFFFFFFCFFC1FFFBF800240';
const rows=[];const rec=(g,n,exp,got,ok)=>{rows.push({g,n,exp,got,ok});console.log(ok?'PASS':'FAIL',g,n,'|',got);};
const tag=crypto.randomBytes(4).toString('hex');
async function wallet(p){const r=await rpc('wallet_propose',{passphrase:p+tag});return {address:r.account_id,seed:r.master_seed,name:p};}
function newKey(){const s=kp.generateSeed({algorithm:'ecdsa-secp256k1'});const k=kp.deriveKeypair(s);return {pk:k.publicKey,priv:k.privateKey,vc:sha512h(Buffer.from(k.publicKey,'hex'))};}
const bkey=vc=>sha512h(Buffer.concat([Buffer.from([0x42]),Buffer.from(vc,'hex')])).toString('hex').toUpperCase();
const hs=async(H,key)=>{const r=await rpc('ledger_entry',{hook_state:{account:H.address,key,namespace_id:NS},ledger_index:'current'});return r&&r.node?r.node.HookStateData:null;};
const boxRec=(H,vc)=>hs(H,bkey(vc));
async function sign(key,opener,H,exp,over={}){const d=(await boxRec(H,key.vc))||'0'.repeat(170);const tid=d.slice(0,64),amt=d.slice(64,80),non=d.slice(162,170);
 const msg=Buffer.concat([Buffer.from(ac.decodeAccountID(opener)),key.vc,Buffer.from(ac.decodeAccountID(H.address)),u32(L.NET),u32(exp),Buffer.from(tid,'hex'),Buffer.from(amt,'hex'),Buffer.from(non,'hex')]);return kp.sign(sha512h(msg).toString('hex'),(over.priv||key.priv));}
const seqn=async()=>(await rpc('ledger_current')).ledger_current_index;
const bal=async a=>BigInt((await rpc('account_info',{account:a.address,ledger_index:'current'})).account_data.Balance);
const owner=async id=>{const r=await rpc('ledger_entry',{index:id,ledger_index:'current'});return r&&r.node?r.node.Owner:null;};
const RES=100000n;const model=new Map(); // per account: {held,locks}
const M=a=>{if(!model.has(a.address))model.set(a.address,{held:0n,locks:0n});return model.get(a.address);};
async function checkMeta(g,a,label){const d=await hs(a,'11'.repeat(32));const held=d?BigInt('0x'+d.slice(0,16)):0n,locks=d?BigInt('0x'+d.slice(16,32)):0n;const m=M(a);
 rec(g,`counters ${a.name} ${label}`,`held=${m.held} locks=${m.locks}`,`held=${held} locks=${locks}`,held===m.held&&locks===m.locks);}
(async()=>{const G={address:'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',seed:process.env.GENESIS_SEED};
const A=await wallet('A'),B=await wallet('B'),C=await wallet('C'),D=await wallet('D');
for(const w of [A,B,C,D])await submit(G,{TransactionType:'Payment',Destination:w.address,Amount:'20000000000',Fee:'10'});
const code=fs.readFileSync(process.env.WASM).toString('hex').toUpperCase();
for(const w of [A,B,D]){const r=await submit(w,{TransactionType:'SetHook',Fee:'20000000',Hooks:[{Hook:{CreateCode:code,HookOn:HOOKON,HookNamespace:NS,HookApiVersion:0,Flags:1}}]});rec('0','SetHook '+w.name,'tesSUCCESS',r.result,r.result==='tesSUCCESS');}
const invTo=(w,dst,p,o)=>submit(w,{TransactionType:'Invoke',Fee:'2000000',...(dst?{Destination:dst.address}:{}),HookParameters:P(p)},o);
const audit=async w=>{let q;for(let i=0;i<20;i++){q=await invTo(w,null,{CMD:'AUDIT'});if(!/more/.test(q.hook))break;}return q;};
const pack=async(H,vc,amt,tid,extra={})=>{const pp={CMD:'PACK',VC:vc,TID:tid||'00'.repeat(32),AMT:u64(amt),...extra};let r=await invTo(H,null,pp);if(/audit/.test(r.hook)){await audit(H);r=await invTo(H,null,pp);}
 if(/packed/.test(r.hook)){const m=M(H);m.held+=BigInt(amt)+RES;if(tid)m.locks+=1n;}return r;};
const done=(H,amt,tid)=>{const m=M(H);m.held-=BigInt(amt)+RES;if(tid)m.locks-=1n;};
let mn=0;const mint=async(w,pfx='own')=>{const u=h(pfx+':'+tag+':'+(mn++));const r=await submit(w,{TransactionType:'URITokenMint',URI:u});return sha512h(Buffer.concat([Buffer.from('0055','hex'),Buffer.from(ac.decodeAccountID(w.address)),Buffer.from(u,'hex')])).toString('hex').toUpperCase();};
const give=async(from,to,id)=>{let r=await submit(from,{TransactionType:'URITokenCreateSellOffer',Fee:'2000000',URITokenID:id,Amount:'0',Destination:to.address});if(r.result!=='tesSUCCESS')return r;return await submit(to,{TransactionType:'URITokenBuy',Fee:'2000000',URITokenID:id,Amount:'0'});};
const gift=async(H)=>{const id=await mint(C,'GIFTCODE');const r=await give(C,H,id);return r.result==='tesSUCCESS'?id:null;};
const payout=async(g,n,r)=>{for(let i=0;i<2;i++)await accept();const e=r.emit&&r.emit[0]?await getTx(r.emit[0]):null;rec(g,n+': payout','tesSUCCESS',e?e.result:'no emit',!!e&&e.result==='tesSUCCESS');return e;};
const AMT=5000000;
for(const H of [A,B,D]){await audit(H);}

// H1: VC gift-code with expiry variants, both directions
for(const [P0,Q0] of [[A,B],[B,A]]){const g='H1 '+P0.name+'→'+Q0.name;
 for(const [nm,amt,tk] of [['gift code with EXP',0,'gift'],['XAH+gift code with EXP',AMT,'gift'],['XAH+own token with EXP',AMT,'own']]){
  const tid=tk==='own'?await mint(P0):await gift(P0);const k=newKey();const ex=(await seqn())+30;
  let r=await pack(P0,k.vc,amt,tid,{EXP:u32(ex)});rec(g,'PACK '+nm,'packed',r.hook,/packed/.test(r.hook));
  r=await invTo(Q0,P0,{CMD:'CLAIM',PK:k.pk,SIG:await sign(k,Q0.address,P0,ex)});rec(g,nm+': CLAIM by hook before expiry','claiming',r.hook,/claiming/.test(r.hook));
  await payout(g,nm,r);done(P0,amt,tid);rec(g,nm+': token at '+Q0.name,Q0.name,(await owner(tid))===Q0.address?Q0.name:'no',(await owner(tid))===Q0.address);
  rec(g,nm+': entry erased','no',(await boxRec(P0,k.vc))?'exists':'no',!(await boxRec(P0,k.vc)));}
 await checkMeta(g,P0,'');}
// H2: 6 mixed boxes under ONE key, key passes through hook holders and a non-hook holder
for(const [P0,Q0,R0] of [[A,B,D],[B,D,A],[D,A,B]]){const g='H2 '+P0.name+' key→'+Q0.name+'→'+R0.name+'→C→'+Q0.name;const K=await mint(P0,'KEY');const list=[];
 for(const [nm,amt,tk,ex] of [['XAH',AMT,null],['own token',0,'own'],['XAH+own token',AMT,'own'],['gift code',0,'gift'],['XAH+gift code',AMT,'gift'],['gift code with EXP',0,'gift',true]]){
  const tid=tk==='own'?await mint(P0):tk==='gift'?await gift(P0):null;const vc=crypto.randomBytes(32).toString('hex').toUpperCase();
  const r=await pack(P0,vc,amt,tid,{MODE:'01',KTID:K,...(ex?{EXP:u32((await seqn())+200)}:{})});rec(g,'PACK under one key: '+nm,'packed',r.hook,/packed/.test(r.hook));list.push({nm,amt,tid,vc});}
 await checkMeta(g,P0,'after 6 PACK');
 let r=await give(P0,Q0,K);rec(g,'key '+P0.name+'→'+Q0.name,'tesSUCCESS',r.result,r.result==='tesSUCCESS');
 const holders=[Q0,Q0,R0,R0,C,Q0];let cur=Q0;
 for(let i=0;i<list.length;i++){const want=holders[i];if(want!==cur){r=await give(cur,want,K);rec(g,`key ${cur.name}→${want.name}`,'tesSUCCESS',r.result,r.result==='tesSUCCESS');
   const r2=await invTo(cur,P0,{CMD:'CLAIM',VC:list[i].vc});rec(g,`(neg) previous holder ${cur.name}`,'not holder',r2.hook,/not holder/.test(r2.hook));cur=want;}
  const b=list[i];const sOther=await snapAll(cur);r=await invTo(cur,P0,{CMD:'CLAIM',VC:b.vc});rec(g,`${cur.name} opens: ${b.nm}`,'claiming',r.result+' '+r.hook,/claiming/.test(r.hook));
  await payout(g,b.nm,r);done(P0,b.amt,b.tid);if(b.tid)rec(g,b.nm+': token at '+cur.name,cur.name,(await owner(b.tid))===cur.address?cur.name:'no',(await owner(b.tid))===cur.address);
  if(cur!==C)rec(g,b.nm+': hook entries '+cur.name+' untouched','same',(await snapAll(cur))===sOther?'same':'changed',(await snapAll(cur))===sOther);
  rec(g,b.nm+': entry erased','no',(await boxRec(P0,b.vc))?'exists':'no',!(await boxRec(P0,b.vc)));}
 await checkMeta(g,P0,'after all');await give(cur,P0,K);}
async function snapAll(a){const ai=(await rpc('account_info',{account:a.address,ledger_index:'current'})).account_data;const o=[ai.HookStateCount];for(const k of ['11','22','33','44','55','66'])o.push(await hs(a,k.repeat(32)));return JSON.stringify(o);}
for(const H of [A,B,D]){const ai=(await rpc('account_info',{account:H.address,ledger_index:'current'})).account_data;const fixed=[];for(const k of ['11','22','33','44','55','66'])if(await hs(H,k.repeat(32)))fixed.push(k);
 rec('H3 result',H.name+': boxes 0',String(fixed.length),String(ai.HookStateCount),Number(ai.HookStateCount)===fixed.length);await checkMeta('H3 result',H,'final');}
fs.writeFileSync(process.env.OUT,JSON.stringify(rows,null,1));
const grp={};for(const r of rows){const k=r.g.split(' ')[0];grp[k]=grp[k]||[0,0];grp[k][r.ok?0:1]++;}
console.log('GROUPS',JSON.stringify(grp));console.log('RESULT',rows.filter(x=>x.ok).length,'/',rows.length);process.exit(0);
})().catch(e=>{console.error(e);fs.writeFileSync(process.env.OUT||'/tmp/x3.json',JSON.stringify(rows,null,1));process.exit(1);});
