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


const st=async H=>JSON.stringify([(await rpc('account_info',{account:H.address,ledger_index:'current'})).account_data.HookStateCount,await hs(H,'11'.repeat(32))]);
const KO=(k)=>({MODE:'01',KTID:k});
const neg=async(g,n,H,k,amt,tidf)=>{const s0=await st(H);const vc=crypto.randomBytes(32).toString('hex').toUpperCase();const tid=tidf?await tidf(H):null;const r=await pack(H,vc,amt,tid,KO(k));
 rec(g,n,'key issuer',r.result+' '+r.hook,/key issuer/.test(r.hook)&&r.result!=='tesSUCCESS');rec(g,n+': state untouched','same',(await st(H))===s0?'same':'changed',(await st(H))===s0);rec(g,n+': no box','no',(await boxRec(H,vc))?'exists':'no',!(await boxRec(H,vc)));};
for(const [P0,Q0,R0] of [[A,B,D],[B,A,D]]){const g='K1 '+P0.name+'/'+Q0.name;
 // foreign key held by issuer
 const kP=await mint(P0,'KEY');
 await neg(g,Q0.name+' PACK under key '+P0.name+' (key with issuer)',Q0,kP,AMT,null);
 // own key packing, held then transferred
 const vc1=crypto.randomBytes(32).toString('hex').toUpperCase();let r=await pack(P0,vc1,AMT,null,KO(kP));rec(g,P0.name+' PACK under own key (kept)','packed',r.hook,/packed/.test(r.hook));
 r=await give(P0,Q0,kP);rec(g,'key '+P0.name+'→'+Q0.name,'tesSUCCESS',r.result,r.result==='tesSUCCESS');
 {const s0=await st(P0);const t0=await gift(P0);const vx=crypto.randomBytes(32).toString('hex').toUpperCase();r=await pack(P0,vx,AMT,t0,KO(kP));
  rec(g,P0.name+' PACK under own key, already passed on '+Q0.name,'key owner',r.result+' '+r.hook,/key owner/.test(r.hook)&&r.result!=='tesSUCCESS');
  rec(g,'rejected: state untouched','same',(await st(P0))===s0?'same':'changed',(await st(P0))===s0);rec(g,'rejected: no box','no',(await boxRec(P0,vx))?'exists':'no',!(await boxRec(P0,vx)));
  rec(g,'rejected: token at '+P0.name,P0.name,(await owner(t0))===P0.address?P0.name:'no',(await owner(t0))===P0.address);}
 await neg(g,Q0.name+' PACK under key '+P0.name+', passed to them',Q0,kP,AMT,null);
 await neg(g,Q0.name+' PACK of token under key '+P0.name+', passed to them',Q0,kP,0,gift);
 r=await invTo(Q0,P0,{CMD:'CLAIM',VC:vc1});rec(g,Q0.name+' opens XAH','claiming',r.hook,/claiming/.test(r.hook));await payout(g,'XAH',r);done(P0,AMT,null);
 r=await give(Q0,P0,kP);rec(g,'key returned '+Q0.name+'→'+P0.name,'tesSUCCESS',r.result,r.result==='tesSUCCESS');
 const t2=await gift(P0);const vc2=crypto.randomBytes(32).toString('hex').toUpperCase();r=await pack(P0,vc2,AMT,t2,KO(kP));rec(g,P0.name+' PACK after key return','packed',r.hook,/packed/.test(r.hook));
 r=await give(P0,Q0,kP);rec(g,'key again '+P0.name+'→'+Q0.name,'tesSUCCESS',r.result,r.result==='tesSUCCESS');
 r=await invTo(Q0,P0,{CMD:'CLAIM',VC:vc2});rec(g,Q0.name+' opens XAH+code','claiming',r.hook,/claiming/.test(r.hook));await payout(g,'XAH+code',r);done(P0,AMT,t2);
 rec(g,'XAH+code: token at '+Q0.name,Q0.name,(await owner(t2))===Q0.address?Q0.name:'no',(await owner(t2))===Q0.address);
 // key minted by non-hook C, given to P0
 const kC=await mint(C,'KEY');await give(C,P0,kC);await neg(g,P0.name+' PACK under key C (holds it)',P0,kC,AMT,null);
 // key minted by third hook R0 given to P0
 const kR=await mint(R0,'KEY');await give(R0,P0,kR);await neg(g,P0.name+' PACK under key '+R0.name+' (holds it)',P0,kR,AMT,null);
 await checkMeta(g,P0,'final');await checkMeta(g,Q0,'final');}
fs.writeFileSync(process.env.OUT,JSON.stringify(rows,null,1));
const grp={};for(const r of rows){const k=r.g.split(' ')[0];grp[k]=grp[k]||[0,0];grp[k][r.ok?0:1]++;}
console.log('GROUPS',JSON.stringify(grp));console.log('RESULT',rows.filter(x=>x.ok).length,'/',rows.length);process.exit(0);
})().catch(e=>{console.error(e);fs.writeFileSync(process.env.OUT||'/tmp/x4.json',JSON.stringify(rows,null,1));process.exit(1);});
