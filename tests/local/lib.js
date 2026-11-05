const kp=require('ripple-keypairs');const crypto=require('crypto');
const URL=process.env.RPC||'http://127.0.0.1:5005';const NET=Number(process.env.NETID||21337);
async function rpc(method,params={}){const r=await fetch(URL,{method:'POST',body:JSON.stringify({method,params:[params]})});return (await r.json()).result;}
const h=s=>Buffer.from(s).toString('hex').toUpperCase();
const sha512h=b=>crypto.createHash('sha512').update(b).digest().subarray(0,32);
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n);return b};
const u64=n=>{const b=Buffer.alloc(8);b.writeBigUInt64BE(BigInt(n));return b};
const P=(o)=>Object.entries(o).map(([k,v])=>({HookParameter:{HookParameterName:h(k),HookParameterValue:(Buffer.isBuffer(v)?v.toString('hex'):(/^([0-9A-Fa-f]{2})*$/.test(v)?v:h(v))).toUpperCase()}}));
const accept=()=>rpc('ledger_accept');
async function seq(){return (await rpc('ledger_current')).ledger_current_index;}
async function submit(w,tx,{noAccept=false}={}){
 tx={Account:w.address,NetworkID:NET,Fee:tx.Fee||'200000',...tx};
 const r=await rpc('submit',{tx_json:tx,secret:w.seed,fee_mult_max:100000});
 if(!r.tx_json||!r.engine_result) {console.log('SUBMIT ERR',r.error_message||r.error);return {engine:r.error,result:r.error,hook:'',emit:[]};}
 const hash=r.tx_json.hash; if(noAccept) return {hash,engine:r.engine_result};
 await accept(); return await getTx(hash,r.engine_result);
}
async function getTx(hash,engine){
 const t=await rpc('tx',{transaction:hash});
 const m=t.meta||{};const hx=(m.HookExecutions||[]).map(e=>e.HookExecution);
 const ret=hx.length===0?'(hook not called)':hx.map(e=>Buffer.from(e.HookReturnString||'','hex').toString().replace(/\0/g,'')).join(' | ');
 return {hash,engine,result:m.TransactionResult||t.error,hook:ret,emit:(m.HookEmissions||[]).map(e=>e.HookEmission.EmittedTxnID),meta:m,tx:t};
}
async function bal(a){a=a.address||a;const r=await rpc('account_info',{account:a,ledger_index:'current'});return r.account_data?Number(r.account_data.Balance)/1e6:null;}
async function ownerCount(a){const r=await rpc('account_info',{account:a,ledger_index:'current'});return r.account_data.OwnerCount;}
module.exports={kp,rpc,h,sha512h,u32,u64,P,accept,seq,submit,getTx,bal,ownerCount,NET,crypto};
