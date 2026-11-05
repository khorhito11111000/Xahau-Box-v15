// LOCAL ONLY: 127.0.0.1:5005 standalone. Creates hook definition + per-suite local throwaway accounts.
const kp=require('../node/node_modules/ripple-keypairs');const L=require('../node/lib');const fs=require('fs');
const G={address:'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',seed:process.env.GENESIS_SEED};
const NS='7467730000000000000000000000000000000000000000000000000000000000',HOOKON='FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF10FFFFFFFCFFC1FFFBF800240';
(async()=>{const mode=process.argv[2];
if(mode==='def'){const r=await L.rpc('wallet_propose',{key_type:'secp256k1'});const d={address:r.account_id,seed:r.master_seed};
 await L.submit(G,{TransactionType:'Payment',Destination:d.address,Amount:'1000000000',Fee:'10'});
 const code=fs.readFileSync(process.env.WASM).toString('hex').toUpperCase();
 const s=await L.submit(d,{TransactionType:'SetHook',Fee:'50000000',Hooks:[{Hook:{CreateCode:code,HookOn:'0000000000000000000000000000000000000000000000000000000000400000',HookNamespace:NS,HookApiVersion:0,Flags:1}}]});
 const hh=L.sha512h(Buffer.from(code,'hex')).toString('hex').toUpperCase();const def=await L.rpc('ledger_entry',{hook_definition:hh});
 fs.writeFileSync(process.env.HHFILE,hh);console.log('def',s.result,def&&def.node?'present':'missing');return;}
const dir=process.argv[3];const acc=[];
for(let i=0;i<5;i++){const r=await L.rpc('wallet_propose',{key_type:'secp256k1'});acc.push({address:r.account_id,secret:r.master_seed});
 await L.submit(G,{TransactionType:'Payment',Destination:r.account_id,Amount:i===0?'30000000000':'5000000000',Fee:'10'});}
fs.writeFileSync(dir+'/accounts_SECRET.json',JSON.stringify(acc),{mode:0o600});console.log('accounts ok',dir);
})().catch(e=>{console.error(e);process.exit(1);});
