/**
 * Hook API include file
 *
 * Note to the reader:
 * This include defines two types of things: external functions and macros
 * Functions are used sparingly because a non-inlining compiler may produce
 * undesirable output.
 *
 * Find documentation here: https://xrpl-hooks.readme.io/reference/
 */

#ifndef HOOKAPI_INCLUDED
#define HOOKAPI_INCLUDED 1

#define KEYLET_HOOK 1
#define KEYLET_HOOK_STATE 2
#define KEYLET_ACCOUNT 3
#define KEYLET_AMENDMENTS 4
#define KEYLET_CHILD 5
#define KEYLET_SKIP 6
#define KEYLET_FEES 7
#define KEYLET_NEGATIVE_UNL 8
#define KEYLET_LINE 9
#define KEYLET_OFFER 10
#define KEYLET_QUALITY 11
#define KEYLET_EMITTED_DIR 12
#define KEYLET_TICKET 13
#define KEYLET_SIGNERS 14
#define KEYLET_CHECK 15
#define KEYLET_DEPOSIT_PREAUTH 16
#define KEYLET_UNCHECKED 17
#define KEYLET_OWNER_DIR 18
#define KEYLET_PAGE 19
#define KEYLET_ESCROW 20
#define KEYLET_PAYCHAN 21
#define KEYLET_EMITTED 22
#define KEYLET_NFT_OFFER 23
#define KEYLET_HOOK_DEFINITION 24
#define KEYLET_HOOK_STATE_DIR 25
#define KEYLET_CRON 26
#define KEYLET_MANIFEST 37

#define COMPARE_EQUAL 1U
#define COMPARE_LESS 2U
#define COMPARE_GREATER 4U

// For documentation please see: https://xrpl-hooks.readme.io/reference/
// Generated using generate_error.sh
#ifndef HOOK_ERROR_CODES
#define SUCCESS 0
#define OUT_OF_BOUNDS -1
#define INTERNAL_ERROR -2
#define TOO_BIG -3
#define TOO_SMALL -4
#define DOESNT_EXIST -5
#define NO_FREE_SLOTS -6
#define INVALID_ARGUMENT -7
#define ALREADY_SET -8
#define PREREQUISITE_NOT_MET -9
#define FEE_TOO_LARGE -10
#define EMISSION_FAILURE -11
#define TOO_MANY_NONCES -12
#define TOO_MANY_EMITTED_TXN -13
#define NOT_IMPLEMENTED -14
#define INVALID_ACCOUNT -15
#define GUARD_VIOLATION -16
#define INVALID_FIELD -17
#define PARSE_ERROR -18
#define RC_ROLLBACK -19
#define RC_ACCEPT -20
#define NO_SUCH_KEYLET -21
#define NOT_AN_ARRAY -22
#define NOT_AN_OBJECT -23
#define INVALID_FLOAT -10024
#define DIVISION_BY_ZERO -25
#define MANTISSA_OVERSIZED -26
#define MANTISSA_UNDERSIZED -27
#define EXPONENT_OVERSIZED -28
#define EXPONENT_UNDERSIZED -29
#define XFL_OVERFLOW -30
#define NOT_IOU_AMOUNT -31
#define NOT_AN_AMOUNT -32
#define CANT_RETURN_NEGATIVE -33
#define NOT_AUTHORIZED -34
#define PREVIOUS_FAILURE_PREVENTS_RETRY -35
#define TOO_MANY_PARAMS -36
#define INVALID_TXN -37
#define RESERVE_INSUFFICIENT -38
#define COMPLEX_NOT_SUPPORTED -39
#define DOES_NOT_MATCH -40
#define INVALID_KEY -41
#define NOT_A_STRING -42
#define MEM_OVERLAP -43
#define TOO_MANY_STATE_MODIFICATIONS -44
#define TOO_MANY_NAMESPACES -45
#define TOO_LITTLE_ENTROPY -46
#define HOOK_ERROR_CODES
#endif //HOOK_ERROR_CODES
// For documentation please see: https://xrpl-hooks.readme.io/reference/
// Generated using generate_extern.sh
#include <stdint.h>
#ifndef HOOK_EXTERN
#ifdef __cplusplus
extern "C" {
#endif

extern int32_t __attribute__((noduplicate))
_g(uint32_t guard_id, uint32_t maxiter);

extern int64_t
accept(uint32_t read_ptr, uint32_t read_len, int64_t error_code);

extern int64_t
rollback(uint32_t read_ptr, uint32_t read_len, int64_t error_code);

extern int64_t
util_raddr(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t read_ptr,
    uint32_t read_len);

extern int64_t
util_accid(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t read_ptr,
    uint32_t read_len);

extern int64_t
util_verify(
    uint32_t dread_ptr,
    uint32_t dread_len,
    uint32_t sread_ptr,
    uint32_t sread_len,
    uint32_t kread_ptr,
    uint32_t kread_len);

extern int64_t
util_sha512h(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t read_ptr,
    uint32_t read_len);

extern int64_t
util_keylet(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t keylet_type,
    uint32_t a,
    uint32_t b,
    uint32_t c,
    uint32_t d,
    uint32_t e,
    uint32_t f);

extern int64_t
sto_validate(uint32_t tread_ptr, uint32_t tread_len);

extern int64_t
sto_subfield(uint32_t read_ptr, uint32_t read_len, uint32_t field_id);

extern int64_t
sto_subarray(uint32_t read_ptr, uint32_t read_len, uint32_t array_id);

extern int64_t
sto_emplace(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t sread_ptr,
    uint32_t sread_len,
    uint32_t fread_ptr,
    uint32_t fread_len,
    uint32_t field_id);

extern int64_t
sto_erase(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t read_ptr,
    uint32_t read_len,
    uint32_t field_id);

extern int64_t
etxn_burden();

extern int64_t
etxn_details(uint32_t write_ptr, uint32_t write_len);

extern int64_t
etxn_fee_base(uint32_t read_ptr, uint32_t read_len);

extern int64_t
etxn_reserve(uint32_t count);

extern int64_t
etxn_generation();

extern int64_t
etxn_nonce(uint32_t write_ptr, uint32_t write_len);

extern int64_t
emit(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t read_ptr,
    uint32_t read_len);

extern int64_t
float_set(int32_t exponent, int64_t mantissa);

extern int64_t
float_multiply(int64_t float1, int64_t float2);

extern int64_t
float_mulratio(
    int64_t float1,
    uint32_t round_up,
    uint32_t numerator,
    uint32_t denominator);

extern int64_t
float_negate(int64_t float1);

extern int64_t
float_compare(int64_t float1, int64_t float2, uint32_t mode);

extern int64_t
float_sum(int64_t float1, int64_t float2);

extern int64_t
float_sto(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t cread_ptr,
    uint32_t cread_len,
    uint32_t iread_ptr,
    uint32_t iread_len,
    int64_t float1,
    uint32_t field_code);

extern int64_t
float_sto_set(uint32_t read_ptr, uint32_t read_len);

extern int64_t
float_invert(int64_t float1);

extern int64_t
float_divide(int64_t float1, int64_t float2);

extern int64_t
float_one();

extern int64_t
float_mantissa(int64_t float1);

extern int64_t
float_sign(int64_t float1);

extern int64_t
float_int(int64_t float1, uint32_t decimal_places, uint32_t abs);

extern int64_t
float_log(int64_t float1);

extern int64_t
float_root(int64_t float1, uint32_t n);

extern int64_t
fee_base();

extern int64_t
ledger_seq();

extern int64_t
ledger_last_time();

extern int64_t
ledger_last_hash(uint32_t write_ptr, uint32_t write_len);

extern int64_t
ledger_nonce(uint32_t write_ptr, uint32_t write_len);

extern int64_t
ledger_keylet(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t lread_ptr,
    uint32_t lread_len,
    uint32_t hread_ptr,
    uint32_t hread_len);

extern int64_t
hook_account(uint32_t write_ptr, uint32_t write_len);

extern int64_t
hook_hash(uint32_t write_ptr, uint32_t write_len, int32_t hook_no);

extern int64_t
hook_param_set(
    uint32_t read_ptr,
    uint32_t read_len,
    uint32_t kread_ptr,
    uint32_t kread_len,
    uint32_t hread_ptr,
    uint32_t hread_len);

extern int64_t
hook_param(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t read_ptr,
    uint32_t read_len);

extern int64_t
hook_again();

extern int64_t
hook_skip(uint32_t read_ptr, uint32_t read_len, uint32_t flags);

extern int64_t
hook_pos();

extern int64_t
slot(uint32_t write_ptr, uint32_t write_len, uint32_t slot);

extern int64_t
slot_clear(uint32_t slot);

extern int64_t
slot_count(uint32_t slot);

extern int64_t
slot_set(uint32_t read_ptr, uint32_t read_len, uint32_t slot);

extern int64_t
slot_size(uint32_t slot);

extern int64_t
slot_subarray(uint32_t parent_slot, uint32_t array_id, uint32_t new_slot);

extern int64_t
slot_subfield(uint32_t parent_slot, uint32_t field_id, uint32_t new_slot);

extern int64_t
slot_type(uint32_t slot_no, uint32_t flags);

extern int64_t
slot_float(uint32_t slot_no);

extern int64_t
state_set(
    uint32_t read_ptr,
    uint32_t read_len,
    uint32_t kread_ptr,
    uint32_t kread_len);

extern int64_t
state_foreign_set(
    uint32_t read_ptr,
    uint32_t read_len,
    uint32_t kread_ptr,
    uint32_t kread_len,
    uint32_t nread_ptr,
    uint32_t nread_len,
    uint32_t aread_ptr,
    uint32_t aread_len);

extern int64_t
state(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t kread_ptr,
    uint32_t kread_len);

extern int64_t
state_foreign(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t kread_ptr,
    uint32_t kread_len,
    uint32_t nread_ptr,
    uint32_t nread_len,
    uint32_t aread_ptr,
    uint32_t aread_len);

extern int64_t
trace(
    uint32_t mread_ptr,
    uint32_t mread_len,
    uint32_t dread_ptr,
    uint32_t dread_len,
    uint32_t as_hex);

extern int64_t
trace_num(uint32_t read_ptr, uint32_t read_len, int64_t number);

extern int64_t
trace_float(uint32_t read_ptr, uint32_t read_len, int64_t float1);

extern int64_t
otxn_burden();

extern int64_t
otxn_field(uint32_t write_ptr, uint32_t write_len, uint32_t field_id);

extern int64_t
otxn_generation();

extern int64_t
otxn_id(uint32_t write_ptr, uint32_t write_len, uint32_t flags);

extern int64_t
otxn_type();

extern int64_t
otxn_slot(uint32_t slot_no);

extern int64_t
otxn_param(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t read_ptr,
    uint32_t read_len);

extern int64_t
meta_slot(uint32_t slot_no);

extern int64_t
xpop_slot(uint32_t slot_no_tx, uint32_t slot_no_meta);

extern int64_t
prepare(
    uint32_t write_ptr,
    uint32_t write_len,
    uint32_t read_ptr,
    uint32_t read_len);

extern int64_t
dice(uint32_t sides);

extern int64_t
util_random(uint32_t write_ptr, uint32_t write_len);

#ifdef __cplusplus
}
#endif
#define HOOK_EXTERN
#endif  // HOOK_EXTERN
/**
 * These are helper macros for writing hooks, all of them are optional as is including macro.h at all
 */

#include <stdint.h>
// For documentation please see: https://xrpl-hooks.readme.io/reference/
// Generated using generate_sfcodes.sh
#define sfCloseResolution ((16U << 16U) + 1U)
#define sfMethod ((16U << 16U) + 2U)
#define sfTransactionResult ((16U << 16U) + 3U)
#define sfScale ((16U << 16U) + 4U)
#define sfAssetScale ((16U << 16U) + 5U)
#define sfTickSize ((16U << 16U) + 16U)
#define sfUNLModifyDisabling ((16U << 16U) + 17U)
#define sfHookResult ((16U << 16U) + 18U)
#define sfWasLockingChainSend ((16U << 16U) + 19U)
#define sfLedgerEntryType ((1U << 16U) + 1U)
#define sfTransactionType ((1U << 16U) + 2U)
#define sfSignerWeight ((1U << 16U) + 3U)
#define sfTransferFee ((1U << 16U) + 4U)
#define sfTradingFee ((1U << 16U) + 5U)
#define sfDiscountedFee ((1U << 16U) + 6U)
#define sfVersion ((1U << 16U) + 16U)
#define sfHookStateChangeCount ((1U << 16U) + 17U)
#define sfHookEmitCount ((1U << 16U) + 18U)
#define sfHookExecutionIndex ((1U << 16U) + 19U)
#define sfHookApiVersion ((1U << 16U) + 20U)
#define sfHookStateScale ((1U << 16U) + 21U)
#define sfLedgerFixType ((1U << 16U) + 22U)
#define sfEntropyCount ((1U << 16U) + 99U)
#define sfEntropyDenominator ((1U << 16U) + 100U)
#define sfNetworkID ((2U << 16U) + 1U)
#define sfFlags ((2U << 16U) + 2U)
#define sfSourceTag ((2U << 16U) + 3U)
#define sfSequence ((2U << 16U) + 4U)
#define sfPreviousTxnLgrSeq ((2U << 16U) + 5U)
#define sfLedgerSequence ((2U << 16U) + 6U)
#define sfCloseTime ((2U << 16U) + 7U)
#define sfParentCloseTime ((2U << 16U) + 8U)
#define sfSigningTime ((2U << 16U) + 9U)
#define sfExpiration ((2U << 16U) + 10U)
#define sfTransferRate ((2U << 16U) + 11U)
#define sfWalletSize ((2U << 16U) + 12U)
#define sfOwnerCount ((2U << 16U) + 13U)
#define sfDestinationTag ((2U << 16U) + 14U)
#define sfLastUpdateTime ((2U << 16U) + 15U)
#define sfHighQualityIn ((2U << 16U) + 16U)
#define sfHighQualityOut ((2U << 16U) + 17U)
#define sfLowQualityIn ((2U << 16U) + 18U)
#define sfLowQualityOut ((2U << 16U) + 19U)
#define sfQualityIn ((2U << 16U) + 20U)
#define sfQualityOut ((2U << 16U) + 21U)
#define sfStampEscrow ((2U << 16U) + 22U)
#define sfBondAmount ((2U << 16U) + 23U)
#define sfLoadFee ((2U << 16U) + 24U)
#define sfOfferSequence ((2U << 16U) + 25U)
#define sfFirstLedgerSequence ((2U << 16U) + 26U)
#define sfLastLedgerSequence ((2U << 16U) + 27U)
#define sfTransactionIndex ((2U << 16U) + 28U)
#define sfOperationLimit ((2U << 16U) + 29U)
#define sfReferenceFeeUnits ((2U << 16U) + 30U)
#define sfReserveBase ((2U << 16U) + 31U)
#define sfReserveIncrement ((2U << 16U) + 32U)
#define sfSetFlag ((2U << 16U) + 33U)
#define sfClearFlag ((2U << 16U) + 34U)
#define sfSignerQuorum ((2U << 16U) + 35U)
#define sfCancelAfter ((2U << 16U) + 36U)
#define sfFinishAfter ((2U << 16U) + 37U)
#define sfSignerListID ((2U << 16U) + 38U)
#define sfSettleDelay ((2U << 16U) + 39U)
#define sfTicketCount ((2U << 16U) + 40U)
#define sfTicketSequence ((2U << 16U) + 41U)
#define sfNFTokenTaxon ((2U << 16U) + 42U)
#define sfMintedNFTokens ((2U << 16U) + 43U)
#define sfBurnedNFTokens ((2U << 16U) + 44U)
#define sfHookStateCount ((2U << 16U) + 45U)
#define sfEmitGeneration ((2U << 16U) + 46U)
#define sfVoteWeight ((2U << 16U) + 48U)
#define sfLockCount ((2U << 16U) + 49U)
#define sfFirstNFTokenSequence ((2U << 16U) + 50U)
#define sfOracleDocumentID ((2U << 16U) + 51U)
#define sfStartTime ((2U << 16U) + 93U)
#define sfRepeatCount ((2U << 16U) + 94U)
#define sfDelaySeconds ((2U << 16U) + 95U)
#define sfXahauActivationLgrSeq ((2U << 16U) + 96U)
#define sfImportSequence ((2U << 16U) + 97U)
#define sfRewardTime ((2U << 16U) + 98U)
#define sfRewardLgrFirst ((2U << 16U) + 99U)
#define sfRewardLgrLast ((2U << 16U) + 100U)
#define sfAppLoaderSequence ((2U << 16U) + 101U)
#define sfIndexNext ((3U << 16U) + 1U)
#define sfIndexPrevious ((3U << 16U) + 2U)
#define sfBookNode ((3U << 16U) + 3U)
#define sfOwnerNode ((3U << 16U) + 4U)
#define sfBaseFee ((3U << 16U) + 5U)
#define sfExchangeRate ((3U << 16U) + 6U)
#define sfLowNode ((3U << 16U) + 7U)
#define sfHighNode ((3U << 16U) + 8U)
#define sfDestinationNode ((3U << 16U) + 9U)
#define sfCookie ((3U << 16U) + 10U)
#define sfServerVersion ((3U << 16U) + 11U)
#define sfNFTokenOfferNode ((3U << 16U) + 12U)
#define sfEmitBurden ((3U << 16U) + 13U)
#define sfHookInstructionCount ((3U << 16U) + 17U)
#define sfHookReturnCode ((3U << 16U) + 18U)
#define sfReferenceCount ((3U << 16U) + 19U)
#define sfXChainClaimID ((3U << 16U) + 20U)
#define sfXChainAccountCreateCount ((3U << 16U) + 21U)
#define sfXChainAccountClaimCount ((3U << 16U) + 22U)
#define sfAssetPrice ((3U << 16U) + 23U)
#define sfMaximumAmount ((3U << 16U) + 24U)
#define sfOutstandingAmount ((3U << 16U) + 25U)
#define sfMPTAmount ((3U << 16U) + 26U)
#define sfIssuerNode ((3U << 16U) + 27U)
#define sfSubjectNode ((3U << 16U) + 28U)
#define sfTouchCount ((3U << 16U) + 97U)
#define sfAccountIndex ((3U << 16U) + 98U)
#define sfAccountCount ((3U << 16U) + 99U)
#define sfRewardAccumulator ((3U << 16U) + 100U)
#define sfEmailHash ((4U << 16U) + 1U)
#define sfTakerPaysCurrency ((17U << 16U) + 1U)
#define sfTakerPaysIssuer ((17U << 16U) + 2U)
#define sfTakerGetsCurrency ((17U << 16U) + 3U)
#define sfTakerGetsIssuer ((17U << 16U) + 4U)
#define sfMPTokenIssuanceID ((21U << 16U) + 1U)
#define sfLedgerHash ((5U << 16U) + 1U)
#define sfParentHash ((5U << 16U) + 2U)
#define sfTransactionHash ((5U << 16U) + 3U)
#define sfAccountHash ((5U << 16U) + 4U)
#define sfPreviousTxnID ((5U << 16U) + 5U)
#define sfLedgerIndex ((5U << 16U) + 6U)
#define sfWalletLocator ((5U << 16U) + 7U)
#define sfRootIndex ((5U << 16U) + 8U)
#define sfAccountTxnID ((5U << 16U) + 9U)
#define sfNFTokenID ((5U << 16U) + 10U)
#define sfEmitParentTxnID ((5U << 16U) + 11U)
#define sfEmitNonce ((5U << 16U) + 12U)
#define sfEmitHookHash ((5U << 16U) + 13U)
#define sfObjectID ((5U << 16U) + 14U)
#define sfAMMID ((5U << 16U) + 15U)
#define sfBookDirectory ((5U << 16U) + 16U)
#define sfInvoiceID ((5U << 16U) + 17U)
#define sfNickname ((5U << 16U) + 18U)
#define sfAmendment ((5U << 16U) + 19U)
#define sfHookOn ((5U << 16U) + 20U)
#define sfDigest ((5U << 16U) + 21U)
#define sfChannel ((5U << 16U) + 22U)
#define sfConsensusHash ((5U << 16U) + 23U)
#define sfCheckID ((5U << 16U) + 24U)
#define sfValidatedHash ((5U << 16U) + 25U)
#define sfPreviousPageMin ((5U << 16U) + 26U)
#define sfNextPageMin ((5U << 16U) + 27U)
#define sfNFTokenBuyOffer ((5U << 16U) + 28U)
#define sfNFTokenSellOffer ((5U << 16U) + 29U)
#define sfHookStateKey ((5U << 16U) + 30U)
#define sfHookHash ((5U << 16U) + 31U)
#define sfHookNamespace ((5U << 16U) + 32U)
#define sfHookSetTxnID ((5U << 16U) + 33U)
#define sfOfferID ((5U << 16U) + 34U)
#define sfEscrowID ((5U << 16U) + 35U)
#define sfURITokenID ((5U << 16U) + 36U)
#define sfDomainID ((5U << 16U) + 37U)
#define sfNextRandomDigest ((5U << 16U) + 89U)
#define sfRandomData ((5U << 16U) + 90U)
#define sfManifestID ((5U << 16U) + 91U)
#define sfHookOnOutgoing ((5U << 16U) + 93U)
#define sfHookOnIncoming ((5U << 16U) + 94U)
#define sfCron ((5U << 16U) + 95U)
#define sfHookCanEmit ((5U << 16U) + 96U)
#define sfEmittedTxnID ((5U << 16U) + 97U)
#define sfGovernanceMarks ((5U << 16U) + 98U)
#define sfGovernanceFlags ((5U << 16U) + 99U)
#define sfNumber ((9U << 16U) + 1U)
#define sfAmount ((6U << 16U) + 1U)
#define sfBalance ((6U << 16U) + 2U)
#define sfLimitAmount ((6U << 16U) + 3U)
#define sfTakerPays ((6U << 16U) + 4U)
#define sfTakerGets ((6U << 16U) + 5U)
#define sfLowLimit ((6U << 16U) + 6U)
#define sfHighLimit ((6U << 16U) + 7U)
#define sfFee ((6U << 16U) + 8U)
#define sfSendMax ((6U << 16U) + 9U)
#define sfDeliverMin ((6U << 16U) + 10U)
#define sfAmount2 ((6U << 16U) + 11U)
#define sfBidMin ((6U << 16U) + 12U)
#define sfBidMax ((6U << 16U) + 13U)
#define sfMinimumOffer ((6U << 16U) + 16U)
#define sfRippleEscrow ((6U << 16U) + 17U)
#define sfDeliveredAmount ((6U << 16U) + 18U)
#define sfNFTokenBrokerFee ((6U << 16U) + 19U)
#define sfHookCallbackFee ((6U << 16U) + 20U)
#define sfLockedBalance ((6U << 16U) + 21U)
#define sfBaseFeeDrops ((6U << 16U) + 22U)
#define sfReserveBaseDrops ((6U << 16U) + 23U)
#define sfReserveIncrementDrops ((6U << 16U) + 24U)
#define sfLPTokenOut ((6U << 16U) + 25U)
#define sfLPTokenIn ((6U << 16U) + 26U)
#define sfEPrice ((6U << 16U) + 27U)
#define sfPrice ((6U << 16U) + 28U)
#define sfSignatureReward ((6U << 16U) + 29U)
#define sfMinAccountCreateAmount ((6U << 16U) + 30U)
#define sfLPTokenBalance ((6U << 16U) + 31U)
#define sfTrustLineRewardAccumulator ((6U << 16U) + 99U)
#define sfPublicKey ((7U << 16U) + 1U)
#define sfMessageKey ((7U << 16U) + 2U)
#define sfSigningPubKey ((7U << 16U) + 3U)
#define sfTxnSignature ((7U << 16U) + 4U)
#define sfURI ((7U << 16U) + 5U)
#define sfSignature ((7U << 16U) + 6U)
#define sfDomain ((7U << 16U) + 7U)
#define sfFundCode ((7U << 16U) + 8U)
#define sfRemoveCode ((7U << 16U) + 9U)
#define sfExpireCode ((7U << 16U) + 10U)
#define sfCreateCode ((7U << 16U) + 11U)
#define sfMemoType ((7U << 16U) + 12U)
#define sfMemoData ((7U << 16U) + 13U)
#define sfMemoFormat ((7U << 16U) + 14U)
#define sfFulfillment ((7U << 16U) + 16U)
#define sfCondition ((7U << 16U) + 17U)
#define sfMasterSignature ((7U << 16U) + 18U)
#define sfUNLModifyValidator ((7U << 16U) + 19U)
#define sfValidatorToDisable ((7U << 16U) + 20U)
#define sfValidatorToReEnable ((7U << 16U) + 21U)
#define sfHookStateData ((7U << 16U) + 22U)
#define sfHookReturnString ((7U << 16U) + 23U)
#define sfHookParameterName ((7U << 16U) + 24U)
#define sfHookParameterValue ((7U << 16U) + 25U)
#define sfBlob ((7U << 16U) + 26U)
#define sfDIDDocument ((7U << 16U) + 27U)
#define sfData ((7U << 16U) + 28U)
#define sfAssetClass ((7U << 16U) + 29U)
#define sfProvider ((7U << 16U) + 30U)
#define sfMPTokenMetadata ((7U << 16U) + 31U)
#define sfCredentialType ((7U << 16U) + 32U)
#define sfAppLoader ((7U << 16U) + 96U)
#define sfHookName ((7U << 16U) + 97U)
#define sfRemarkValue ((7U << 16U) + 98U)
#define sfRemarkName ((7U << 16U) + 99U)
#define sfAccount ((8U << 16U) + 1U)
#define sfOwner ((8U << 16U) + 2U)
#define sfDestination ((8U << 16U) + 3U)
#define sfIssuer ((8U << 16U) + 4U)
#define sfAuthorize ((8U << 16U) + 5U)
#define sfUnauthorize ((8U << 16U) + 6U)
#define sfRegularKey ((8U << 16U) + 8U)
#define sfNFTokenMinter ((8U << 16U) + 9U)
#define sfEmitCallback ((8U << 16U) + 10U)
#define sfHolder ((8U << 16U) + 11U)
#define sfHookAccount ((8U << 16U) + 16U)
#define sfOtherChainSource ((8U << 16U) + 18U)
#define sfOtherChainDestination ((8U << 16U) + 19U)
#define sfAttestationSignerAccount ((8U << 16U) + 20U)
#define sfAttestationRewardAccount ((8U << 16U) + 21U)
#define sfLockingChainDoor ((8U << 16U) + 22U)
#define sfIssuingChainDoor ((8U << 16U) + 23U)
#define sfSubject ((8U << 16U) + 24U)
#define sfInform ((8U << 16U) + 99U)
#define sfIndexes ((19U << 16U) + 1U)
#define sfHashes ((19U << 16U) + 2U)
#define sfAmendments ((19U << 16U) + 3U)
#define sfNFTokenOffers ((19U << 16U) + 4U)
#define sfHookNamespaces ((19U << 16U) + 5U)
#define sfCredentialIDs ((19U << 16U) + 6U)
#define sfURITokenIDs ((19U << 16U) + 99U)
#define sfPaths ((18U << 16U) + 1U)
#define sfBaseAsset ((26U << 16U) + 1U)
#define sfQuoteAsset ((26U << 16U) + 2U)
#define sfLockingChainIssue ((24U << 16U) + 1U)
#define sfIssuingChainIssue ((24U << 16U) + 2U)
#define sfAsset ((24U << 16U) + 3U)
#define sfAsset2 ((24U << 16U) + 4U)
#define sfClaimCurrency ((24U << 16U) + 5U)
#define sfXChainBridge ((25U << 16U) + 1U)
#define sfTransactionMetaData ((14U << 16U) + 2U)
#define sfCreatedNode ((14U << 16U) + 3U)
#define sfDeletedNode ((14U << 16U) + 4U)
#define sfModifiedNode ((14U << 16U) + 5U)
#define sfPreviousFields ((14U << 16U) + 6U)
#define sfFinalFields ((14U << 16U) + 7U)
#define sfNewFields ((14U << 16U) + 8U)
#define sfTemplateEntry ((14U << 16U) + 9U)
#define sfMemo ((14U << 16U) + 10U)
#define sfSignerEntry ((14U << 16U) + 11U)
#define sfNFToken ((14U << 16U) + 12U)
#define sfEmitDetails ((14U << 16U) + 13U)
#define sfHook ((14U << 16U) + 14U)
#define sfSigner ((14U << 16U) + 16U)
#define sfMajority ((14U << 16U) + 18U)
#define sfDisabledValidator ((14U << 16U) + 19U)
#define sfEmittedTxn ((14U << 16U) + 20U)
#define sfHookExecution ((14U << 16U) + 21U)
#define sfHookParameter ((14U << 16U) + 23U)
#define sfHookGrant ((14U << 16U) + 24U)
#define sfVoteEntry ((14U << 16U) + 25U)
#define sfAuctionSlot ((14U << 16U) + 26U)
#define sfAuthAccount ((14U << 16U) + 27U)
#define sfXChainClaimProofSig ((14U << 16U) + 28U)
#define sfXChainCreateAccountProofSig ((14U << 16U) + 29U)
#define sfXChainClaimAttestationCollectionElement ((14U << 16U) + 30U)
#define sfXChainCreateAccountAttestationCollectionElement ((14U << 16U) + 31U)
#define sfPriceData ((14U << 16U) + 32U)
#define sfCredential ((14U << 16U) + 33U)
#define sfRandomDigestEntry ((14U << 16U) + 88U)
#define sfManifest ((14U << 16U) + 90U)
#define sfAmountEntry ((14U << 16U) + 91U)
#define sfMintURIToken ((14U << 16U) + 92U)
#define sfHookEmission ((14U << 16U) + 93U)
#define sfImportVLKey ((14U << 16U) + 94U)
#define sfActiveValidator ((14U << 16U) + 95U)
#define sfGenesisMint ((14U << 16U) + 96U)
#define sfRemark ((14U << 16U) + 97U)
#define sfHighReward ((14U << 16U) + 98U)
#define sfLowReward ((14U << 16U) + 99U)
#define sfSigners ((15U << 16U) + 3U)
#define sfSignerEntries ((15U << 16U) + 4U)
#define sfTemplate ((15U << 16U) + 5U)
#define sfNecessary ((15U << 16U) + 6U)
#define sfSufficient ((15U << 16U) + 7U)
#define sfAffectedNodes ((15U << 16U) + 8U)
#define sfMemos ((15U << 16U) + 9U)
#define sfNFTokens ((15U << 16U) + 10U)
#define sfHooks ((15U << 16U) + 11U)
#define sfVoteSlots ((15U << 16U) + 12U)
#define sfMajorities ((15U << 16U) + 16U)
#define sfDisabledValidators ((15U << 16U) + 17U)
#define sfHookExecutions ((15U << 16U) + 18U)
#define sfHookParameters ((15U << 16U) + 19U)
#define sfHookGrants ((15U << 16U) + 20U)
#define sfXChainClaimAttestations ((15U << 16U) + 21U)
#define sfXChainCreateAccountAttestations ((15U << 16U) + 22U)
#define sfPriceDataSeries ((15U << 16U) + 24U)
#define sfAuthAccounts ((15U << 16U) + 25U)
#define sfAuthorizeCredentials ((15U << 16U) + 26U)
#define sfUnauthorizeCredentials ((15U << 16U) + 27U)
#define sfAcceptedCredentials ((15U << 16U) + 28U)
#define sfRandomDigests ((15U << 16U) + 91U)
#define sfAmounts ((15U << 16U) + 92U)
#define sfHookEmissions ((15U << 16U) + 93U)
#define sfImportVLKeys ((15U << 16U) + 94U)
#define sfActiveValidators ((15U << 16U) + 95U)
#define sfGenesisMints ((15U << 16U) + 96U)
#define sfRemarks ((15U << 16U) + 97U)

#ifndef HOOKMACROS_INCLUDED
#define HOOKMACROS_INCLUDED 1

#ifdef NDEBUG
#define DEBUG 0
#else
#define DEBUG 1
#endif

#define DONEEMPTY()\
    accept(0,0,__LINE__)

#define DONEMSG(msg)\
    accept(msg, sizeof(msg),__LINE__)

#define DONE(x)\
    accept(SVAR(x),(uint32_t)__LINE__);

#define ASSERT(x)\
{\
    if (!(x))\
        rollback(0,0,__LINE__);\
}

#define NOPE(x)\
{\
    return rollback((x), sizeof(x), __LINE__);\
}

#define TRACEVAR(v) if (DEBUG) trace_num((uint32_t)(#v), (uint32_t)(sizeof(#v) - 1), (int64_t)v);
#define TRACEHEX(v) if (DEBUG) trace((uint32_t)(#v), (uint32_t)(sizeof(#v) - 1), (uint32_t)(v), (uint32_t)(sizeof(v)), 1);
#define TRACEXFL(v) if (DEBUG) trace_float((uint32_t)(#v), (uint32_t)(sizeof(#v) - 1), (int64_t)v);
#define TRACESTR(v) if (DEBUG) trace((uint32_t)(#v), (uint32_t)(sizeof(#v) - 1), (uint32_t)(v), sizeof(v), 0);

// hook developers should use this guard macro, simply GUARD(<maximum iterations>)
#define GUARD(maxiter) _g((1ULL << 31U) + __LINE__, (maxiter)+1)
#define GUARDM(maxiter, n) _g(( (1ULL << 31U) + (__LINE__ << 16) + n), (maxiter)+1)

#define SBUF(str) (uint32_t)(str), sizeof(str)
#define SVAR(x) &x, sizeof(x)

#define REQUIRE(cond, str)\
{\
    if (!(cond))\
        rollback(SBUF(str), __LINE__);\
}

// make a report buffer as a c-string
// provide a name for a buffer to declare (buf)
// provide a static string
// provide an integer to print after the string
#define RBUF(buf, out_len, str, num)\
unsigned char buf[sizeof(str) + 21];\
int out_len = 0;\
{\
    int i = 0;\
    for (; GUARDM(sizeof(str),1),i < sizeof(str); ++i)\
        (buf)[i] = str[i];\
    if ((buf)[sizeof(str)-1] == 0) i--;\
    if ((num) < 0) (buf)[i++] = '-';\
    uint64_t unsigned_num = (uint64_t)( (num) < 0 ? (num) * -1 : (num) );\
    uint64_t j = 10000000000000000000ULL;\
    int start = 1;\
    for (; GUARDM(20,2), unsigned_num > 0 && j > 0; j /= 10)\
    {\
        unsigned char digit = ( unsigned_num / j ) % 10;\
        if (digit == 0 && start)\
            continue;\
        start = 0;\
        (buf)[i++] = '0' + digit;\
    }\
    (buf)[i] = '\0';\
    out_len = i;\
}

#define RBUF2(buff, out_len, str, num, str2, num2)\
unsigned char buff[sizeof(str) + sizeof(str2) + 42];\
int out_len = 0;\
{\
    unsigned char* buf = buff;\
    int i = 0;\
    for (; GUARDM(sizeof(str),1),i < sizeof(str); ++i)\
        (buf)[i] = str[i];\
    if ((buf)[sizeof(str)-1] == 0) i--;\
    if ((num) < 0) (buf)[i++] = '-';\
    uint64_t unsigned_num = (uint64_t)( (num) < 0 ? (num) * -1 : (num) );\
    uint64_t j = 10000000000000000000ULL;\
    int start = 1;\
    for (; GUARDM(20,2), unsigned_num > 0 && j > 0; j /= 10)\
    {\
        unsigned char digit = ( unsigned_num / j ) % 10;\
        if (digit == 0 && start)\
            continue;\
        start = 0;\
        (buf)[i++] = '0' + digit;\
    }\
    buf += i;\
    out_len += i;\
    i = 0;\
    for (; GUARDM(sizeof(str2),3),i < sizeof(str2); ++i)\
        (buf)[i] = str2[i];\
    if ((buf)[sizeof(str2)-1] == 0) i--;\
    if ((num2) < 0) (buf)[i++] = '-';\
    unsigned_num = (uint64_t)( (num2) < 0 ? (num2) * -1 : (num2) );\
    j = 10000000000000000000ULL;\
    start = 1;\
    for (; GUARDM(20,4), unsigned_num > 0 && j > 0; j /= 10)\
    {\
        unsigned char digit = ( unsigned_num / j ) % 10;\
        if (digit == 0 && start)\
            continue;\
        start = 0;\
        (buf)[i++] = '0' + digit;\
    }\
    (buf)[i] = '\0';\
    out_len += i;\
}

#define CLEARBUF(b)\
{\
    for (int x = 0; GUARD(sizeof(b)), x < sizeof(b); ++x)\
        b[x] = 0;\
}

// returns an in64_t, negative if error, non-negative if valid drops
#define AMOUNT_TO_DROPS(amount_buffer)\
     (((amount_buffer)[0] >> 7) ? -2 : (\
     ((((uint64_t)((amount_buffer)[0])) & 0xb00111111) << 56) +\
      (((uint64_t)((amount_buffer)[1])) << 48) +\
      (((uint64_t)((amount_buffer)[2])) << 40) +\
      (((uint64_t)((amount_buffer)[3])) << 32) +\
      (((uint64_t)((amount_buffer)[4])) << 24) +\
      (((uint64_t)((amount_buffer)[5])) << 16) +\
      (((uint64_t)((amount_buffer)[6])) <<  8) +\
      (((uint64_t)((amount_buffer)[7])))))

#define SUB_OFFSET(x) ((int32_t)(x >> 32))
#define SUB_LENGTH(x) ((int32_t)(x & 0xFFFFFFFFULL))

#define BUFFER_EQUAL_20(buf1, buf2)\
    (\
        *(((uint64_t*)(buf1)) + 0) == *(((uint64_t*)(buf2)) + 0) &&\
        *(((uint64_t*)(buf1)) + 1) == *(((uint64_t*)(buf2)) + 1) &&\
        *(((uint32_t*)(buf1)) + 4) == *(((uint32_t*)(buf2)) + 4))

#define BUFFER_EQUAL_32(buf1, buf2)\
    (\
        *(((uint64_t*)(buf1)) + 0) == *(((uint64_t*)(buf2)) + 0) &&\
        *(((uint64_t*)(buf1)) + 1) == *(((uint64_t*)(buf2)) + 1) &&\
        *(((uint64_t*)(buf1)) + 2) == *(((uint64_t*)(buf2)) + 2) &&\
        *(((uint64_t*)(buf1)) + 3) == *(((uint64_t*)(buf2)) + 3))

#define BUFFER_EQUAL_64(buf1, buf2) \
    ( \
        (*((uint64_t*)(buf1) + 0) == *((uint64_t*)(buf2) + 0)) && \
        (*((uint64_t*)(buf1) + 1) == *((uint64_t*)(buf2) + 1)) && \
        (*((uint64_t*)(buf1) + 2) == *((uint64_t*)(buf2) + 2)) && \
        (*((uint64_t*)(buf1) + 3) == *((uint64_t*)(buf2) + 3)) && \
        (*((uint64_t*)(buf1) + 4) == *((uint64_t*)(buf2) + 4)) && \
        (*((uint64_t*)(buf1) + 5) == *((uint64_t*)(buf2) + 5)) && \
        (*((uint64_t*)(buf1) + 6) == *((uint64_t*)(buf2) + 6)) && \
        (*((uint64_t*)(buf1) + 7) == *((uint64_t*)(buf2) + 7)) \
    )

// when using this macro buf1len may be dynamic but buf2len must be static
// provide n >= 1 to indicate how many times the macro will be hit on the line of code
// e.g. if it is in a loop that loops 10 times n = 10

#define BUFFER_EQUAL_GUARD(output, buf1, buf1len, buf2, buf2len, n)\
{\
    output = ((buf1len) == (buf2len) ? 1 : 0);\
    for (int x = 0; GUARDM( (buf2len) * (n), 1 ), output && x < (buf2len);\
         ++x)\
        output = *(((uint8_t*)(buf1)) + x) == *(((uint8_t*)(buf2)) + x);\
}

#define BUFFER_SWAP(x,y)\
{\
    uint8_t* z = x;\
    x = y;\
    y = z;\
}

#define ACCOUNT_COMPARE(compare_result, buf1, buf2)\
{\
    compare_result = 0;\
    for (int i = 0; GUARD(20), i < 20; ++i)\
    {\
        if (buf1[i] > buf2[i])\
        {\
            compare_result = 1;\
            break;\
        }\
        else if (buf1[i] < buf2[i])\
        {\
            compare_result = -1;\
            break;\
        }\
    }\
}

#define BUFFER_EQUAL_STR_GUARD(output, buf1, buf1len, str, n)\
    BUFFER_EQUAL_GUARD(output, buf1, buf1len, str, (sizeof(str)-1), n)

#define BUFFER_EQUAL_STR(output, buf1, buf1len, str)\
    BUFFER_EQUAL_GUARD(output, buf1, buf1len, str, (sizeof(str)-1), 1)

#define BUFFER_EQUAL(output, buf1, buf2, compare_len)\
    BUFFER_EQUAL_GUARD(output, buf1, compare_len, buf2, compare_len, 1)


#define UINT8_TO_BUF(buf_raw, i)\
{\
    unsigned char* buf = (unsigned char*)buf_raw;\
    buf[0] = (((uint8_t)i) >> 0) & 0xFFUL;\
    if (i < 0) buf[0] |= 0x80U;\
}

#define UINT8_FROM_BUF(buf)\
    (((uint8_t)((buf)[0]) <<  0))


#define UINT16_TO_BUF(buf_raw, i)\
{\
    unsigned char* buf = (unsigned char*)buf_raw;\
    buf[0] = (((uint64_t)i) >> 8) & 0xFFUL;\
    buf[1] = (((uint64_t)i) >> 0) & 0xFFUL;\
}

#define UINT16_FROM_BUF(buf)\
    (((uint64_t)((buf)[0]) <<  8) +\
     ((uint64_t)((buf)[1]) <<  0))

#define UINT32_TO_BUF(buf_raw, i)\
{\
    unsigned char* buf = (unsigned char*)buf_raw;\
    buf[0] = (((uint64_t)i) >> 24) & 0xFFUL;\
    buf[1] = (((uint64_t)i) >> 16) & 0xFFUL;\
    buf[2] = (((uint64_t)i) >>  8) & 0xFFUL;\
    buf[3] = (((uint64_t)i) >>  0) & 0xFFUL;\
}

#define UINT32_FROM_BUF(buf)\
    (((uint64_t)((buf)[0]) << 24) +\
     ((uint64_t)((buf)[1]) << 16) +\
     ((uint64_t)((buf)[2]) <<  8) +\
     ((uint64_t)((buf)[3]) <<  0))

#define UINT64_TO_BUF(buf_raw, i)\
{\
    unsigned char* buf = (unsigned char*)buf_raw;\
    buf[0] = (((uint64_t)i) >> 56) & 0xFFUL;\
    buf[1] = (((uint64_t)i) >> 48) & 0xFFUL;\
    buf[2] = (((uint64_t)i) >> 40) & 0xFFUL;\
    buf[3] = (((uint64_t)i) >> 32) & 0xFFUL;\
    buf[4] = (((uint64_t)i) >> 24) & 0xFFUL;\
    buf[5] = (((uint64_t)i) >> 16) & 0xFFUL;\
    buf[6] = (((uint64_t)i) >>  8) & 0xFFUL;\
    buf[7] = (((uint64_t)i) >>  0) & 0xFFUL;\
}

#define UINT64_FROM_BUF(buf)\
    (((uint64_t)((buf)[0]) << 56) +\
     ((uint64_t)((buf)[1]) << 48) +\
     ((uint64_t)((buf)[2]) << 40) +\
     ((uint64_t)((buf)[3]) << 32) +\
     ((uint64_t)((buf)[4]) << 24) +\
     ((uint64_t)((buf)[5]) << 16) +\
     ((uint64_t)((buf)[6]) <<  8) +\
     ((uint64_t)((buf)[7]) <<  0))

#define INT64_TO_BUF(buf_raw, i)\
{\
    unsigned char* buf = (unsigned char*)buf_raw;\
    buf[0] = (((uint64_t)i) >> 56) & 0x7FUL;\
    buf[1] = (((uint64_t)i) >> 48) & 0xFFUL;\
    buf[2] = (((uint64_t)i) >> 40) & 0xFFUL;\
    buf[3] = (((uint64_t)i) >> 32) & 0xFFUL;\
    buf[4] = (((uint64_t)i) >> 24) & 0xFFUL;\
    buf[5] = (((uint64_t)i) >> 16) & 0xFFUL;\
    buf[6] = (((uint64_t)i) >>  8) & 0xFFUL;\
    buf[7] = (((uint64_t)i) >>  0) & 0xFFUL;\
    if (i < 0) buf[0] |= 0x80U;\
}

#define INT64_FROM_BUF(buf)\
   ((((uint64_t)((buf)[0] & 0x7FU) << 56) +\
     ((uint64_t)((buf)[1]) << 48) +\
     ((uint64_t)((buf)[2]) << 40) +\
     ((uint64_t)((buf)[3]) << 32) +\
     ((uint64_t)((buf)[4]) << 24) +\
     ((uint64_t)((buf)[5]) << 16) +\
     ((uint64_t)((buf)[6]) <<  8) +\
     ((uint64_t)((buf)[7]) <<  0)) * (buf[0] & 0x80U ? -1 : 1))


#define BYTES20_TO_BUF(buf_raw, i)\
{\
    unsigned char* buf = (unsigned char*)buf_raw;\
    *(uint64_t*)(buf + 0) = *(uint64_t*)(i +  0);\
    *(uint64_t*)(buf + 8) = *(uint64_t*)(i +  8);\
    *(uint32_t*)(buf + 16) = *(uint32_t*)(i + 16);\
}

#define BYTES20_FROM_BUF(buf_raw, i)\
{\
    const unsigned char* buf = (const unsigned char*)buf_raw;\
    *(uint64_t*)(i +  0) = *(const uint64_t*)(buf + 0);\
    *(uint64_t*)(i +  8) = *(const uint64_t*)(buf + 8);\
    *(uint32_t*)(i + 16) = *(const uint32_t*)(buf + 16);\
}

#define BYTES32_TO_BUF(buf_raw, i)\
{\
    unsigned char* buf = (unsigned char*)buf_raw;\
    *(uint64_t*)(buf + 0) = *(uint64_t*)(i +  0);\
    *(uint64_t*)(buf + 8) = *(uint64_t*)(i +  8);\
    *(uint64_t*)(buf + 16) = *(uint64_t*)(i + 16);\
    *(uint64_t*)(buf + 24) = *(uint64_t*)(i + 24);\
}

#define BYTES32_FROM_BUF(buf_raw, i)\
{\
    const unsigned char* buf = (const unsigned char*)buf_raw;\
    *(uint64_t*)(i +  0) = *(const uint64_t*)(buf + 0);\
    *(uint64_t*)(i +  8) = *(const uint64_t*)(buf + 8);\
    *(uint64_t*)(i + 16) = *(const uint64_t*)(buf + 16);\
    *(uint64_t*)(i + 24) = *(const uint64_t*)(buf + 24);\
}

#define FLIP_ENDIAN_32(n) ((uint32_t) (((n & 0xFFU) << 24U) | \
                                   ((n & 0xFF00U) << 8U) | \
                                 ((n & 0xFF0000U) >> 8U) | \
                                ((n & 0xFF000000U) >> 24U)))

#define FLIP_ENDIAN_64(n) ((uint64_t)(((n & 0xFFULL) << 56ULL) |             \
                                      ((n & 0xFF00ULL) << 40ULL) |           \
                                      ((n & 0xFF0000ULL) << 24ULL) |         \
                                      ((n & 0xFF000000ULL) << 8ULL) |        \
                                      ((n & 0xFF00000000ULL) >> 8ULL) |      \
                                      ((n & 0xFF0000000000ULL) >> 24ULL) |   \
                                      ((n & 0xFF000000000000ULL) >> 40ULL) | \
                                      ((n & 0xFF00000000000000ULL) >> 56ULL)))

#define tfCANONICAL 0x80000000UL

#define atACCOUNT 1U
#define atOWNER 2U
#define atDESTINATION 3U
#define atISSUER 4U
#define atAUTHORIZE 5U
#define atUNAUTHORIZE 6U
#define atTARGET 7U
#define atREGULARKEY 8U
#define atPSEUDOCALLBACK 9U

#define amAMOUNT 1U
#define amBALANCE 2U
#define amLIMITAMOUNT 3U
#define amTAKERPAYS 4U
#define amTAKERGETS 5U
#define amLOWLIMIT 6U
#define amHIGHLIMIT 7U
#define amFEE 8U
#define amSENDMAX 9U
#define amDELIVERMIN 10U
#define amMINIMUMOFFER 16U
#define amRIPPLEESCROW 17U
#define amDELIVEREDAMOUNT 18U

#endif


// For documentation please see: https://xrpl-hooks.readme.io/reference/
// Generated using generate_tts.sh
#define ttPAYMENT 0
#define ttESCROW_CREATE 1
#define ttESCROW_FINISH 2
#define ttACCOUNT_SET 3
#define ttESCROW_CANCEL 4
#define ttREGULAR_KEY_SET 5
#define ttOFFER_CREATE 7
#define ttOFFER_CANCEL 8
#define ttTICKET_CREATE 10
#define ttSIGNER_LIST_SET 12
#define ttPAYCHAN_CREATE 13
#define ttPAYCHAN_FUND 14
#define ttPAYCHAN_CLAIM 15
#define ttCHECK_CREATE 16
#define ttCHECK_CASH 17
#define ttCHECK_CANCEL 18
#define ttDEPOSIT_PREAUTH 19
#define ttTRUST_SET 20
#define ttACCOUNT_DELETE 21
#define ttHOOK_SET 22
#define ttNFTOKEN_MINT 25
#define ttNFTOKEN_BURN 26
#define ttNFTOKEN_CREATE_OFFER 27
#define ttNFTOKEN_CANCEL_OFFER 28
#define ttNFTOKEN_ACCEPT_OFFER 29
#define ttCLAWBACK 30
#define ttAMM_CLAWBACK 31
#define ttAMM_CREATE 35
#define ttAMM_DEPOSIT 36
#define ttAMM_WITHDRAW 37
#define ttAMM_VOTE 38
#define ttAMM_BID 39
#define ttAMM_DELETE 40
#define ttURITOKEN_MINT 45
#define ttURITOKEN_BURN 46
#define ttURITOKEN_BUY 47
#define ttURITOKEN_CREATE_SELL_OFFER 48
#define ttURITOKEN_CANCEL_SELL_OFFER 49
#define ttXCHAIN_CREATE_CLAIM_ID 50
#define ttXCHAIN_COMMIT 51
#define ttXCHAIN_CLAIM 52
#define ttXCHAIN_ACCOUNT_CREATE_COMMIT 53
#define ttXCHAIN_ADD_CLAIM_ATTESTATION 54
#define ttXCHAIN_ADD_ACCOUNT_CREATE_ATTESTATION 55
#define ttXCHAIN_MODIFY_BRIDGE 56
#define ttXCHAIN_CREATE_BRIDGE 57
#define ttDID_SET 58
#define ttDID_DELETE 59
#define ttORACLE_SET 60
#define ttORACLE_DELETE 61
#define ttLEDGER_STATE_FIX 62
#define ttMPTOKEN_ISSUANCE_CREATE 63
#define ttMPTOKEN_ISSUANCE_DESTROY 64
#define ttMPTOKEN_ISSUANCE_SET 65
#define ttMPTOKEN_AUTHORIZE 66
#define ttCREDENTIAL_CREATE 67
#define ttCREDENTIAL_ACCEPT 68
#define ttCREDENTIAL_DELETE 69
#define ttNFTOKEN_MODIFY 70
#define ttPERMISSIONED_DOMAIN_SET 71
#define ttPERMISSIONED_DOMAIN_DELETE 72
#define ttENTROPY 89
#define ttMANIFEST_SET 91
#define ttCRON 92
#define ttCRON_SET 93
#define ttREMARKS_SET 94
#define ttREMIT 95
#define ttGENESIS_MINT 96
#define ttIMPORT 97
#define ttCLAIM_REWARD 98
#define ttINVOKE 99
#define ttAMENDMENT 100
#define ttFEE 101
#define ttUNL_MODIFY 102
#define ttEMIT_FAILURE 103
#define ttUNL_REPORT 104

// Generated using generate_lsflags.sh

#ifndef HOOKLSFLAGS_INCLUDED
#define HOOKLSFLAGS_INCLUDED 1

enum ltACCOUNT_ROOT {
    lsfPasswordSpent = 0x00010000,
    lsfRequireDestTag = 0x00020000,
    lsfRequireAuth = 0x00040000,
    lsfDisallowXRP = 0x00080000,
    lsfDisableMaster = 0x00100000,
    lsfNoFreeze = 0x00200000,
    lsfGlobalFreeze = 0x00400000,
    lsfDefaultRipple = 0x00800000,
    lsfDepositAuth = 0x01000000,
    lsfTshCollect = 0x02000000,
    lsfDisallowIncomingNFTokenOffer = 0x04000000,
    lsfDisallowIncomingCheck = 0x08000000,
    lsfDisallowIncomingPayChan = 0x10000000,
    lsfDisallowIncomingTrustline = 0x20000000,
    lsfURITokenIssuer = 0x40000000,
    lsfDisallowIncomingRemit = 0x80000000,
    lsfAllowTrustLineClawback = 0x00001000,
};
enum ltOFFER {
    lsfPassive = 0x00010000,
    lsfSell = 0x00020000,
};
enum ltRIPPLE_STATE {
    lsfLowReserve = 0x00010000,
    lsfHighReserve = 0x00020000,
    lsfLowAuth = 0x00040000,
    lsfHighAuth = 0x00080000,
    lsfLowNoRipple = 0x00100000,
    lsfHighNoRipple = 0x00200000,
    lsfLowFreeze = 0x00400000,
    lsfHighFreeze = 0x00800000,
    lsfLowDeepFreeze = 0x02000000,
    lsfHighDeepFreeze = 0x04000000,
    lsfAMMNode = 0x01000000,
};
enum ltSIGNER_LIST {
    lsfOneOwnerCount = 0x00010000,
};
enum ltDIR_NODE {
    lsfNFTokenBuyOffers = 0x00000001,
    lsfNFTokenSellOffers = 0x00000002,
    lsfEmittedDir = 0x00000004,
};
enum ltNFTOKEN_OFFER {
    lsfSellNFToken = 0x00000001,
};
enum ltURI_TOKEN {
    lsfBurnable = 0x00000001,
};
enum remarks {
    lsfImmutable = 1,
};
enum ltMPTOKEN_ISSUANCE {
    lsfMPTLocked = 0x00000001,
    lsfMPTCanLock = 0x00000002,
    lsfMPTRequireAuth = 0x00000004,
    lsfMPTCanEscrow = 0x00000008,
    lsfMPTCanTrade = 0x00000010,
    lsfMPTCanTransfer = 0x00000020,
    lsfMPTCanClawback = 0x00000040,
};
enum ltMPTOKEN {
    lsfMPTAuthorized = 0x00000002,
};
enum ltCREDENTIAL {
    lsfAccepted = 0x00010000,
};

#endif // HOOKLSFLAGS_INCLUDED
// Generated using generate_txflags.sh
#include <stdint.h>

enum UniversalFlags : uint32_t {
    tfFullyCanonicalSig = 0x80000000,
};

enum AccountSetFlags : uint32_t {
    tfRequireDestTag = 0x00010000,
    tfOptionalDestTag = 0x00020000,
    tfRequireAuth = 0x00040000,
    tfOptionalAuth = 0x00080000,
    tfDisallowXRP = 0x00100000,
    tfAllowXRP = 0x00200000,
};

enum AccountFlags : uint32_t {
    asfRequireDest = 1,
    asfRequireAuth = 2,
    asfDisallowXRP = 3,
    asfDisableMaster = 4,
    asfAccountTxnID = 5,
    asfNoFreeze = 6,
    asfGlobalFreeze = 7,
    asfDefaultRipple = 8,
    asfDepositAuth = 9,
    asfAuthorizedNFTokenMinter = 10,
    asfTshCollect = 11,
    asfDisallowIncomingNFTokenOffer = 12,
    asfDisallowIncomingCheck = 13,
    asfDisallowIncomingPayChan = 14,
    asfDisallowIncomingTrustline = 15,
    asfDisallowIncomingRemit = 16,
    asfAllowTrustLineClawback = 17,
};

enum OfferCreateFlags : uint32_t {
    tfPassive = 0x00010000,
    tfImmediateOrCancel = 0x00020000,
    tfFillOrKill = 0x00040000,
    tfSell = 0x00080000,
};

enum PaymentFlags : uint32_t {
    tfNoRippleDirect = 0x00010000,
    tfPartialPayment = 0x00020000,
    tfLimitQuality = 0x00040000,
};

enum TrustSetFlags : uint32_t {
    tfSetfAuth = 0x00010000,
    tfSetNoRipple = 0x00020000,
    tfClearNoRipple = 0x00040000,
    tfSetFreeze = 0x00100000,
    tfClearFreeze = 0x00200000,
    tfSetDeepFreeze = 0x00400000,
    tfClearDeepFreeze = 0x00800000
};

enum EnableAmendmentFlags : uint32_t {
    tfGotMajority = 0x00010000,
    tfLostMajority = 0x00020000,
    tfTestSuite = 0x80000000,
};

enum PaymentChannelClaimFlags : uint32_t {
    tfRenew = 0x00010000,
    tfClose = 0x00020000,
};

enum NFTokenMintFlags : uint32_t {
    tfBurnable = 0x00000001,
    tfOnlyXRP = 0x00000002,
    tfTrustLine = 0x00000004,
    tfTransferable = 0x00000008,
    tfMutable = 0x00000010,
    tfStrongTSH = 0x00008000,
};

enum MPTokenIssuanceCreateFlags : uint32_t {
    tfMPTCanLock = lsfMPTCanLock,
    tfMPTRequireAuth = lsfMPTRequireAuth,
    tfMPTCanEscrow = lsfMPTCanEscrow,
    tfMPTCanTrade = lsfMPTCanTrade,
    tfMPTCanTransfer = lsfMPTCanTransfer,
    tfMPTCanClawback = lsfMPTCanClawback,
};

enum MPTokenAuthorizeFlags : uint32_t {
    tfMPTUnauthorize = 0x00000001,
};

enum MPTokenIssuanceSetFlags : uint32_t {
    tfMPTLock = 0x00000001,
    tfMPTUnlock = 0x00000002,
};

enum NFTokenCreateOfferFlags : uint32_t {
    tfSellNFToken = 0x00000001,
};

enum ClaimRewardFlags : uint32_t {
    tfOptOut = 0x00000001,
};

enum CronSetFlags : uint32_t {
    tfCronUnset = 0x00000001,
};

enum AMMClawbackFlags : uint32_t {
    tfClawTwoAssets = 0x00000001,
};

enum BridgeModifyFlags : uint32_t {
    tfClearAccountCreateAmount = 0x00010000,
};

#endif

#line 2
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