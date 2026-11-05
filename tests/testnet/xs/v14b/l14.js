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
H=await wallet('H');const A=await wallet('A'),B=await wallet('B'),C=await wallet('C');
for(const w of [H,A,B,C])await submit(G,{TransactionType:'Payment',Destination:w.address,Amount:'5000000000',Fee:'10'});
const code=fs.readFileSync(process.env.WASM).toString('hex').toUpperCase();
let r=await submit(H,{TransactionType:'SetHook',Fee:'20000000',Hooks:[{Hook:{CreateCode:code,HookOn:HOOKON,HookNamespace:NS,HookApiVersion:0,Flags:1}}]});rec('0','SetHook v14 locally','tesSUCCESS',r.result,r.result==='tesSUCCESS');
const inv=(w,p,o)=>submit(w,{TransactionType:'Invoke',...(w===H?{}:{Destination:H.address}),HookParameters:P(p)},o);
const pack0=(k,amt,exp,tid='00'.repeat(32),extra={})=>inv(H,{CMD:'PACK',VC:k.vc,TID:tid,AMT:u64(amt),...(exp!==undefined?{EXP:u32(exp)}:{}),...extra});
const pack=async(...a)=>{let r=await pack0(...a);if(/audit/.test(r.hook)){for(let i=0;i<10;i++){const q=await inv(H,{CMD:'AUDIT'});if(!/more/.test(q.hook))break;}r=await pack0(...a);}return r;};
const claim=async(w,k,exp,o)=>inv(w,{CMD:'CLAIM',PK:k.pk,SIG:await sign(k,w.address,H.address,exp)},o);
const open=k=>inv(H,{CMD:'OPEN',VC:k.vc});
let mn=0;const mint=async(w,fl)=>{const u=h('l14:'+tag+':'+(mn++));const mr=await submit(w,{TransactionType:'URITokenMint',URI:u,...(fl?{Flags:fl}:{})});console.log('mint',mr.result,mr.hook);return sha512h(Buffer.concat([Buffer.from('0055','hex'),Buffer.from(ac.decodeAccountID(w.address)),Buffer.from(u,'hex')])).toString('hex').toUpperCase();};
// L1 wrong CLAIM before right
for(let rd=0;rd<3;rd++){const k=newKey();await pack(k,1000000);
 const s0=(await rpc('account_info',{account:A.address,ledger_index:'current'})).account_data.Sequence;const bk=newKey();
 const bad=await submit(A,{TransactionType:'Invoke',Destination:H.address,Sequence:s0,HookParameters:P({CMD:'CLAIM',PK:k.pk,SIG:await sign(bk,A.address,H.address,0,{})})},{noAccept:true});
 const good=await submit(A,{TransactionType:'Invoke',Destination:H.address,Sequence:s0+1,HookParameters:P({CMD:'CLAIM',PK:k.pk,SIG:await sign(k,A.address,H.address,0)})},{noAccept:true});await accept();
 const g1=await getTx(bad.hash),g2=await getTx(good.hash);rec('L1',`round ${rd}: wrong, then right in one ledger`,'bad sig, claiming',`${g1.hook} | ${g2.hook}`,/bad sig/.test(g1.hook)&&/claiming/.test(g2.hook)&&g1.tx.ledger_index===g2.tx.ledger_index);
 await accept();await accept();rec('L1',`round ${rd}: box paid out and erased`,'no entry',(await boxRec(k.vc))?'exists':'no',!(await boxRec(k.vc)));}
// L2 boundary EXP
for(const v of ['claim+open in exp','open in exp','claim in exp+1','open in exp+1']){const k=newKey();const exp=(await seqn())+3;await pack(k,1000000,exp);
 const target=v.includes('exp+1')?exp+1:exp-1;/*testnet: aim one ledger earlier, judge by actual ledger*/while((await seqn())<target)await accept();
 let o,c;if(v.includes('open'))o=await inv(H,{CMD:'OPEN',VC:k.vc},{noAccept:true});if(v.includes('claim'))c=await claim(A,k,exp,{noAccept:true});await accept();
 const go=o&&await getTx(o.hash),gc=c&&await getTx(c.hash);const want={'claim+open in exp':[/not expired|busy/,/claiming/],'open in exp':[/not expired/,null],'claim in exp+1':[null,/expired/],'open in exp+1':[/opened/,null]}[v];
 const lo=go&&go.tx.ledger_index,lc=gc&&gc.tx.ledger_index;const okO=!go||(lo<=exp?/not expired|busy/:/opened|unknown/).test(go.hook);const okC=!gc||(lc<=exp?/claiming/:/expired|unknown/).test(gc.hook);rec('L2',`${v} (exp=${exp}, open@${lo||'-'} claim@${lc||'-'})`,String(want)+' (by actual ledger)',`${go?go.hook:'-'} | ${gc?gc.hook:'-'}`,okO&&okC);
 for(let i=0;i<3;i++)await accept();if(await boxRec(k.vc))await open(k);}
// L4 new in v14
{const k=newKey();await pack(k,1000000);r=await open(k);rec('L4','OPEN without EXP','not expired',r.hook,/not expired/.test(r.hook));
 const k0=newKey();await pack(k0,1000000,0);r=await open(k0);rec('L4','OPEN with EXP=00000000','not expired',r.hook,/not expired/.test(r.hook));
 r=await claim(A,k,0);rec('L4','CLAIM box without EXP','claiming',r.hook,/claiming/.test(r.hook));await accept();await accept();
 const old=await sign(k0,B.address,H.address,0);r=await inv(B,{CMD:'CLAIM',PK:k0.pk,SIG:old});rec('L4','CLAIM box EXP=0','claiming',r.hook,/claiming/.test(r.hook));await accept();await accept();
 r=await pack(k0,2000000,0);const r2=await inv(B,{CMD:'CLAIM',PK:k0.pk,SIG:old});rec('L4','Repack with the same key, old signature','bad sig',r2.hook,/bad sig/.test(r2.hook));
 r=await claim(B,k0,0);rec('L4','New signature','claiming',r.hook,/claiming/.test(r.hook));await accept();await accept();
 const t=await mint(H);{const q=await submit(H,{TransactionType:'URITokenCreateSellOffer',URITokenID:t,Amount:'1000'});console.log('offer',q.result,q.hook);}r=await pack(newKey(),0,undefined,t);rec('L4','PACK of token with offer','token offer',r.hook,/token offer/.test(r.hook));
 const tb=await mint(H,1);r=await pack(newKey(),0,undefined,tb);rec('L4','PACK of burnable token','burnable',r.hook,/burnable/.test(r.hook));
 const kt=await mint(H,1);r=await pack(newKey(),1000000,undefined,undefined,{MODE:'01',KTID:kt});rec('L4','KTID burnable','burnable',r.hook,/burnable/.test(r.hook));
 const ar=sha512h(Buffer.concat([Buffer.from('0061','hex'),Buffer.from(ac.decodeAccountID(H.address))])).toString('hex').toUpperCase();
 r=await pack(newKey(),1000000,undefined,undefined,{MODE:'01',KTID:ar});rec('L4','KTID = AccountRoot','ktid',r.hook,/ktid/.test(r.hook));
 const t2=await mint(H);const kv={vc:Buffer.from(t2,'hex')};const kk=await mint(H);r=await pack(kv,1000000,undefined,undefined,{MODE:'01',KTID:kk});rec('L4','PACK VC=TID (token mode)','packed',r.hook,/packed/.test(r.hook));
 r=await pack(newKey(),1000000,undefined,t2);rec('L4','PACK of token whose ID = VC of another box','packed',r.hook,/packed/.test(r.hook));
 rec('L4','Box VC=TID in place','exists',(await boxRec(kv.vc))?'exists':'no',!!(await boxRec(kv.vc)));
 r=await open(kv);rec('L4','OPEN of token box without EXP while the key is alive','not expired',r.hook,/not expired/.test(r.hook));
 await submit(H,{TransactionType:'URITokenBurn',URITokenID:kk});r=await open(kv);rec('L4','OPEN after key burn','opened',r.hook,/opened/.test(r.hook));}
// L3 AccountDelete
{const k=newKey();r=await pack(k,1000000000);rec('L3','PACK 1000 XAH','packed',r.hook,/packed/.test(r.hook));
 for(let i=0;i<260;i++)await accept();
 r=await submit(H,{TransactionType:'AccountDelete',Destination:C.address,Fee:'5000000'});rec('L3','AccountDelete while box closed','rejected',`${r.result} / ${r.hook}`,r.result!=='tesSUCCESS');
 const ex=await rpc('account_info',{account:H.address,ledger_index:'current'});rec('L3','Hook account after','exists',ex.account_data?'exists':'DELETED',!!ex.account_data);
 if(ex.account_data){r=await claim(A,k,0);rec('L3','CLAIM after attempt','claiming',r.hook,/claiming/.test(r.hook));await accept();await accept();}}
fs.writeFileSync(process.env.OUT,JSON.stringify(rows,null,1));console.log('LOCAL',rows.filter(z=>z.ok).length+'/'+rows.length);
})().catch(e=>{console.error('CRASH',e);fs.writeFileSync(process.env.OUT,JSON.stringify(rows,null,1));process.exit(1);});
