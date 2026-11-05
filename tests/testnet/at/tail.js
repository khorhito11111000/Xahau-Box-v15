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
