const isZero = h => !h || /^0*$/.test(h);
const dropsToXah = d => { d = BigInt(d); const i = d / 1000000n, f = (d % 1000000n).toString().padStart(6, '0').replace(/0+$/, ''); return i.toString() + (f ? '.' + f : ''); };
const RM_TAIL = ' · verify on xahaubox.com';
const RM_RE = /^(.+?), (?:until ≈ (\d{4}-\d{2}-\d{2}) \(ledger (\d+)\)|no time limit)( · verify on xahaubox\.com)$/;
const rmName = n => 'box #' + n;
function rmContents(b, gc) { const a = BigInt('0x' + b.amt), p = []; if (a) p.push(dropsToXah(a) + ' XAH'); if (!isZero(b.tid)) p.push(gc ? 'gift code (locked)' : '1 URIToken'); return p.join(' + ') || 'empty'; }
function rmValue(b, gc, cur, sec) {
  const exp = parseInt(b.exp || '0', 16);
  if (!exp) return rmContents(b, gc) + ', no time limit' + RM_TAIL;
  const d = new Date(Date.now() + Math.max(0, exp - cur) * sec * 1000).toISOString().slice(0, 10);
  return rmContents(b, gc) + ', until ≈ ' + d + ' (ledger ' + exp + ')' + RM_TAIL;
}
/* remarks: [{name, value}] read from the key; boxes: hook-state boxes of the issuer under this key;
   gc(tid) -> true / false / null (unknown). Returns one result per remark: ok | bad | gone | alien. */
function rmVerify(remarks, boxes, cur, sec, gc) {
  return remarks.map(r => {
    const m = /^box #(\d+)$/.exec(r.name);
    if (!m) return { ...r, st: 'alien' };
    const b = boxes.find(x => x.nonce === Number(m[1]));
    if (!b) return { ...r, st: 'gone' };
    const v = RM_RE.exec(r.value || '');
    if (!v) return { ...r, st: 'bad' };
    const g = isZero(b.tid) ? false : gc(b.tid);
    const okC = g === null ? [rmContents(b, true), rmContents(b, false)].includes(v[1]) : v[1] === rmContents(b, g);
    const exp = parseInt(b.exp || '0', 16);
    let okE = exp ? v[3] && Number(v[3]) === exp : !v[3];
    if (okE && exp && exp > cur) { // the date is approximate: allow 3 days + 10% of the time left
      const want = Date.now() + (exp - cur) * sec * 1000, got = Date.parse(v[2] + 'T12:00:00Z');
      okE = Math.abs(got - want) <= 3 * 864e5 + 0.1 * (exp - cur) * sec * 1000; }
    return { ...r, st: okC && okE ? 'ok' : 'bad' };
  });
}
module.exports={rmValue,rmVerify,rmName};
