#include "hookapi.h"
#define ttPAYMENT 0
#define ttESCROW_CREATE 1
#define ttOFFER_CREATE 7
#define ttPAYCHAN_CREATE 13
#define ttPAYCHAN_FUND 14
#define ttCHECK_CREATE 16
#define ttURITOKEN_BURN 46
#define ttURITOKEN_CREATE_SELL_OFFER 48
#define ttREMIT 95
#define ttINVOKE 99
#define ttACCOUNT_SET 3
#define ttESCROW_CANCEL 4
#define ttREGULAR_KEY_SET 5
#define ttOFFER_CANCEL 8
#define ttCHECK_CANCEL 18
#define ttURITOKEN_BUY 47
#define ttURITOKEN_CANCEL_SELL_OFFER 49
#define NOPE(m) rollback(SBUF(m), __LINE__)
#define OK(m) accept(SBUF(m), __LINE__)
#define EQ(a,b) ((a)[0]==(b)[0]&&(a)[1]==(b)[1]&&(a)[2]==(b)[2]&&(a)[3]==(b)[3]&&(a)[4]==(b)[4]&&(a)[5]==(b)[5]&&(a)[6]==(b)[6]&&(a)[7]==(b)[7]&&(a)[8]==(b)[8]&&(a)[9]==(b)[9]&&(a)[10]==(b)[10]&&(a)[11]==(b)[11]&&(a)[12]==(b)[12]&&(a)[13]==(b)[13]&&(a)[14]==(b)[14]&&(a)[15]==(b)[15]&&(a)[16]==(b)[16]&&(a)[17]==(b)[17]&&(a)[18]==(b)[18]&&(a)[19]==(b)[19])
#define Z32(a) ((a)[0]==0&&(a)[1]==0&&(a)[2]==0&&(a)[3]==0&&(a)[4]==0&&(a)[5]==0&&(a)[6]==0&&(a)[7]==0&&(a)[8]==0&&(a)[9]==0&&(a)[10]==0&&(a)[11]==0&&(a)[12]==0&&(a)[13]==0&&(a)[14]==0&&(a)[15]==0&&(a)[16]==0&&(a)[17]==0&&(a)[18]==0&&(a)[19]==0&&(a)[20]==0&&(a)[21]==0&&(a)[22]==0&&(a)[23]==0&&(a)[24]==0&&(a)[25]==0&&(a)[26]==0&&(a)[27]==0&&(a)[28]==0&&(a)[29]==0&&(a)[30]==0&&(a)[31]==0)
#define U8(b,i) ((uint64_t)(b)[i])
#define U64(b) ((U8(b,0)<<56)|(U8(b,1)<<48)|(U8(b,2)<<40)|(U8(b,3)<<32)|(U8(b,4)<<24)|(U8(b,5)<<16)|(U8(b,6)<<8)|U8(b,7))
#define DROP(b) (U64(b)&0x3FFFFFFFFFFFFFFFULL)
#define PUT64(m,o,v) (m)[o]=(uint8_t)((v)>>56);(m)[o+1]=(uint8_t)((v)>>48);(m)[o+2]=(uint8_t)((v)>>40);(m)[o+3]=(uint8_t)((v)>>32);(m)[o+4]=(uint8_t)((v)>>24);(m)[o+5]=(uint8_t)((v)>>16);(m)[o+6]=(uint8_t)((v)>>8);(m)[o+7]=(uint8_t)(v)
#define BASE_RESERVE 1000000ULL
#define OWNER_RESERVE 200000ULL
#define MARGIN 1000000ULL
#define CLAIM_RES 100000ULL
#define CLAIM_FEE CLAIM_RES
#define ttTICKET_CREATE 10
static const uint8_t META[32]={0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11,0x11};
static const uint8_t PEND[32]={0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22,0x22};
#define LOADBAL(acc,var) do{uint8_t _k[34],_b[8];(var)=-1;if(util_keylet(SBUF(_k),KEYLET_ACCOUNT,(acc),20,0,0,0,0)==34){int64_t _s=slot_set(SBUF(_k),0);if(_s>=0&&slot_subfield(_s,sfBalance,1)>=0&&slot(SBUF(_b),1)==8)(var)=(int64_t)DROP(_b);}}while(0)
#define RESERVE_NOW(acc,out,ok) do{uint8_t _rk[34],_rb[4];uint32_t _oc;(ok)=0;if(util_keylet(SBUF(_rk),KEYLET_ACCOUNT,(acc),20,0,0,0,0)==34){int64_t _rs=slot_set(SBUF(_rk),0);if(_rs>=0&&slot_subfield(_rs,sfOwnerCount,1)>=0&&slot(SBUF(_rb),1)==4){_oc=((uint32_t)_rb[0]<<24)|((uint32_t)_rb[1]<<16)|((uint32_t)_rb[2]<<8)|_rb[3];(out)=BASE_RESERVE+(uint64_t)_oc*OWNER_RESERVE;(ok)=1;}}}while(0)
#define NATIVE(fld,var) do{uint8_t _a[8];(var)=0;if(otxn_field(SBUF(_a),(fld))==8)(var)=DROP(_a);}while(0)
#define LOCKED(id,bad) do{uint8_t _f[1];(bad)=0;if(state(SBUF(_f),(id),32)==1&&_f[0]==1)(bad)=1;}while(0)
#define MKEY(v,out) do{uint8_t _m[33];_m[0]=0x54;__builtin_memcpy(_m+1,(v),8);__builtin_memcpy(_m+9,(v)+8,8);__builtin_memcpy(_m+17,(v)+16,8);__builtin_memcpy(_m+25,(v)+24,8);if(util_sha512h((out),32,_m,33)!=32) NOPE("tgs: hash3");}while(0)
#define BKEY(v,out) do{uint8_t _m[33];_m[0]=0x42;__builtin_memcpy(_m+1,(v),8);__builtin_memcpy(_m+9,(v)+8,8);__builtin_memcpy(_m+17,(v)+16,8);__builtin_memcpy(_m+25,(v)+24,8);if(util_sha512h((out),32,_m,33)!=32) NOPE("tgs: hash4");}while(0)
static const uint8_t NCK[32]={0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66};
#define CLEAR_PEND() do{uint8_t _z[64];int _i;for(_i=0;GUARD(8),_i<8;++_i)__builtin_memset(_z+_i*8,0,8);state_set(SBUF(_z),PEND,32);}while(0)
#define U32B(b) (((uint32_t)(b)[0]<<24)|((uint32_t)(b)[1]<<16)|((uint32_t)(b)[2]<<8)|(uint32_t)(b)[3])
#define HASTOK(b,th) do{uint64_t _a0,_a1,_a2,_a3;__builtin_memcpy(&_a0,(b),8);__builtin_memcpy(&_a1,(b)+8,8);__builtin_memcpy(&_a2,(b)+16,8);__builtin_memcpy(&_a3,(b)+24,8);(th)=(_a0|_a1|_a2|_a3)!=0;}while(0)
#define FIN(b,k) do{int _t;HASTOK(b,_t);{uint64_t _dv=U64((b)+32)+CLAIM_RES;held=held>=_dv?held-_dv:0;}if(_t&&locks)locks-=1;PUT64(meta,0,held);PUT64(meta,8,locks);meta[16]=0;state_set(SBUF(meta),META,32);if(_t)state_set(0,0,(b),32);{uint8_t _mk[32];MKEY((k),_mk);state_set(0,0,_mk,32);}state_set(0,0,(k),32);}while(0)
#define RESTORE(b,k) do{int _j;(b)[44]=0;for(_j=45;GUARD(36),_j<81;++_j)(b)[_j]=0;state_set((b),85,(k),32);}while(0)
static const uint8_t AUD[32]={0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33,0x33};
static const uint8_t OCK[32]={0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44,0x44};
#define XD(sl) ({int64_t _v=slot(0,0,(sl));_v>0?((uint64_t)_v&0x3FFFFFFFFFFFFFFFULL):0;})
#define LOADOC(v) do{uint8_t _o[8];(v)=0;if(state(SBUF(_o),OCK,32)==8)(v)=U64(_o);}while(0)
static const uint8_t TRK[32]={0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55,0x55};
#define TRKLOAD(tr) do{if(state((tr),48,TRK,32)!=48){int _i;for(_i=0;GUARD(6),_i<6;++_i)__builtin_memset((tr)+_i*8,0,8);}}while(0)
#define TRKSUM(tr,live,dirty) do{int _i;int64_t _TS=0,_TQ=0;(live)=0;for(_i=0;GUARD(8),_i<8;++_i){uint8_t* _e=(tr)+_i*5;if(_e[0]){uint8_t _k[34];if(util_keylet(SBUF(_k),_e[0]==1?KEYLET_OFFER:KEYLET_CHECK,ha,20,U32B(_e+1),0,0,0)!=34) NOPE("tgs: trk");int64_t _s=slot_set(SBUF(_k),_TS);if(_s==DOESNT_EXIST){_e[0]=0;(dirty)=1;}else{if(_s<0) NOPE("tgs: trk");_TS=_s;int64_t _q=slot_subfield(_s,_e[0]==1?sfTakerGets:sfSendMax,_TQ);if(_q<0) NOPE("tgs: trk");_TQ=_q;(live)+=XD(_q);}}}}while(0)
#define SLOTU(par,fld,buf,n,ok) do{int64_t _q=slot_subfield((par),(fld),0);(ok)=_q>=0&&slot((buf),(n),_q)==(n);}while(0)
#define ACCF(F) do{uint8_t _ak[34],_ab[4];uint64_t _oc=0,_ex=locks;int _ok;if(util_keylet(SBUF(_ak),KEYLET_ACCOUNT,ha,20,0,0,0,0)!=34) NOPE("tgs: acc3");int64_t _as=slot_set(SBUF(_ak),0);if(_as<0) NOPE("tgs: acc3");\
SLOTU(_as,sfOwnerCount,_ab,4,_ok);if(_ok)_oc=U32B(_ab);\
{uint64_t _sc=1;SLOTU(_as,sfHookStateScale,_ab,2,_ok);if(_ok)_sc=((uint64_t)_ab[0]<<8)|_ab[1];if(!_sc)_sc=1;\
SLOTU(_as,sfHookStateCount,_ab,4,_ok);if(_ok)_ex+=(uint64_t)U32B(_ab)*_sc;}\
SLOTU(_as,sfTicketCount,_ab,4,_ok);if(_ok)_ex+=U32B(_ab);\
(F)=_oc>_ex?_oc-_ex:0;}while(0)
int64_t cbak(uint32_t reserved){
uint8_t p[68],id[32],box[85],meta[17],iv[32];
if(otxn_field(SBUF(iv),sfInvoiceID)==32){
if(state(SBUF(box),SBUF(iv))!=85||box[44]!=2) return accept(0,0,0);
if(otxn_id(SBUF(id),0)!=32) return accept(0,0,0);
{int i,same=1; for(i=0;GUARD(4),i<4;++i){uint64_t _a,_b;__builtin_memcpy(&_a,id+i*8,8);__builtin_memcpy(&_b,box+45+i*8,8);if(_a!=_b) same=0;}
if(!same) return accept(0,0,0);}
int ok=!reserved;
if(ok){int64_t ms=meta_slot(0);uint8_t tr[1];if(ms>=0&&slot_subfield(ms,sfTransactionResult,2)>=0&&slot(SBUF(tr),2)==1&&tr[0]!=0) ok=0;}
if(!ok){RESTORE(box,iv);return accept(0,0,0);}
if(state(SBUF(meta),META,32)!=17) return accept(0,0,0);
uint64_t held=U64(meta),locks=U64(meta+8);
FIN(box,iv);
return accept(0,0,0);
}
{int64_t _pl=state(SBUF(p),PEND,32); if((_pl!=64&&_pl!=68)||Z32(p)) return accept(0,0,0);}
if(otxn_id(SBUF(id),0)!=32) return accept(0,0,0);
int i,same=1; for(i=0;GUARD(4),i<4;++i){uint64_t _a,_b;__builtin_memcpy(&_a,id+i*8,8);__builtin_memcpy(&_b,p+32+i*8,8);if(_a!=_b) same=0;}
if(!same) return accept(0,0,0);
if(reserved){CLEAR_PEND();return accept(0,0,0);}
{int64_t ms=meta_slot(0);uint8_t tr[1];if(ms>=0&&slot_subfield(ms,sfTransactionResult,2)>=0&&slot(SBUF(tr),2)==1&&tr[0]!=0){CLEAR_PEND();return accept(0,0,0);}}
if(state(SBUF(box),p,32)!=45||box[44]){CLEAR_PEND();return accept(0,0,0);}
if(state(SBUF(meta),META,32)!=17){CLEAR_PEND();return accept(0,0,0);}
if(state_set(0,0,p,32)<0) return accept(0,0,0);
uint64_t held=U64(meta),locks=U64(meta+8); int hn=0,haa=0;
for(i=0;GUARD(4),i<4;++i){uint64_t _a;__builtin_memcpy(&_a,box+i*8,8);if(_a) hn=1;}
for(i=0;GUARD(8),i<8;++i) if(box[32+i]) haa=1;
{uint64_t dv=U64(box+32)+CLAIM_RES; held=held>=dv?held-dv:0;}
if(hn&&locks) locks-=1;
PUT64(meta,0,held); PUT64(meta,8,locks); meta[16]=0;
state_set(SBUF(meta),META,32);
if(hn) state_set(0,0,box,32);
{uint8_t mk[32];MKEY(p,mk);state_set(0,0,mk,32);}
CLEAR_PEND();
return accept(0,0,0);
}
int64_t hook(uint32_t reserved){
_g(1,1);
uint8_t ha[20],oa[20],meta[17],cmd[8],vc[32],box[85],pend[68];
if(hook_account(SBUF(ha))!=20) NOPE("tgs: acc");
if(otxn_field(SBUF(oa),sfAccount)!=20) NOPE("tgs: acc2");
if(state(SBUF(meta),META,32)!=17){int i;for(i=0;GUARD(17),i<17;++i) meta[i]=0;}
meta[16]=0;
uint64_t held=U64(meta), locks=U64(meta+8);
int64_t pl=state(SBUF(pend),PEND,32);
int busy=(pl==64||pl==68)&&!Z32(pend), synced=0;
if(busy){
uint32_t pls=pl==68?(((uint32_t)pend[64]<<24)|((uint32_t)pend[65]<<16)|((uint32_t)pend[66]<<8)|pend[67]):0;
if((uint32_t)ledger_seq()>pls+1){
uint8_t sb[45];
if(state(SBUF(sb),pend,32)==45){
int th=0,fin=1,j;
for(j=0;GUARD(4),j<4;++j){uint64_t _a;__builtin_memcpy(&_a,sb+j*8,8);if(_a) th=1;}
if(th){uint8_t k[34],ow[20]; if(util_keylet(SBUF(k),KEYLET_UNCHECKED,sb,32,0,0,0,0)==34){int64_t s=slot_set(SBUF(k),0); if(s>=0&&slot_subfield(s,sfOwner,1)>=0&&slot(SBUF(ow),1)==20&&EQ(ow,ha)) fin=0;}}
if(fin){
uint64_t dv=U64(sb+32)+CLAIM_RES; held=held>=dv?held-dv:0; if(th&&locks) locks-=1;
PUT64(meta,0,held); PUT64(meta,8,locks); meta[16]=0;
if(state_set(SBUF(meta),META,32)!=17) NOPE("tgs: meta");
if(th&&state_set(0,0,sb,32)<0) NOPE("tgs: unlock");
{uint8_t mk[32];MKEY(pend,mk);if(state_set(0,0,mk,32)<0) NOPE("tgs: unmode");}
if(state_set(0,0,pend,32)<0) NOPE("tgs: mark");
}
}
CLEAR_PEND(); busy=0; synced=1;
}
}
if(EQ(ha,oa)&&otxn_type()!=ttINVOKE){
uint8_t tid[32]; int bad=0;
if(otxn_field(SBUF(tid),sfURITokenID)==32){LOCKED(tid,bad); if(bad) NOPE("tgs: locked");}
uint8_t ids[1026];
int64_t n=otxn_field(SBUF(ids),sfURITokenIDs);
if(n!=DOESNT_EXIST){
if(n<2) NOPE("tgs: list");
int32_t h=1,L=ids[0];
if(L>192){ if(L>240) NOPE("tgs: list"); h=2; L=193+((L-193)<<8)+ids[1]; }
if(L<32||(L&31)||L>1024||h+L!=n) NOPE("tgs: list");
int k=L>>5,i;
for(i=0;GUARD(32),i<k;++i){ uint8_t* id=ids+h+(i<<5); LOCKED(id,bad); if(bad) NOPE("tgs: locked"); }
}
uint32_t tt=otxn_type();
uint64_t spend=0,one=0,fee=0,rv,extra=0;
int mk=!(tt==ttPAYMENT||tt==ttREMIT||tt==ttACCOUNT_SET||tt==ttREGULAR_KEY_SET||tt==ttOFFER_CANCEL||tt==ttCHECK_CANCEL||tt==ttESCROW_CANCEL||tt==ttPAYCHAN_FUND||tt==ttURITOKEN_BURN||tt==ttURITOKEN_CREATE_SELL_OFFER||tt==ttURITOKEN_CANCEL_SELL_OFFER);
if(tt==ttPAYMENT){NATIVE(sfAmount,one); spend=one; NATIVE(sfSendMax,one); if(one>spend) spend=one;}
uint64_t oc,add=0,live,unt; uint8_t tr[48]; int tdirty=0; LOADOC(oc); TRKLOAD(tr);
TRKSUM(tr,live,tdirty); unt=oc; oc+=live;
if(tt==ttCHECK_CREATE){NATIVE(sfSendMax,add);}
if(tt==ttESCROW_CREATE||tt==ttPAYCHAN_CREATE||tt==ttPAYCHAN_FUND||tt==ttURITOKEN_BUY){NATIVE(sfAmount,one); spend+=one;}
if(tt==ttOFFER_CREATE){NATIVE(sfTakerGets,add);}
if(tt==ttREMIT){
uint8_t am[512]; int64_t an=otxn_field(SBUF(am),sfAmounts);
if(an>512||(an<0&&an!=DOESNT_EXIST)) NOPE("tgs: amounts");
if(an>0){int i; for(i=0;GUARD(32),i<32;++i){
int64_t loc=sto_subarray(am,an,i); if(loc<0) break;
int32_t o=(int32_t)(loc>>32), ln=(int32_t)loc;
if(o<0||ln<8||o+ln>an) NOPE("tgs: amounts");
uint8_t* e=am+o; int32_t bl=ln; int64_t in=sto_subfield(e,ln,sfAmount);
if(in<0){int64_t wr=sto_subfield(e,ln,sfAmountEntry); if(wr>=0){int32_t wo=(int32_t)(wr>>32), wl=(int32_t)wr; if(wo>=0&&wl>0&&wo+wl<=ln){e+=wo; bl=wl; in=sto_subfield(e,bl,sfAmount);}}}
if(in>=0){int32_t io=(int32_t)(in>>32), il=(int32_t)in; if(il==8&&io>=0&&io+8<=bl) spend+=DROP(e+io);}
}}
{uint8_t mu[1]; if(otxn_field(SBUF(mu),sfMintURIToken)!=DOESNT_EXIST) extra+=OWNER_RESERVE;}
{uint8_t da[20],dk[34]; if(otxn_field(SBUF(da),sfDestination)==20&&util_keylet(SBUF(dk),KEYLET_ACCOUNT,da,20,0,0,0,0)==34&&slot_set(SBUF(dk),0)==DOESNT_EXIST) extra+=BASE_RESERVE;}
}
if(otxn_field(SBUF(tid),sfFee)==8) fee=DROP(tid);
int64_t bal; LOADBAL(ha,bal);
{int ok; RESERVE_NOW(ha,rv,ok); if(!ok) NOPE("tgs: reserve");}
uint64_t nx=1; if(tt==ttTICKET_CREATE){uint8_t tc[4]; if(otxn_field(SBUF(tc),sfTicketCount)==4) nx=((uint64_t)tc[0]<<24)|((uint64_t)tc[1]<<16)|((uint64_t)tc[2]<<8)|tc[3];}
uint64_t pad=mk?nx*OWNER_RESERVE+MARGIN:0;
if(add&&held&&(bal<0||(uint64_t)bal<held+oc+add+fee+rv+pad)) {if(tt==ttOFFER_CREATE) NOPE("tgs: offer"); NOPE("tgs: check");}
if(held||spend){ if(bal<0||(uint64_t)bal<held+(held?oc:0)+spend+fee+rv+extra+pad) NOPE("tgs: reserve"); }
if(add){int _i,_f=-1;uint8_t _sq[4];for(_i=0;GUARD(8),_i<8;++_i) if(_f<0&&!tr[_i*5]) _f=_i;
if(otxn_field(SBUF(_sq),sfSequence)!=4) NOPE("tgs: seq");
if(!U32B(_sq)&&otxn_field(SBUF(_sq),sfTicketSequence)!=4) NOPE("tgs: seq");
if(_f>=0){uint64_t _g=U64(tr+40)+1;tr[_f*5]=tt==ttOFFER_CREATE?1:2;tr[_f*5+1]=_sq[0];tr[_f*5+2]=_sq[1];tr[_f*5+3]=_sq[2];tr[_f*5+4]=_sq[3];PUT64(tr,40,_g);tdirty=1;}
else{uint8_t _o[8];unt+=add;PUT64(_o,0,unt);if(state_set(SBUF(_o),OCK,32)!=8) NOPE("tgs: ocommit");}}
if(tdirty&&state_set(tr,48,TRK,32)!=48) NOPE("tgs: trk");
OK("tgs: out");
}
if(otxn_type()==ttURITOKEN_BUY){uint8_t t2[32];int b2=0;if(otxn_field(SBUF(t2),sfURITokenID)==32){LOCKED(t2,b2);if(b2) NOPE("tgs: locked");}}
if(otxn_type()!=ttINVOKE) OK("tgs: skip");
if(EQ(ha,oa)){uint8_t dz[20]; if(otxn_field(SBUF(dz),sfDestination)==20&&!EQ(dz,ha)) OK("tgs: pass");}
int64_t nc=otxn_param(SBUF(cmd),"CMD",3);
if(nc<4) NOPE("tgs: cmd");
int pack=nc==4&&cmd[0]=='P'&&cmd[1]=='A'&&cmd[2]=='C'&&cmd[3]=='K';
int claim=nc==5&&cmd[0]=='C'&&cmd[1]=='L'&&cmd[2]=='A'&&cmd[3]=='I'&&cmd[4]=='M';
int open=nc==4&&cmd[0]=='O'&&cmd[1]=='P'&&cmd[2]=='E'&&cmd[3]=='N';
int sync=nc==4&&cmd[0]=='S'&&cmd[1]=='Y'&&cmd[2]=='N'&&cmd[3]=='C';
if(sync&&otxn_param(SBUF(vc),"VC",2)!=32){ if(synced) OK("tgs: synced"); if(busy) NOPE("tgs: pending"); NOPE("tgs: idle"); }
if(busy&&(pack||claim||open)) NOPE("tgs: busy");
if(pack){
if(!EQ(ha,oa)) NOPE("tgs: owner");
if(otxn_param(SBUF(vc),"VC",2)!=32) NOPE("tgs: vc");
if(Z32(vc)||EQ(vc,PEND)) NOPE("tgs: vc");
uint8_t md[1],ktid[32]; int tok=0;
{int64_t nm=otxn_param(SBUF(md),"MODE",4);
if(nm==DOESNT_EXIST) md[0]=0;
else if(nm!=1||md[0]>1) NOPE("tgs: mode");
tok=md[0];}
if(tok){ if(otxn_param(SBUF(ktid),"KTID",4)!=32||Z32(ktid)) NOPE("tgs: ktid");
{uint8_t kk[34],lt[2],fl[4];int64_t ks;if(util_keylet(SBUF(kk),KEYLET_UNCHECKED,ktid,32,0,0,0,0)!=34||(ks=slot_set(SBUF(kk),0))<0) NOPE("tgs: ktid");
{int64_t q=slot_subfield(ks,sfLedgerEntryType,0);if(q<0||slot(SBUF(lt),q)!=2||lt[0]!=0||lt[1]!=0x55) NOPE("tgs: ktid");
q=slot_subfield(ks,sfFlags,0);if(q>=0&&slot(SBUF(fl),q)==4&&(fl[3]&1)) NOPE("tgs: burnable");
{uint8_t ki[20];q=slot_subfield(ks,sfIssuer,0);if(q<0||slot(SBUF(ki),q)!=20||!EQ(ki,ha)) NOPE("tgs: key issuer");}
{uint8_t ko[20];q=slot_subfield(ks,sfOwner,0);if(q<0||slot(SBUF(ko),q)!=20||!EQ(ko,ha)) NOPE("tgs: key owner");}}} }
uint8_t tid[32],amt[8],exp[4];
if(otxn_param(SBUF(tid),"TID",3)!=32) NOPE("tgs: tid");
if(otxn_param(SBUF(amt),"AMT",3)!=8) NOPE("tgs: amt");
if((amt[0]&0xC0)||U64(amt)>100000000000000000ULL) NOPE("tgs: amt");
int64_t ne=otxn_param(SBUF(exp),"EXP",3);
if(ne<0) exp[0]=exp[1]=exp[2]=exp[3]=0;
else if(ne!=4) NOPE("tgs: exp");
{uint32_t ev=((uint32_t)exp[0]<<24)|((uint32_t)exp[1]<<16)|((uint32_t)exp[2]<<8)|exp[3]; if(ev&&ev<=(uint32_t)ledger_seq()) NOPE("tgs: exp past");}
int hn=0,haa=0,i,bad=0;
for(i=0;GUARD(4),i<4;++i){uint64_t _a;__builtin_memcpy(&_a,tid+i*8,8);if(_a) hn=1;}
for(i=0;GUARD(8),i<8;++i) if(amt[i]) haa=1;
if(!hn&&!haa) NOPE("tgs: empty");
if(hn){
LOCKED(tid,bad); if(bad) NOPE("tgs: locked");
uint8_t k[34],ow[20];
if(util_keylet(SBUF(k),KEYLET_UNCHECKED,tid,32,0,0,0,0)!=34) NOPE("tgs: token");
int64_t s=slot_set(SBUF(k),0);
if(s<0) NOPE("tgs: token");
if(slot_subfield(s,sfAmount,0)>=0) NOPE("tgs: token offer");
{uint8_t fl[4];int64_t q=slot_subfield(s,sfFlags,0);if(q>=0&&slot(SBUF(fl),q)==4&&(fl[3]&1)) NOPE("tgs: burnable");}
if(slot_subfield(s,sfOwner,1)<0||slot(SBUF(ow),1)!=20||!EQ(ow,ha)) NOPE("tgs: token");
}
if(tok){ int same=hn,j; for(j=0;GUARD(4),j<4;++j){uint64_t _a,_b;__builtin_memcpy(&_a,ktid+j*8,8);__builtin_memcpy(&_b,tid+j*8,8);if(_a!=_b) same=0;}
if(same) NOPE("tgs: ktid=tid"); LOCKED(ktid,bad); if(bad) NOPE("tgs: ktid locked"); }
if(haa||hn){
{uint64_t F; ACCF(F); if(hn&&F) F-=1;
if(F>1){uint8_t au[41]; if(!(state(SBUF(au),AUD,32)==41&&au[16]&&F<=U64(au+8))) NOPE("tgs: audit");}}
uint8_t fee[8]; uint64_t f=0,rv,extra=1;
if(otxn_field(SBUF(fee),sfFee)==8) f=DROP(fee);
if(hn) extra=2;
if(tok) extra+=1;
{uint8_t nb[4];if(state(SBUF(nb),NCK,32)!=4) extra+=1;}
int64_t bal; LOADBAL(ha,bal); uint64_t oc; LOADOC(oc);
{uint8_t tr[48];int td=0;uint64_t lv;TRKLOAD(tr);
TRKSUM(tr,lv,td);oc+=lv;}
{int ok; RESERVE_NOW(ha,rv,ok); if(!ok) NOPE("tgs: reserve");}
if(bal<0||(uint64_t)bal<held+oc+U64(amt)+CLAIM_RES+f+rv+extra*OWNER_RESERVE+MARGIN) NOPE("tgs: not enough");
}
uint8_t bk[32]; BKEY(vc,bk);
if(state(SBUF(box),SBUF(bk))>0) NOPE("tgs: exists");
for(i=0;GUARD(4),i<4;++i) __builtin_memcpy(box+i*8,tid+i*8,8);
for(i=0;GUARD(8),i<8;++i) box[32+i]=amt[i];
box[40]=exp[0];box[41]=exp[1];box[42]=exp[2];box[43]=exp[3];box[44]=0;
for(i=45;GUARD(36),i<81;++i) box[i]=0;
{uint8_t nb[4];uint32_t nv=0;if(state(SBUF(nb),NCK,32)==4) nv=U32B(nb);nv+=1;nb[0]=(uint8_t)(nv>>24);nb[1]=(uint8_t)(nv>>16);nb[2]=(uint8_t)(nv>>8);nb[3]=(uint8_t)nv;
box[81]=nb[0];box[82]=nb[1];box[83]=nb[2];box[84]=nb[3];if(state_set(SBUF(nb),NCK,32)!=4) NOPE("tgs: nonce");}
if(state_set(SBUF(box),SBUF(bk))!=85) NOPE("tgs: pack");
if(tok){uint8_t mk[32],rec[33];int j;MKEY(bk,mk);rec[0]=1;
for(j=0;GUARD(4),j<4;++j)__builtin_memcpy(rec+1+j*8,ktid+j*8,8);if(state_set(SBUF(rec),mk,32)!=33) NOPE("tgs: mode");}
held+=U64(amt)+CLAIM_RES;
if(hn) locks+=1;
PUT64(meta,0,held); PUT64(meta,8,locks); meta[16]=0;
if(state_set(SBUF(meta),META,32)!=17) NOPE("tgs: meta");
if(hn){uint8_t one[1];one[0]=1;if(state_set(SBUF(one),SBUF(tid))!=1) NOPE("tgs: lock");}
OK("tgs: packed");
}
if(nc==5&&cmd[0]=='A'&&cmd[1]=='U'&&cmd[2]=='D'&&cmd[3]=='I'&&cmd[4]=='T'){
if(!EQ(ha,oa)) NOPE("tgs: owner");
uint64_t F; ACCF(F);
uint8_t au[41],tr[48],dk[34],rk[32],ix[1026],ek[34],ac[20],tg[8]; int j,p,done=0,bad=0; int64_t DS=0,ES=0,SS=0; uint64_t pg=0,sm=0,oc,o0,lv,gn; int td=0; LOADOC(oc); o0=oc; TRKLOAD(tr); gn=U64(tr+40);
if(state(SBUF(au),AUD,32)==41&&!au[16]&&U64(au+8)==F&&U64(au+33)==gn){pg=U64(au);sm=U64(au+17);o0=U64(au+25);}
if(util_keylet(SBUF(dk),KEYLET_OWNER_DIR,ha,20,0,0,0,0)!=34) NOPE("tgs: dir");
for(j=0;GUARD(32),j<32;++j) rk[j]=dk[2+j];
for(p=0;GUARD(4),p<3;++p){
if(util_keylet(SBUF(dk),KEYLET_PAGE,rk,32,(uint32_t)(pg>>32),(uint32_t)pg,0,0)!=34) NOPE("tgs: dir");
int64_t ds=slot_set(SBUF(dk),DS); if(ds<0){done=1;break;} DS=ds;
int64_t nn=0; {int64_t q=slot_subfield(ds,sfIndexes,SS); if(q>=0){SS=q; nn=slot(SBUF(ix),SS);}}
int32_t h=1,L=0; if(nn>=1){L=ix[0]; if(L>192){h=2;L=193+((L-193)<<8)+ix[1];}}
if(nn>0&&(h+L!=nn||(L&31))) NOPE("tgs: dir");
int k=nn>0?(L>>5):0,e; if(k>32) k=32;
for(e=0;GUARD(99),e<k;++e){
util_keylet(SBUF(ek),KEYLET_UNCHECKED,ix+h+(e<<5),32,0,0,0,0);
int64_t es=slot_set(SBUF(ek),ES); if(es<0) continue; ES=es;
int64_t q=slot_subfield(es,sfTakerGets,SS);
if(q>=0){SS=q; if(slot_type(SS,1)==1) sm+=XD(SS);}
else{ q=slot_subfield(es,sfSendMax,SS); if(q>=0){SS=q; if(slot_type(SS,1)==1){ int64_t cv=XD(SS); q=slot_subfield(es,sfAccount,SS); if(q>=0){SS=q; if(slot(SBUF(ac),SS)==20){uint64_t a1,a2,b1,b2;uint32_t a3,b3;__builtin_memcpy(&a1,ac,8);__builtin_memcpy(&b1,ha,8);__builtin_memcpy(&a2,ac+8,8);__builtin_memcpy(&b2,ha+8,8);__builtin_memcpy(&a3,ac+16,4);__builtin_memcpy(&b3,ha+16,4); if(a1==b1&&a2==b2&&a3==b3) sm+=cv;}}}}}
}
if(bad) break;
{int64_t q=slot_subfield(ds,sfIndexNext,SS); if(q<0){done=1;break;} SS=q; if(slot(SBUF(tg),SS)!=8){done=1;break;} pg=U64(tg); if(!pg){done=1;break;}}
}
if(bad) NOPE("tgs: objects");
PUT64(au,0,pg); PUT64(au,8,F); au[16]=(uint8_t)done; PUT64(au,17,sm); PUT64(au,25,o0); PUT64(au,33,gn);
if(done){uint8_t _o[8];TRKSUM(tr,lv,td);if(td&&state_set(tr,48,TRK,32)!=48) NOPE("tgs: trk");oc=(sm>lv?sm-lv:0)+(oc>o0?oc-o0:0);PUT64(_o,0,oc);if(state_set(SBUF(_o),OCK,32)!=8) NOPE("tgs: ocommit");}
if(state_set(SBUF(au),AUD,32)!=41) NOPE("tgs: audit");
if(done) OK("tgs: audited");
OK("tgs: audit more");
}
if(!(claim||open||sync)) NOPE("tgs: cmd");
uint8_t key[32],pk[33],sig[72],net[4];
int64_t sl=0; int tclaim=0;
if(claim&&otxn_param(SBUF(pk),"PK",2)==DOESNT_EXIST&&otxn_param(SBUF(vc),"VC",2)==32) tclaim=1;
if(tclaim){
if(Z32(vc)||EQ(vc,PEND)) NOPE("tgs: vc");
int j; for(j=0;GUARD(4),j<4;++j) __builtin_memcpy(key+j*8,vc+j*8,8);
}else if(claim){
if(otxn_param(SBUF(pk),"PK",2)!=33) NOPE("tgs: pk");
sl=otxn_param(SBUF(sig),"SIG",3);
if(sl<64||sl>72) NOPE("tgs: sig");
if(otxn_field(SBUF(net),sfNetworkID)!=4) NOPE("tgs: net");
if(util_sha512h(SBUF(key),SBUF(pk))!=32) NOPE("tgs: hash");
}else if(sync){
int j; for(j=0;GUARD(4),j<4;++j) __builtin_memcpy(key+j*8,vc+j*8,8);
}else{
if(!EQ(ha,oa)) NOPE("tgs: owner");
if(otxn_param(SBUF(vc),"VC",2)!=32) NOPE("tgs: vc");
int j; for(j=0;GUARD(4),j<4;++j) __builtin_memcpy(key+j*8,vc+j*8,8);
}
uint8_t vk[32]; {int j; for(j=0;GUARD(4),j<4;++j) __builtin_memcpy(vk+j*8,key+j*8,8);} BKEY(vk,key);
{int64_t bl=state(SBUF(box),SBUF(key)); if(bl!=85) NOPE("tgs: unknown");}
if(box[44]==2){
if((uint32_t)ledger_seq()<=U32B(box+77)+1) NOPE("tgs: busy");
int th,fin=1; HASTOK(box,th);
if(th){uint8_t k[34],ow[20]; if(util_keylet(SBUF(k),KEYLET_UNCHECKED,box,32,0,0,0,0)==34){int64_t s=slot_set(SBUF(k),0); if(s>=0&&slot_subfield(s,sfOwner,1)>=0&&slot(SBUF(ow),1)==20&&EQ(ow,ha)) fin=0;}}
if(fin){FIN(box,key); OK("tgs: synced");}
RESTORE(box,key);
if(sync) OK("tgs: synced");
}
else if(box[44]) NOPE("tgs: claimed");
if(sync) NOPE("tgs: idle");
if(claim){
uint8_t mk[32],rec[33]; int tm=0;
MKEY(key,mk);
if(state(SBUF(rec),mk,32)==33&&rec[0]==1) tm=1;
if(!tclaim&&tm) NOPE("tgs: token box");
if(tclaim&&!tm) NOPE("tgs: key box");
if(tclaim){
uint8_t k[34],ow[20];
if(util_keylet(SBUF(k),KEYLET_UNCHECKED,rec+1,32,0,0,0,0)!=34) NOPE("tgs: ktoken");
int64_t s=slot_set(SBUF(k),0);
if(s<0||slot_subfield(s,sfOwner,1)<0||slot(SBUF(ow),1)!=20||!EQ(ow,oa)) NOPE("tgs: not holder");
}
}
if(claim&&!tclaim){
uint8_t msg[124],dig[32]; int i;
for(i=0;GUARD(20),i<20;++i){msg[i]=oa[i];msg[52+i]=ha[i];}
for(i=0;GUARD(4),i<4;++i){__builtin_memcpy(msg+20+i*8,vk+i*8,8);__builtin_memcpy(msg+80+i*8,box+i*8,8);}
__builtin_memcpy(msg+112,box+32,8);msg[120]=box[81];msg[121]=box[82];msg[122]=box[83];msg[123]=box[84];
msg[72]=net[0];msg[73]=net[1];msg[74]=net[2];msg[75]=net[3];
msg[76]=box[40];msg[77]=box[41];msg[78]=box[42];msg[79]=box[43];
if(util_sha512h(SBUF(dig),SBUF(msg))!=32) NOPE("tgs: hash2");
if(!util_verify(dig,32,sig,sl,pk,33)) NOPE("tgs: bad sig");
}
uint32_t exp=((uint32_t)box[40]<<24)|((uint32_t)box[41]<<16)|((uint32_t)box[42]<<8)|box[43];
uint32_t now=(uint32_t)ledger_seq();
if(open){ if(exp&&now<=exp) NOPE("tgs: not expired");
if(!exp){int gone=0;uint8_t mk[32],rec[33];MKEY(key,mk);if(state(SBUF(rec),mk,32)==33&&rec[0]==1){uint8_t k[34];if(util_keylet(SBUF(k),KEYLET_UNCHECKED,rec+1,32,0,0,0,0)==34&&slot_set(SBUF(k),0)==DOESNT_EXIST) gone=1;}
if(!gone) NOPE("tgs: not expired");} }
else if(exp&&now>exp) NOPE("tgs: expired");
int hn=0,haa=0,i;
for(i=0;GUARD(4),i<4;++i){uint64_t _a;__builtin_memcpy(&_a,box+i*8,8);if(_a) hn=1;}
for(i=0;GUARD(8),i<8;++i) if(box[32+i]) haa=1;
if(claim&&(hn||haa)){
uint64_t txw[48];
for(i=0;GUARD(48),i<48;++i) txw[i]=0;
uint8_t* txn=(uint8_t*)txw;
txn[0]=0x12;txn[1]=0x00;txn[2]=0x5F;txn[3]=0x22;txn[4]=0x80;txn[8]=0x24;
txn[13]=0x20;txn[14]=0x1A;txn[19]=0x20;txn[20]=0x1B;txn[25]=0x50;txn[26]=0x11;
for(i=0;GUARD(32),i<32;++i) txn[27+i]=key[i];
txn[59]=0x68;txn[60]=0x40;
txn[68]=0x73;txn[69]=0x21;txn[103]=0x81;txn[104]=0x14;txn[125]=0x83;txn[126]=0x14;
for(i=0;GUARD(20),i<20;++i){txn[105+i]=ha[i];txn[127+i]=oa[i];}
uint32_t fls=now+1, lls=fls+4;
txn[15]=(uint8_t)(fls>>24);txn[16]=(uint8_t)(fls>>16);txn[17]=(uint8_t)(fls>>8);txn[18]=(uint8_t)fls;
txn[21]=(uint8_t)(lls>>24);txn[22]=(uint8_t)(lls>>16);txn[23]=(uint8_t)(lls>>8);txn[24]=(uint8_t)lls;
etxn_reserve(1);
int64_t ed=etxn_details(txn+147,138);
if(ed!=116&&ed!=138) NOPE("tgs: details");
uint32_t o=147+(uint32_t)ed;
if(haa){
txn[o++]=0xF0;txn[o++]=0x5C;txn[o++]=0xE0;txn[o++]=0x5B;txn[o++]=0x61;
txn[o++]=(uint8_t)(0x40|(box[32]&0x3F));
for(i=1;GUARD(7),i<8;++i) txn[o++]=box[32+i];
txn[o++]=0xE1;txn[o++]=0xF1;
}
if(hn){
txn[o++]=0x00;txn[o++]=0x13;txn[o++]=0x63;txn[o++]=0x20;
for(i=0;GUARD(4),i<4;++i){__builtin_memcpy(txn+o,box+i*8,8);o+=8;}
}
int64_t fee=etxn_fee_base(txn,o);
if(fee<0) NOPE("tgs: fee");
uint64_t fv=(uint64_t)fee,rv;
int64_t bal; LOADBAL(ha,bal);
{int ok; RESERVE_NOW(ha,rv,ok); if(!ok) NOPE("tgs: reserve");}
{uint64_t need=held+rv+fv; need=need>CLAIM_FEE?need-CLAIM_FEE:0; if(bal<0||(uint64_t)bal<need) NOPE("tgs: reserve");}
txn[60]=(uint8_t)(0x40|((fv>>56)&0x3F));
txn[61]=(uint8_t)(fv>>48);txn[62]=(uint8_t)(fv>>40);txn[63]=(uint8_t)(fv>>32);
txn[64]=(uint8_t)(fv>>24);txn[65]=(uint8_t)(fv>>16);txn[66]=(uint8_t)(fv>>8);txn[67]=(uint8_t)fv;
uint8_t hx[32];
if(emit(SBUF(hx),txn,o)!=32) NOPE("tgs: emit");
box[44]=2; for(i=0;GUARD(4),i<4;++i) __builtin_memcpy(box+45+i*8,hx+i*8,8);
box[77]=(uint8_t)(lls>>24);box[78]=(uint8_t)(lls>>16);box[79]=(uint8_t)(lls>>8);box[80]=(uint8_t)lls;
if(state_set(box,85,SBUF(key))!=85) NOPE("tgs: pend");
OK("tgs: claiming");
}
if(state_set(0,0,SBUF(key))<0) NOPE("tgs: mark");
{uint64_t dv=U64(box+32)+CLAIM_RES; held=held>=dv?held-dv:0;}
if(hn&&locks) locks-=1;
PUT64(meta,0,held); PUT64(meta,8,locks); meta[16]=0;
if(state_set(SBUF(meta),META,32)!=17) NOPE("tgs: meta");
if(hn){if(state_set(0,0,box,32)<0) NOPE("tgs: unlock");}
{uint8_t mk[32];MKEY(key,mk);if(state_set(0,0,mk,32)<0) NOPE("tgs: unmode");}
if(open) OK("tgs: opened");
OK("tgs: claimed");
}