// ===== إعدادات التطبيق — مربوط بمشروع Supabase الخاص بالنقابة =====
window.NAQABA_CONFIG = {
  SUPABASE_URL: "https://mdgeichzpmjhkrqpcuhv.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_JcRM_8mxJ1eQ-Jp5T_te3w_LtojdCkd",
  APP_NAME: "نقابة المحاسبين والمدققين العراقيين",
  VERSION: "1.0.0"
};

/* تطبيق نقابة المحاسبين والمدققين العراقيين — منطق التطبيق (نسخة تشغيلية) */
(function () {
"use strict";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const fmt = n => (Math.round(Number(n) || 0)).toLocaleString('en-US');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { const v = localStorage.getItem('nq_' + k); return v ? JSON.parse(v) : d } catch (e) { return d } }, set(k, v) { try { localStorage.setItem('nq_' + k, JSON.stringify(v)) } catch (e) { } } };
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2400) }
const CONFIG = window.NAQABA_CONFIG || {};
const YEAR = new Date().getFullYear();
const STATUS = { submitted: 'طلب مسجل', awaiting_payment: 'بانتظار الدفع', paid: 'مدفوع — بانتظار التأكيد', approved: 'منجز', rejected: 'مرفوض' };
const CATS = ['عضو', 'ممارس', 'مشارك'];

/* ---------- المظهر ---------- */
const root = document.documentElement;
let theme = store.get('theme', null); if (theme) root.dataset.theme = theme;
$('#themeBtn').onclick = () => { const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; theme = dark ? 'light' : 'dark'; root.dataset.theme = theme; store.set('theme', theme) };

/* ---------- الاتصال ---------- */
let sb = null;
/* شريط أخطاء مرئي: أي خطأ يظهر على الشاشة بدل صفحة فارغة */
function showFatal(msg) {
  try {
    let b = document.getElementById('fatalBar');
    if (!b) { b = document.createElement('div'); b.id = 'fatalBar'; b.setAttribute('dir', 'ltr'); b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#A23B2A;color:#fff;font:13px/1.4 monospace;padding:10px 14px;white-space:pre-wrap;word-break:break-word;max-height:40vh;overflow:auto'; document.body.appendChild(b) }
    b.textContent = 'خطأ: ' + String(msg).slice(0, 600);
  } catch (e) { }
}
window.addEventListener('error', e => showFatal((e.message || 'error') + (e.filename ? ' @' + e.filename.split('/').pop() + ':' + e.lineno : '')));
window.addEventListener('unhandledrejection', e => showFatal(e.reason && (e.reason.message || e.reason) || 'promise error'));
/* تحميل مكتبة Supabase مع بدائل إذا تعذر الوصول إلى CDN الأول */
function loadScript(src, ms) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.async = true; const t = setTimeout(() => { s.remove(); rej(new Error('timeout ' + src)) }, ms || 12000); s.onload = () => { clearTimeout(t); res() }; s.onerror = () => { clearTimeout(t); s.remove(); rej(new Error('load failed ' + src)) }; document.head.appendChild(s) });
}
async function ensureLib() {
  if (window.supabase && window.supabase.createClient) return true;
  const urls = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js', 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js'];
  for (const u of urls) { try { await loadScript(u); if (window.supabase && window.supabase.createClient) return true } catch (e) { } }
  return false;
}
function connect() {
  try {
    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && window.supabase) sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit', lock: (name, timeout, fn) => fn() }
    });
  } catch (e) { sb = null; showFatal('createClient: ' + (e.message || e)) }
}
function withTimeout(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]) }
const S = { session: null, profile: null, fees: [], settings: {}, requests: [], notices: [], isStaff: false, booted: false };

function screen(name) {
  ['s-setup', 's-auth', 's-onboard'].forEach(id => $('#' + id).hidden = id !== 's-' + name);
  $('#app').hidden = name !== 'app';
}
function dbErr(e) { console.error(e); return (e && (e.message || e.error_description)) ? String(e.message || e.error_description) : 'حدث خطأ غير متوقع' }

/* ---------- تسجيل الدخول ---------- */
let authEmail = '';
$('#aSend').onclick = async () => {
  const email = $('#aEmail').value.trim().toLowerCase(); $('#aErr').textContent = '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $('#aErr').textContent = 'اكتب بريداً صحيحاً'; return }
  $('#aSend').disabled = true;
  const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: location.href.split('#')[0] } });
  $('#aSend').disabled = false;
  if (error) { $('#aErr').textContent = 'تعذر إرسال الرمز: ' + dbErr(error); return }
  authEmail = email; $('#aEmailShow').textContent = email; $('#authStep1').hidden = true; $('#authStep2').hidden = false; $('#aCode').focus();
};
$('#aBack').onclick = () => { $('#authStep1').hidden = false; $('#authStep2').hidden = true; $('#aErr').textContent = '' };
$('#aVerify').onclick = async () => {
  const token = $('#aCode').value.replace(/\D/g, ''); $('#aErr').textContent = '';
  if (token.length < 6) { $('#aErr').textContent = 'أدخل الرمز المكوّن من 6 أرقام'; return }
  $('#aVerify').disabled = true;
  const { error } = await sb.auth.verifyOtp({ email: authEmail, token, type: 'email' });
  $('#aVerify').disabled = false;
  if (error) { $('#aErr').textContent = 'الرمز غير صحيح أو انتهت صلاحيته'; return }
};
$('#aCode').addEventListener('keydown', e => { if (e.key === 'Enter') $('#aVerify').click() });
$('#aEmail').addEventListener('keydown', e => { if (e.key === 'Enter') $('#aSend').click() });

async function afterLogin() {
  const uid = S.session.user.id;
  let { data: p, error } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (error) { toast(dbErr(error)); }
  if (!p) { // في حال لم يُنشأ الملف تلقائياً
    const { data: np } = await sb.from('profiles').insert({ id: uid, email: S.session.user.email }).select().single();
    p = np || { id: uid, email: S.session.user.email, category: 'عضو', role: 'member' };
  }
  S.profile = p; S.isStaff = ['staff', 'admin'].includes(p.role);
  if (!p.full_name || !p.membership_no) { screen('onboard'); return }
  await loadAll(); screen('app');
}
$('#oSave').onclick = async () => {
  const full_name = $('#oName').value.trim(), membership_no = $('#oNum').value.trim();
  $('#oErr').textContent = '';
  if (full_name.length < 5 || !membership_no) { $('#oErr').textContent = 'الاسم الكامل ورقم العضوية مطلوبان'; return }
  $('#oSave').disabled = true;
  const { data, error } = await sb.from('profiles').update({ full_name, membership_no, category: $('#oCat').value, branch: $('#oBranch').value.trim(), phone: $('#oPhone').value.trim() }).eq('id', S.profile.id).select().single();
  $('#oSave').disabled = false;
  if (error) { $('#oErr').textContent = /duplicate|unique/i.test(error.message) ? 'رقم العضوية مسجّل لحساب آخر. راجع النقابة.' : dbErr(error); return }
  S.profile = data; await loadAll(); screen('app');
};
$('#logout').onclick = async () => { await sb.auth.signOut(); location.reload() };

/* ---------- تحميل البيانات ---------- */
async function loadAll() {
  const [f, st, n] = await Promise.all([
    sb.from('fees').select('*').eq('active', true).order('sort'),
    sb.from('settings').select('*'),
    sb.from('notices').select('*').order('pinned', { ascending: false }).order('published_at', { ascending: false }).limit(10),
  ]);
  S.fees = f.data || []; S.notices = n.data || [];
  S.settings = {}; (st.data || []).forEach(r => S.settings[r.key] = r.value);
  await loadRequests();
  renderHome(); renderServices(); renderMe();
  if (S.isStaff) renderAdminEntry();
}
async function loadRequests() {
  let q = sb.from('requests').select('*').order('created_at', { ascending: false }).limit(S.isStaff ? 500 : 100);
  if (!S.isStaff) q = q.eq('member_id', S.profile.id);
  const { data } = await q; S.requests = data || [];
}
const fx = () => Number(S.settings.fx_usd_iqd) || 0;
const myReqs = () => S.requests.filter(r => r.member_id === S.profile.id);
function subscriptionActive() { return myReqs().some(r => r.fee_id === 'renew' && r.status === 'approved' && r.year === YEAR) }

/* ---------- التنقل ---------- */
function go(tab) {
  $$('.view').forEach(v => v.classList.toggle('on', v.id === 'v-' + tab));
  $$('nav.tabs button').forEach(b => { if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current') });
  window.scrollTo(0, 0);
}
$$('nav.tabs button').forEach(b => b.onclick = () => go(b.dataset.tab));
$$('.quick button').forEach(b => b.onclick = () => { go(b.dataset.go); if (b.dataset.mode) setMode(b.dataset.mode); if (b.dataset.svc) openFee(b.dataset.svc) });

/* ---------- الرئيسية ---------- */
function qrSvg(seed) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const n = 21; let r = '';
  const fin = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="currentColor"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="var(--surface)"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="currentColor"/>`;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
    if (h % 2) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="currentColor"/>`;
  }
  return `<svg viewBox="0 0 21 21" style="color:var(--ink)" shape-rendering="crispEdges">${fin(0, 0) + fin(14, 0) + fin(0, 14) + r}</svg>`;
}
function renderHome() {
  const p = S.profile;
  $('#mName').textContent = p.full_name; $('#mNum').textContent = p.membership_no; $('#mCat').textContent = p.category; $('#mCity').textContent = p.branch || '';
  $('#qr').innerHTML = qrSvg(p.membership_no + '|' + p.id);
  const ok = subscriptionActive();
  $('#mStatus').innerHTML = !p.active ? `<span class="status due">● العضوية موقوفة — راجع النقابة</span>` : ok ? `<span class="status ok">● الاشتراك نافذ لسنة ${YEAR}</span>` : `<span class="status due">● اشتراك ${YEAR} غير مسدد</span>`;
  const pendingRenew = myReqs().some(r => r.fee_id === 'renew' && r.year === YEAR && r.status !== 'rejected' && r.status !== 'approved');
  $('#dueAlert').innerHTML = (ok || pendingRenew) ? '' : `<div class="alert"><div><b>اشتراكك السنوي مستحق.</b> حسب المادة العاشرة من قانون النقابة، التأخر بعد التبليغ لمدة 30 يوماً يعرّض الاسم للشطب من السجل.</div><button class="btn small" id="payNow">جدد</button></div>`;
  const pn = $('#payNow'); if (pn) pn.onclick = () => { go('services'); openFee('renew') };
  $('#fxVal').textContent = fx() ? fmt(fx()) + ' IQD' : '—';
  $('#notices').innerHTML = S.notices.length ? `<div class="card" style="padding:4px 14px"><div class="hist">${S.notices.map(n => `<div><span>${n.pinned ? '📌 ' : ''}<b style="font-weight:500">${esc(n.title)}</b>${n.body ? `<br><small style="color:var(--muted)">${esc(n.body)}</small>` : ''}</span><span style="color:var(--muted);white-space:nowrap">${new Date(n.published_at).toLocaleDateString('en-GB')}</span></div>`).join('')}</div></div>` : '<div class="empty">لا توجد تعاميم حالياً.</div>';
}
$('#vGo').onclick = async () => {
  const no = $('#vNo').value.trim(); if (!no) return; $('#vOut').innerHTML = '<div class="empty">يتحقق…</div>';
  const { data, error } = await sb.rpc('verify_member', { p_no: no });
  const m = data && data[0];
  $('#vOut').innerHTML = error ? `<div class="err">${esc(dbErr(error))}</div>` : m ? `<div class="card" style="padding:12px 14px;margin-top:8px"><b>${esc(m.full_name)}</b><div style="font-size:13px;color:var(--muted)">${esc(m.category)} · ${esc(m.branch || '')} · <span class="chip ${m.active ? 's-approved' : 's-rejected'}">${m.active ? 'عضوية نافذة' : 'موقوف'}</span></div></div>` : '<div class="empty">لا يوجد عضو مسجّل بهذا الرقم.</div>';
};

/* ---------- الخدمات والطلبات ---------- */
function feeAmt(f) { const a = f.amount_by_cat ? f.amount_by_cat[S.profile.category] : f.amount; return (a === null || a === undefined || a === '') ? null : Number(a) }
function amtLabel(f) { const a = feeAmt(f); return a === null ? '<span class="pending">بانتظار الإقرار</span>' : fmt(a) + (f.per_copy ? ' / نسخة' : '') }
function renderServices() {
  if (!S.fees.length) { $('#svcList').innerHTML = '<div class="empty">لم تُضف الخدمات بعد.</div>'; return }
  const groups = [...new Set(S.fees.map(f => f.grp))];
  $('#svcList').innerHTML = groups.map(g => `<h3>${esc(g)}</h3><div class="group">${S.fees.filter(f => f.grp === g).map(f => `
    <button class="svc" data-id="${esc(f.id)}"><div class="t"><b>${esc(f.title)}</b><span>${esc(f.descr || '')}</span></div><div class="amt">${amtLabel(f)}</div></button>`).join('')}</div>`).join('');
  $$('#svcList .svc').forEach(b => b.onclick = () => openFee(b.dataset.id));
}
function openSheet(html) { $('#sheetIn').innerHTML = html; $('#scrim').classList.add('on'); $('#sheet').classList.add('on') }
function closeSheet() { $('#scrim').classList.remove('on'); $('#sheet').classList.remove('on') }
$('#scrim').onclick = closeSheet; document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet() });
function bankBox() {
  const b = (S.settings.syndicate || {}).bank || {};
  if (!b.iban && !b.name) return '<p class="note">لم تُضف النقابة بيانات الحساب المصرفي بعد. يمكنك الدفع في مقر النقابة ورفع الإيصال هنا.</p>';
  return `<div class="bank"><b>الدفع بالحوالة أو الإيداع:</b><br>${esc(b.name || '')}${b.holder ? ' — ' + esc(b.holder) : ''}<br><span style="direction:ltr;display:inline-block">${esc(b.iban || '')}</span><br><small>بعد التحويل ارفع صورة الإيصال من "حسابي" ويتم التأكيد خلال يوم عمل.</small></div>`;
}
function openFee(id) {
  const f = S.fees.find(x => x.id === id); if (!f) return;
  const amt = feeAmt(f), priced = amt !== null;
  const docs = Array.isArray(f.docs) ? f.docs : [];
  openSheet(`<h2 style="margin-top:0">${esc(f.title)}</h2><p class="lead">${esc(f.descr || '')}${f.amount_by_cat ? ` — صفتك: <b>${esc(S.profile.category)}</b>` : ''}</p>
   ${docs.length ? `<div style="font-weight:600;font-size:14px">المطلوب</div><ul class="docs">${docs.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
   ${f.per_copy ? `<div class="grid2"><div class="field"><label for="qCopies">عدد النسخ</label><input type="number" id="qCopies" value="3" min="1" max="50"></div><div class="field"><label for="qCo">اسم الشركة</label><input id="qCo"></div></div>` : ''}
   <div class="field"><label for="qNote">ملاحظة للنقابة (اختياري)</label><input id="qNote"></div>
   ${priced ? `<div class="total"><span>المجموع</span><span class="a" id="qTot">${fmt(amt * (f.per_copy ? 3 : 1))} IQD</span></div>${bankBox()}<button class="btn block" id="doReq">قدّم الطلب</button>`
      : `<div class="total"><span>الرسم</span><span class="pending">بانتظار إقرار مجلس النقابة</span></div><button class="btn block" id="doReq">أرسل الطلب الآن وادفع لاحقاً</button><p class="note">يُسجَّل طلبك برقم معاملة، وعند إقرار المبلغ يصلك إشعار لإكمال الدفع.</p>`}
   <div class="err" id="qErr"></div>`);
  const qc = $('#qCopies'); if (qc && priced) qc.oninput = () => { $('#qTot').textContent = fmt(amt * Math.max(1, +qc.value || 1)) + ' IQD' };
  $('#doReq').onclick = async () => {
    const copies = qc ? Math.max(1, Math.min(50, +qc.value || 1)) : 1;
    const co = $('#qCo') ? $('#qCo').value.trim() : '';
    $('#doReq').disabled = true; $('#qErr').textContent = '';
    const { data, error } = await sb.from('requests').insert({
      member_id: S.profile.id, fee_id: f.id, title: f.title + (co ? ` — ${co}` : ''), copies, company: co || null,
      amount: priced ? amt * copies : null, status: priced ? 'awaiting_payment' : 'submitted', member_note: $('#qNote').value.trim() || null
    }).select().single();
    $('#doReq').disabled = false;
    if (error) { $('#qErr').textContent = dbErr(error); return }
    S.requests.unshift(data);
    openSheet(`<div class="receipt"><div class="ok">✓</div><h2 style="margin:0">${priced ? 'تم تسجيل الطلب' : 'تم تسجيل الطلب'}</h2><p class="lead">${priced ? 'ادفع المبلغ ثم ارفع الإيصال من "حسابي" ليُؤكَّد الطلب.' : 'وصل طلبك للنقابة، وعند إقرار الرسم يصلك إشعار.'}</p>
      <dl><dt>المعاملة</dt><dd>${esc(data.title)}</dd><dt>المبلغ</dt><dd>${priced ? fmt(data.amount) + ' IQD' : 'يُحدد لاحقاً'}</dd><dt>الحالة</dt><dd>${STATUS[data.status]}</dd><dt>رقم المعاملة</dt><dd style="direction:ltr;text-align:right">${esc(data.ref)}</dd><dt>التاريخ</dt><dd>${new Date(data.created_at).toLocaleDateString('en-GB')}</dd></dl>
      ${priced ? `<button class="btn block" id="rcUpload">ارفع الإيصال الآن</button>` : ''}<button class="btn block ghost" id="rcClose" style="margin-top:8px">تمام</button></div>`);
    $('#rcClose').onclick = closeSheet;
    const up = $('#rcUpload'); if (up) up.onclick = () => openReceipt(data.id);
    renderHome(); renderMe();
  };
}
function openReceipt(reqId) {
  const r = S.requests.find(x => x.id === reqId); if (!r) return;
  openSheet(`<h2 style="margin-top:0">رفع إيصال الدفع</h2><p class="lead">${esc(r.title)} — ${r.amount ? fmt(r.amount) + ' IQD' : ''}</p>${bankBox()}
   <div class="field"><label for="rcMethod">طريقة الدفع</label><select id="rcMethod"><option>حوالة مصرفية</option><option>إيداع نقدي</option><option>زين كاش</option><option>كي كارد</option><option>فاست بي</option><option>دفع في مقر النقابة</option></select></div>
   <label class="drop"><input type="file" id="rcFile" accept="image/*,application/pdf" hidden><div>اضغط لاختيار صورة الإيصال</div><div id="rcPrev"></div></label>
   <button class="btn block" id="rcGo" style="margin-top:12px" disabled>أرسل الإيصال</button><div class="err" id="rcErr"></div>`);
  let file = null;
  $('#rcFile').onchange = e => { file = e.target.files[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { $('#rcErr').textContent = 'الملف أكبر من 5 ميغابايت'; file = null; return } $('#rcPrev').innerHTML = file.type.startsWith('image/') ? `<img alt="الإيصال" src="${URL.createObjectURL(file)}">` : `<div>${esc(file.name)}</div>`; $('#rcGo').disabled = false };
  $('#rcGo').onclick = async () => {
    if (!file) return; $('#rcGo').disabled = true; $('#rcErr').textContent = '';
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${S.profile.id}/${r.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await sb.storage.from('receipts').upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (upErr) { $('#rcErr').textContent = 'فشل رفع الملف: ' + dbErr(upErr); $('#rcGo').disabled = false; return }
    const { data, error } = await sb.from('requests').update({ receipt_path: path, payment_method: $('#rcMethod').value, status: 'paid' }).eq('id', r.id).select().single();
    if (error) { $('#rcErr').textContent = dbErr(error); $('#rcGo').disabled = false; return }
    Object.assign(r, data); closeSheet(); toast('وصل الإيصال للنقابة'); renderMe(); renderHome();
  };
}

/* ---------- حسابي ---------- */
function reqCard(r, adminMode) {
  const date = new Date(r.created_at).toLocaleDateString('en-GB');
  return `<div class="req"><div class="h"><b>${esc(r.title)}</b><span class="chip s-${r.status}">${STATUS[r.status] || r.status}</span></div>
    <div class="m">${esc(r.ref)} · ${date}${r.amount != null ? ' · ' + fmt(r.amount) + ' IQD' : ''}${r.payment_method ? ' · ' + esc(r.payment_method) : ''}${r.admin_note ? `<br>ملاحظة النقابة: ${esc(r.admin_note)}` : ''}${r.member_note && adminMode ? `<br>ملاحظة العضو: ${esc(r.member_note)}` : ''}</div>
    <div class="row" style="margin-top:8px">${!adminMode && r.status === 'awaiting_payment' ? `<button class="btn small" data-rc="${r.id}">ارفع الإيصال</button>` : ''}${adminMode ? `<button class="btn small ghost" data-adm-req="${r.id}">معالجة</button>` : ''}${r.receipt_path ? `<button class="btn small ghost" data-view="${esc(r.receipt_path)}">عرض الإيصال</button>` : ''}</div></div>`;
}
function bindReqButtons(scope) {
  $$(scope + ' [data-rc]').forEach(b => b.onclick = () => openReceipt(b.dataset.rc));
  $$(scope + ' [data-view]').forEach(b => b.onclick = async () => { const { data, error } = await sb.storage.from('receipts').createSignedUrl(b.dataset.view, 600); if (error || !data) { toast('تعذر فتح الإيصال'); return } window.open(data.signedUrl, '_blank') });
  $$(scope + ' [data-adm-req]').forEach(b => b.onclick = () => admProcess(b.dataset.admReq));
}
function renderMe() {
  const p = S.profile; $('#pName').value = p.full_name || ''; $('#pNum').value = p.membership_no || ''; $('#pCat').value = p.category; $('#pCity').value = p.branch || ''; $('#pPhone').value = p.phone || '';
  const mine = myReqs();
  $('#myReqs').innerHTML = mine.length ? mine.map(r => reqCard(r, false)).join('') : '<div class="empty">ما عندك معاملات بعد. ابدأ من صفحة الخدمات.</div>';
  bindReqButtons('#myReqs');
  $('#verLine').textContent = `الإصدار ${CONFIG.VERSION || '1.0'} · ${p.email || ''}`;
}
$('#pSave').onclick = async () => {
  const { data, error } = await sb.from('profiles').update({ full_name: $('#pName').value.trim(), membership_no: $('#pNum').value.trim(), category: $('#pCat').value, branch: $('#pCity').value.trim(), phone: $('#pPhone').value.trim() }).eq('id', S.profile.id).select().single();
  if (error) { toast(/duplicate|unique/i.test(error.message) ? 'رقم العضوية مستخدم لحساب آخر' : dbErr(error)); return }
  S.profile = data; renderHome(); renderServices(); toast('انحفظت بياناتك');
};

/* ---------- لوحة الإدارة ---------- */
function renderAdminEntry() { $('#adminEntry').innerHTML = `<button class="btn block" id="admOpen">لوحة إدارة النقابة</button>`; $('#admOpen').onclick = openAdmin; }
let admFilter = 'open', admPane = 'reqs';
async function openAdmin() { go('admin'); setAdmPane('reqs'); await loadRequests(); renderAdmStats(); renderAdmReqs(); renderFeeEditor(); renderAdmNotices(); }
$('#admBack').onclick = () => { go('me'); renderMe() };
function setAdmPane(m) { admPane = m; $$('#admSeg button').forEach(b => b.setAttribute('aria-selected', b.dataset.adm === m)); $$('[data-adm-pane]').forEach(p => p.hidden = p.dataset.admPane !== m) }
$$('#admSeg button').forEach(b => b.onclick = () => setAdmPane(b.dataset.adm));
$$('#admFilter button').forEach(b => b.onclick = () => { admFilter = b.dataset.st; $$('#admFilter button').forEach(x => x.setAttribute('aria-pressed', x === b)); renderAdmReqs() });
async function renderAdmStats() {
  const { data } = await sb.rpc('admin_stats'); const s = data && data[0]; if (!s) { $('#admStats').innerHTML = ''; return }
  $('#admStats').innerHTML = `<div><b>${fmt(s.members)}</b><span>عضو مسجّل بالتطبيق</span></div><div><b>${fmt(s.pending)}</b><span>طلبات مفتوحة</span></div><div><b>${fmt(s.paid_unconfirmed)}</b><span>مدفوعة بانتظار التأكيد</span></div><div><b>${fmt(s.revenue_this_year)}</b><span>إيرادات ${YEAR} المؤكدة (IQD)</span></div>`;
}
function renderAdmReqs() {
  const list = S.requests.filter(r => admFilter === 'all' ? true : admFilter === 'open' ? ['submitted', 'awaiting_payment'].includes(r.status) : r.status === admFilter);
  $('#admReqs').innerHTML = list.length ? list.map(r => reqCard(r, true)).join('') : '<div class="empty">لا توجد طلبات في هذه الفئة.</div>';
  bindReqButtons('#admReqs');
}
async function admProcess(id) {
  const r = S.requests.find(x => x.id === id); if (!r) return;
  const { data: m } = await sb.from('profiles').select('full_name,membership_no,category,phone').eq('id', r.member_id).maybeSingle();
  openSheet(`<h2 style="margin-top:0">معالجة الطلب</h2><p class="lead">${esc(r.title)} · ${esc(r.ref)}</p>
    <div class="bank">${m ? `<b>${esc(m.full_name)}</b> · ${esc(m.membership_no)} · ${esc(m.category)}${m.phone ? ' · <span style="direction:ltr;display:inline-block">' + esc(m.phone) + '</span>' : ''}` : 'عضو'}<br><small>الحالة الحالية: ${STATUS[r.status]}${r.payment_method ? ' · ' + esc(r.payment_method) : ''}</small>${r.member_note ? `<br><small>ملاحظة العضو: ${esc(r.member_note)}</small>` : ''}</div>
    <div class="grid2"><div class="field"><label for="amAmt">المبلغ (دينار)</label><input type="number" id="amAmt" value="${r.amount ?? ''}" placeholder="غير محدد"></div>
    <div class="field"><label for="amSt">الحالة</label><select id="amSt">${Object.keys(STATUS).map(k => `<option value="${k}" ${k === r.status ? 'selected' : ''}>${STATUS[k]}</option>`).join('')}</select></div></div>
    <div class="field"><label for="amNote">ملاحظة تظهر للعضو</label><input id="amNote" value="${esc(r.admin_note || '')}"></div>
    ${r.receipt_path ? `<button class="btn block ghost" data-view="${esc(r.receipt_path)}" style="margin-bottom:8px">عرض الإيصال</button>` : ''}
    <div class="row"><button class="btn" id="amSave" style="flex:1">احفظ</button>${r.status === 'paid' ? `<button class="btn" id="amApprove" style="background:var(--green)">تأكيد الدفع وإنجاز</button>` : ''}</div><div class="err" id="amErr"></div>`);
  bindReqButtons('#sheetIn');
  const save = async (over) => {
    const amtV = $('#amAmt').value.trim(); const status = over || $('#amSt').value;
    const patch = { amount: amtV === '' ? null : Number(amtV), status, admin_note: $('#amNote').value.trim() || null };
    if (status === 'awaiting_payment' && patch.amount === null) { $('#amErr').textContent = 'حدد المبلغ قبل طلب الدفع'; return }
    const { data, error } = await sb.from('requests').update(patch).eq('id', r.id).select().single();
    if (error) { $('#amErr').textContent = dbErr(error); return }
    Object.assign(r, data); closeSheet(); toast('تم الحفظ'); renderAdmReqs(); renderAdmStats();
  };
  $('#amSave').onclick = () => save(); const ap = $('#amApprove'); if (ap) ap.onclick = () => save('approved');
}
function renderFeeEditor() {
  $('#fxIn').value = fx() || '';
  const val = v => (v === null || v === undefined) ? '' : v;
  $('#feeEdit').innerHTML = S.fees.map(f => f.amount_by_cat ? CATS.map(c => `<div class="feeedit"><span>${esc(f.title)} — ${c}</span><input type="number" placeholder="غير محدد" data-id="${esc(f.id)}" data-c="${c}" value="${val(f.amount_by_cat[c])}"></div>`).join('') : `<div class="feeedit"><span>${esc(f.title)}</span><input type="number" placeholder="غير محدد" data-id="${esc(f.id)}" value="${val(f.amount)}"></div>`).join('');
  const b = (S.settings.syndicate || {}).bank || {}; $('#bankName').value = b.name || ''; $('#bankIban').value = b.iban || ''; $('#bankHolder').value = b.holder || '';
}
$('#feeSave').onclick = async () => {
  $('#feeSave').disabled = true;
  const updates = {};
  $$('#feeEdit input').forEach(inp => { const f = S.fees.find(x => x.id === inp.dataset.id); if (!f) return; const v = inp.value.trim() === '' ? null : Math.max(0, Number(inp.value) || 0); if (inp.dataset.c) { f.amount_by_cat = { ...(f.amount_by_cat || {}), [inp.dataset.c]: v }; updates[f.id] = { amount_by_cat: f.amount_by_cat } } else { f.amount = v; updates[f.id] = { amount: v } } });
  let err = null;
  for (const id of Object.keys(updates)) { const { error } = await sb.from('fees').update({ ...updates[id], updated_at: new Date().toISOString() }).eq('id', id); if (error) err = error }
  const fxv = Number($('#fxIn').value); if (fxv > 0) { const { error } = await sb.from('settings').upsert({ key: 'fx_usd_iqd', value: fxv, updated_at: new Date().toISOString() }); if (error) err = error; else S.settings.fx_usd_iqd = fxv }
  $('#feeSave').disabled = false;
  if (err) { toast(dbErr(err)); return }
  renderServices(); renderHome(); toast('انحفظت الرسوم وسعر الصرف');
};
$('#bankSave').onclick = async () => {
  const syn = { ...(S.settings.syndicate || {}), bank: { name: $('#bankName').value.trim(), iban: $('#bankIban').value.trim(), holder: $('#bankHolder').value.trim() } };
  const { error } = await sb.from('settings').upsert({ key: 'syndicate', value: syn, updated_at: new Date().toISOString() });
  if (error) { toast(dbErr(error)); return } S.settings.syndicate = syn; toast('انحفظت بيانات الدفع');
};
$('#memGo').onclick = async () => {
  const q = $('#memQ').value.trim(); $('#memList').innerHTML = '<div class="empty">يبحث…</div>';
  let qry = sb.from('profiles').select('id,full_name,membership_no,category,branch,phone,role,active,email').order('created_at', { ascending: false }).limit(50);
  if (q) qry = qry.or(`full_name.ilike.%${q.replace(/[,%()]/g, '')}%,membership_no.ilike.%${q.replace(/[,%()]/g, '')}%`);
  const { data, error } = await qry;
  if (error) { $('#memList').innerHTML = `<div class="err">${esc(dbErr(error))}</div>`; return }
  $('#memList').innerHTML = (data || []).length ? data.map(m => `<div class="req"><div class="h"><b>${esc(m.full_name || m.email || '—')}</b><span class="chip ${m.active ? 's-approved' : 's-rejected'}">${m.active ? 'نافذ' : 'موقوف'}</span></div><div class="m">${esc(m.membership_no || 'بدون رقم')} · ${esc(m.category)} · ${esc(m.branch || '')}${m.phone ? ' · <span style="direction:ltr;display:inline-block">' + esc(m.phone) + '</span>' : ''} · ${m.role === 'member' ? 'عضو' : m.role === 'staff' ? 'موظف' : 'مدير'}</div>
    <div class="row" style="margin-top:8px"><button class="btn small ghost" data-tog="${m.id}" data-act="${m.active ? 0 : 1}">${m.active ? 'إيقاف العضوية' : 'تفعيل العضوية'}</button>${S.profile.role === 'admin' && m.id !== S.profile.id ? `<button class="btn small ghost" data-role="${m.id}" data-r="${m.role === 'member' ? 'staff' : 'member'}">${m.role === 'member' ? 'اجعله موظفاً' : 'اجعله عضواً'}</button>` : ''}</div></div>`).join('') : '<div class="empty">لا نتائج.</div>';
  $$('#memList [data-tog]').forEach(b => b.onclick = async () => { const { error } = await sb.from('profiles').update({ active: b.dataset.act === '1' }).eq('id', b.dataset.tog); if (error) toast(dbErr(error)); else $('#memGo').click() });
  $$('#memList [data-role]').forEach(b => b.onclick = async () => { if (!confirm('تأكيد تغيير الصلاحية؟')) return; const { error } = await sb.from('profiles').update({ role: b.dataset.r }).eq('id', b.dataset.role); if (error) toast(dbErr(error)); else $('#memGo').click() });
};
function renderAdmNotices() {
  $('#admNotices').innerHTML = S.notices.map(n => `<div class="req"><div class="h"><b>${esc(n.title)}</b><button class="btn small ghost" data-del="${n.id}">حذف</button></div><div class="m">${esc(n.body || '')}</div></div>`).join('');
  $$('#admNotices [data-del]').forEach(b => b.onclick = async () => { if (!confirm('حذف التعميم؟')) return; const { error } = await sb.from('notices').delete().eq('id', b.dataset.del); if (error) { toast(dbErr(error)); return } S.notices = S.notices.filter(n => n.id !== b.dataset.del); renderAdmNotices(); renderHome() });
}
$('#nSend').onclick = async () => {
  const title = $('#nTitle').value.trim(); if (!title) { toast('اكتب عنوان التعميم'); return }
  const { data, error } = await sb.from('notices').insert({ title, body: $('#nBody').value.trim() || null, pinned: $('#nPin').checked, created_by: S.profile.id }).select().single();
  if (error) { toast(dbErr(error)); return } S.notices.unshift(data); $('#nTitle').value = ''; $('#nBody').value = ''; $('#nPin').checked = false; renderAdmNotices(); renderHome(); toast('نُشر التعميم');
};
function renderSchedule() {
  const groups = [...new Set(S.fees.map(f => f.grp))]; let i = 0;
  $('#schedTable').innerHTML = `<thead><tr><th>#</th><th>الخدمة</th><th>الوصف</th><th>السند</th><th>المبلغ المقر (دينار)</th></tr></thead><tbody>${groups.map(g => `<tr><td class="g" colspan="5">${esc(g)}</td></tr>` + S.fees.filter(f => f.grp === g).map(f => { i++;
    return f.amount_by_cat ? CATS.map((c, k) => `<tr><td>${k ? '' : i}</td><td>${k ? '' : esc(f.title)}<br><small style="color:var(--muted)">${c}</small></td><td>${k ? '' : esc(f.descr || '')}</td><td>${k ? '' : esc(f.basis || '')}</td><td class="blank">${f.amount_by_cat[c] == null ? '' : fmt(f.amount_by_cat[c])}</td></tr>`).join('')
      : `<tr><td>${i}</td><td>${esc(f.title)}</td><td>${esc(f.descr || '')}${f.per_copy ? ' (لكل نسخة)' : ''}</td><td>${esc(f.basis || '')}</td><td class="blank">${f.amount == null ? '' : fmt(f.amount)}</td></tr>` }).join('')).join('')}</tbody>`;
}
$('#schedOpen').onclick = () => { renderSchedule(); go('fees') };
$('#schedBack').onclick = () => go('admin');
$('#schedPrint').onclick = () => window.print();

/* ---------- الحسابات الختامية (محلياً، بدون شبكة) ---------- */
const IDS = ['sales', 'salesRet', 'invOpen', 'purch', 'purchRet', 'purchExp', 'invClose', 'wages', 'rent', 'util', 'admin', 'ss', 'otherInc', 'fixed', 'accDep', 'depRate', 'debtors', 'cash', 'creditors', 'loans', 'capital', 'draw'];
const DEMO = { sales: 480000000, salesRet: 6000000, invOpen: 55000000, purch: 340000000, purchRet: 4000000, purchExp: 7500000, invClose: 62000000, wages: 36000000, rent: 18000000, util: 9600000, admin: 7200000, ss: 4320000, otherInc: 2500000, fixed: 90000000, accDep: 18000000, depRate: 10, debtors: 41000000, cash: '', creditors: 38000000, loans: 20000000, capital: 150000000, draw: 0 };
$('#fillDemo').onclick = () => { IDS.forEach(k => $('#' + k).value = DEMO[k]); $('#f_name').value = 'شركة الرافدين للتجارة العامة المحدودة'; toast('انملت الحقول بمثال') };
let lastAcc = null;
function line(label, amt, cls = '') { return `<div class="line ${cls}"><span>${esc(label)}</span><span class="a">${amt === '' ? '' : fmt(amt)}</span></div>` }
function pad(arr, n) { while (arr.length < n) arr.push('<div class="line"></div>'); return arr.join('') }
function tAcc(title, sub, dr, cr, total) {
  const n = Math.max(dr.length, cr.length);
  return `<div class="ledger"><div class="lh">${esc(title)}<small>${esc(sub)}</small></div><div class="scroll"><div class="taccount" style="min-width:320px">
   <div class="side"><div class="sh">منه — مدين</div>${pad(dr, n)}${line('المجموع', total, 'tot')}</div>
   <div class="side"><div class="sh">له — دائن</div>${pad(cr, n)}${line('المجموع', total, 'tot')}</div></div></div></div>`;
}
$('#accForm').onsubmit = e => {
  e.preventDefault();
  const v = {}; IDS.forEach(k => v[k] = parseFloat($('#' + k).value) || 0);
  if (!v.sales && !v.purch) { toast('دخّل المبيعات والمشتريات على الأقل'); return }
  const name = $('#f_name').value || 'المنشأة', type = $('#f_type').value, year = $('#f_year').value;
  const netSales = v.sales - v.salesRet, netPurch = v.purch - v.purchRet + v.purchExp;
  const cogs = v.invOpen + netPurch - v.invClose, gross = netSales - cogs;
  const dep = v.fixed * v.depRate / 100;
  const expenses = v.wages + v.rent + v.util + v.admin + v.ss + dep;
  const netBefore = gross + v.otherInc - expenses;
  const taxRate = type === 'ltd' ? 0.15 : 0;
  const tax = netBefore > 0 ? netBefore * taxRate : 0;
  const netAfter = netBefore - tax;
  const netFixed = v.fixed - v.accDep - dep;
  const equity = v.capital + netAfter - v.draw;
  const liabSide = v.creditors + v.loans + tax + equity;
  let cash = v.cash, plugged = false;
  if ($('#cashPlug').checked) { cash = liabSide - (netFixed + v.invClose + v.debtors); plugged = true }
  const assets = netFixed + v.invClose + v.debtors + Math.max(cash, 0);
  const liabTotal = liabSide + (cash < 0 ? -cash : 0);
  const diff = assets - liabTotal;
  const trDr = [line('مخزون أول المدة', v.invOpen), line('صافي المشتريات', netPurch)];
  const trCr = [line('صافي المبيعات', netSales), line('مخزون آخر المدة', v.invClose)];
  if (gross >= 0) trDr.push(line('مجمل الربح ← أ.خ', gross, 'res')); else trCr.push(line('مجمل الخسارة ← أ.خ', -gross, 'res loss'));
  const trTot = Math.max(v.invOpen + netPurch + Math.max(gross, 0), netSales + v.invClose + Math.max(-gross, 0));
  const plDr = [line('رواتب وأجور', v.wages), line('إيجارات', v.rent), line('كهرباء ووقود', v.util), line('مصاريف إدارية', v.admin), line('حصة الضمان الاجتماعي', v.ss), line(`اندثار السنة ${v.depRate}%`, dep)];
  const plCr = []; if (gross >= 0) plCr.push(line('مجمل الربح', gross)); else plDr.unshift(line('مجمل الخسارة', -gross));
  if (v.otherInc) plCr.push(line('إيرادات أخرى', v.otherInc));
  if (netBefore >= 0) plDr.push(line('صافي الربح قبل الضريبة', netBefore, 'res')); else plCr.push(line('صافي الخسارة', -netBefore, 'res loss'));
  const plTot = Math.max(gross, 0) + v.otherInc + Math.max(-netBefore, 0);
  const bsA = [line('الموجودات الثابتة بالكلفة', v.fixed), line('(−) مخصص الاندثار', v.accDep + dep), line('صافي الموجودات الثابتة', netFixed, 'res'), line('المخزون', v.invClose), line('المدينون', v.debtors), line(plugged ? 'النقد (محسوب)' : 'النقد', Math.max(cash, 0))];
  const bsL = [line('رأس المال', v.capital), line(netAfter >= 0 ? '(+) صافي الربح بعد الضريبة' : '(−) صافي الخسارة', Math.abs(netAfter))];
  if (v.draw) bsL.push(line('(−) المسحوبات', v.draw));
  bsL.push(line('حقوق الملكية', equity, 'res'), line('الدائنون', v.creditors), line('القروض', v.loans));
  if (tax) bsL.push(line('ضريبة دخل مستحقة', tax));
  if (cash < 0) bsL.push(line('سحب على المكشوف', -cash, 'loss'));
  const n = Math.max(bsA.length, bsL.length);
  const bs = `<div class="ledger"><div class="lh">الميزانية العمومية<small>كما في ${esc(year)}</small></div><div class="scroll"><div class="taccount" style="min-width:320px">
    <div class="side"><div class="sh">الموجودات</div>${pad(bsA, n)}${line('المجموع', assets, 'tot')}</div>
    <div class="side"><div class="sh">المطلوبات وحقوق الملكية</div>${pad(bsL, n)}${line('المجموع', liabTotal, 'tot')}</div></div></div>
    <div class="verdict ${Math.abs(diff) < 1 ? 'ok' : 'bad'}">${Math.abs(diff) < 1 ? '✓ الميزانية متوازنة' : '✗ الميزانية غير متوازنة بفرق ' + fmt(diff) + ' — راجع الأرصدة أو فعّل حساب النقد التلقائي'}${cash < 0 ? ' · النقد المحسوب سالب، يعني المنشأة تحتاج تمويل أو بعض الأرصدة ناقصة' : ''}</div></div>`;
  const gm = netSales ? gross / netSales * 100 : 0, nm = netSales ? netBefore / netSales * 100 : 0, roe = equity ? netAfter / equity * 100 : 0, cur = (v.creditors + tax) ? (v.invClose + v.debtors + Math.max(cash, 0)) / (v.creditors + tax + (cash < 0 ? -cash : 0)) : 0;
  const taxNote = type === 'ltd' ? `ضريبة الدخل التقديرية 15% على الشركات: <b>${fmt(tax)}</b> دينار. الرقم تقديري قبل التعديلات الضريبية (المصاريف غير المقبولة والخسائر المدورة).` : `المشروع الفردي والشركة التضامنية تنحسب ضريبتها على الشخص الطبيعي حسب الشرائح والسماحات بقانون ضريبة الدخل رقم 113 لسنة 1982 المعدل. اسأل المستشار الذكي للتفصيل.`;
  lastAcc = { name, type: $('#f_type').selectedOptions[0].text, act: $('#f_act').value, year, v, netSales, netPurch, cogs, gross, dep, expenses, netBefore, tax, netAfter, netFixed, equity, cash, assets, liabTotal, diff };
  $('#accOut').innerHTML = `<h2>${esc(name)}</h2><p class="lead">${esc(lastAcc.type)} · نشاط ${esc(lastAcc.act)} · السنة المنتهية في ${esc(year)}</p>
   ${tAcc('حساب المتاجرة', 'للسنة المنتهية في ' + year, trDr, trCr, trTot)}
   ${tAcc('حساب الأرباح والخسائر', 'للسنة المنتهية في ' + year, plDr, plCr, plTot)}
   ${bs}
   <p class="note">${taxNote}</p>
   <h3>المؤشرات المالية</h3>
   <div class="ratios"><div><b>${gm.toFixed(1)}%</b><span>هامش مجمل الربح</span></div><div><b>${nm.toFixed(1)}%</b><span>هامش صافي الربح</span></div><div><b>${roe.toFixed(1)}%</b><span>العائد على حقوق الملكية</span></div><div><b>${cur.toFixed(2)}</b><span>نسبة التداول</span></div></div>
   <div class="row noprint" style="margin-top:10px"><button class="btn" id="aiAnalyze" style="flex:1">حلّل ودقّق بالذكاء الاصطناعي</button><button class="btn ghost" id="printBtn">اطبع</button><button class="btn ghost" id="certBtn">اطلب التصديق</button></div>
   <div id="aiAcc"></div>
   <p class="note">المسودة جاهزة للمراجعة. المحاسب يراجع الأرقام ويوقّع قبل التقديم للتصديق، لأن المسؤولية المهنية عليه.</p>`;
  $('#printBtn').onclick = () => window.print();
  $('#certBtn').onclick = () => { go('services'); openFee('certify'); const co = $('#qCo'); if (co) co.value = name };
  $('#aiAnalyze').onclick = analyzeAcc;
  $('#accOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ---------- الذكاء الاصطناعي عبر دالة الخادم ---------- */
async function ai(body) {
  const { data, error } = await sb.functions.invoke('ai', { body: { ...body, fx: fx() } });
  if (error) {
    let msg = 'تعذر الاتصال بالمساعد الذكي';
    try { const ctx = error.context; if (ctx && typeof ctx.json === 'function') { const j = await ctx.json(); if (j && j.message) msg = j.message; else if (j && j.error === 'unauthorized') msg = 'سجّل الدخول من جديد' } } catch (e) { }
    throw new Error(msg);
  }
  if (data && data.error) throw new Error(data.message || data.error);
  return data;
}
function md(t) {
  const lines = esc(t).split('\n'); let out = '', inList = false;
  for (let l of lines) {
    l = l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    if (/^#{1,4}\s/.test(l)) { if (inList) { out += '</ul>'; inList = false } out += '<h4>' + l.replace(/^#{1,4}\s/, '') + '</h4>' }
    else if (/^\s*[-*•]\s/.test(l) || /^\s*\d+[.)]\s/.test(l)) { if (!inList) { out += '<ul>'; inList = true } out += '<li>' + l.replace(/^\s*([-*•]|\d+[.)])\s/, '') + '</li>' }
    else if (l.trim() === '') { if (inList) { out += '</ul>'; inList = false } }
    else { if (inList) { out += '</ul>'; inList = false } out += '<p>' + l + '</p>' }
  }
  if (inList) out += '</ul>'; return out;
}
async function analyzeAcc() {
  if (!lastAcc) return; const out = $('#aiAcc'), btn = $('#aiAnalyze'); btn.disabled = true;
  out.innerHTML = '<div class="ai-out">يحلل الحسابات… (قد يستغرق نصف دقيقة)</div>';
  const a = lastAcc;
  const prompt = `حلّل الحسابات الختامية التالية كمدقق خبير بالسوق العراقي. أعطِ:\n## الخلاصة (سطرين)\n## ملاحظات التدقيق (أخطاء محتملة، أرقام غير منطقية، ما سيسأل عنه مخمّن الضريبة)\n## التعديلات الضريبية المتوقعة (مصاريف غير مقبولة، نسب اندثار مقارنة بجداول الاندثار المعتمدة)\n## مقارنة بطبيعة النشاط في العراق (هل الهوامش معقولة لنشاط ${a.act}؟ قل إنها تقديرية)\n## المرفقات المطلوبة عند التقديم\nكن مختصراً ومباشراً.\n\nالبيانات (بالدينار العراقي):\n${JSON.stringify({ المنشأة: a.name, الشكل: a.type, النشاط: a.act, السنة: a.year, صافي_المبيعات: a.netSales, كلفة_المبيعات: a.cogs, مجمل_الربح: a.gross, الرواتب: a.v.wages, الإيجار: a.v.rent, الكهرباء: a.v.util, إدارية: a.v.admin, الضمان: a.v.ss, الاندثار: a.dep, نسبة_الاندثار: a.v.depRate, إيرادات_أخرى: a.v.otherInc, صافي_الربح_قبل_الضريبة: a.netBefore, الضريبة_التقديرية: a.tax, الموجودات_الثابتة_الصافية: a.netFixed, المخزون: a.v.invClose, المدينون: a.v.debtors, النقد: a.cash, الدائنون: a.v.creditors, القروض: a.v.loans, حقوق_الملكية: a.equity, فرق_التوازن: a.diff })}`;
  try { const { text } = await ai({ mode: 'analyze', prompt }); out.innerHTML = '<div class="ai-out">' + md(text) + '</div>' }
  catch (e) { out.innerHTML = '<div class="ai-off">' + esc(e.message) + '</div>' }
  finally { btn.disabled = false }
}
let turns = [];
function setMode(m) { $$('.seg[role=tablist]:not(#admSeg) button').forEach(b => b.setAttribute('aria-selected', b.dataset.mode === m)); $$('[data-pane]').forEach(p => p.hidden = p.dataset.pane !== m) }
$$('#v-ai .seg button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
function addMsg(role, html) { const d = document.createElement('div'); d.className = 'msg ' + (role === 'user' ? 'u' : 'b'); d.innerHTML = html; $('#chat').appendChild(d); d.scrollIntoView({ behavior: 'smooth', block: 'end' }); return d }
async function sendChat(q) {
  q = (q || $('#chatIn').value).trim(); if (!q) return;
  $('#chatIn').value = ''; $('#chatChips').hidden = true;
  addMsg('user', esc(q)); turns.push({ role: 'user', content: q });
  const bub = addMsg('assistant', 'يفكر…'); $('#chatSend').disabled = true;
  try {
    const { text } = await ai({ mode: 'chat', messages: [{ role: 'user', content: 'جاوب باختصار ووضوح، واذكر المرجع القانوني. ابدأ مباشرة بالجواب.' }, { role: 'assistant', content: 'تمام، جاهز.' }, ...turns.slice(-10)] });
    bub.innerHTML = md(text); turns.push({ role: 'assistant', content: text });
  } catch (e) { bub.innerHTML = '<span style="color:var(--red)">' + esc(e.message) + '</span>'; turns.pop() }
  finally { $('#chatSend').disabled = false }
}
$('#chatSend').onclick = () => sendChat();
$('#chatIn').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } });
$$('#chatChips button').forEach(b => b.onclick = () => sendChat(b.textContent));

/* صوّر الوصل: ضغط الصورة ثم إرسالها */
let scanImg = null;
function compress(file) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => { const max = 1600; let w = img.width, h = img.height; const r = Math.min(1, max / Math.max(w, h)); w = Math.round(w * r); h = Math.round(h * r); const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url); res({ media_type: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.82).split(',')[1], preview: c.toDataURL('image/jpeg', 0.6) }) };
    img.onerror = () => rej(new Error('تعذر قراءة الصورة')); img.src = url;
  });
}
$('#scanFile').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { scanImg = await compress(f); $('#scanPrev').innerHTML = `<img alt="الوصل المختار" src="${scanImg.preview}">`; $('#scanGo').disabled = false } catch (err) { toast(err.message) } };
$('#scanGo').onclick = async () => {
  if (!scanImg) return; const out = $('#scanOut'); $('#scanGo').disabled = true;
  out.innerHTML = '<div class="ai-out">يقرا الوصل…</div>';
  try {
    const { text } = await ai({ mode: 'scan', image: { media_type: scanImg.media_type, data: scanImg.data }, prompt: `اقرأ صورة الفاتورة أو الوصل (قد يكون بخط اليد) واستخرج القيد المحاسبي وفق دليل حسابات النظام المحاسبي الموحد العراقي. أجب بـ JSON فقط بدون أي نص آخر وبدون علامات تنصيص ثلاثية، بهذا الشكل:\n{"vendor":"اسم الجهة","date":"التاريخ","currency":"IQD أو USD","total":0,"items":[{"desc":"","amount":0}],"entry":[{"account":"اسم الحساب","code":"رقم الحساب بالدليل إن عرفته","debit":0,"credit":0}],"note":"ملاحظة قصيرة عن أي غموض"}` });
    const clean = text.replace(/```json|```/g, '').trim(); const r = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));
    const rows = (r.entry || []).map(x => `<tr><td>${esc(x.account)}</td><td>${esc(x.code || '')}</td><td class="n">${x.debit ? fmt(x.debit) : ''}</td><td class="n">${x.credit ? fmt(x.credit) : ''}</td></tr>`).join('');
    out.innerHTML = `<div class="ai-out"><b>${esc(r.vendor || '—')}</b> · ${esc(r.date || '')} · المجموع <span style="direction:ltr;display:inline-block">${fmt(r.total)} ${esc(r.currency || '')}</span>
      ${(r.items || []).length ? `<ul>${r.items.map(i => `<li>${esc(i.desc)} — ${fmt(i.amount)}</li>`).join('')}</ul>` : ''}
      <div class="scroll"><table class="je"><thead><tr><th>الحساب</th><th>الرقم</th><th>مدين</th><th>دائن</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${r.note ? `<p class="note">${esc(r.note)}</p>` : ''}</div>`;
  } catch (e) { out.innerHTML = '<div class="ai-off">' + esc(e.message || 'تعذر قراءة الوصل، جرب صورة أوضح') + '</div>' }
  finally { $('#scanGo').disabled = false }
};
$('#stGo').onclick = async () => {
  const proj = $('#stProj').value.trim(); if (!proj) { toast('اكتب نوع المشروع'); return }
  const out = $('#stOut'), btn = $('#stGo'); btn.disabled = true; out.innerHTML = '<div class="ai-out">يحضّر الدراسة… (قد تأخذ دقيقة)</div>';
  const prompt = `أعدّ "${$('#stType').value}" لمشروع: ${proj}، في محافظة ${$('#stCity').value}، رأس المال المتاح ${fmt(+$('#stCap').value || 0)} دينار. معلومات إضافية: ${$('#stNotes').value || 'لا يوجد'}.\nالهيكل:\n## ملخص تنفيذي\n## دراسة السوق المحلية (الطلب، المنافسة، خصوصية المحافظة)\n## الكلف الاستثمارية (جدول بنود مع تقدير بالدينار)\n## الكلف التشغيلية السنوية\n## الإيرادات المتوقعة\n## المؤشرات المالية (فترة الاسترداد، صافي القيمة الحالية بسعر خصم مناسب، نقطة التعادل)\n## الالتزامات القانونية (التسجيل، الضريبة، الضمان الاجتماعي، الإجازات المطلوبة)\n## المخاطر\nمهم جداً: كل سعر أو كلفة هو تقدير يحتاج تحقق من السوق الحالي — اكتب ذلك بوضوح بالبداية، واذكر الافتراضات بشكل صريح حتى يعدلها المحاسب.`;
  try { const { text } = await ai({ mode: 'study', prompt, max_tokens: 6000 }); out.innerHTML = '<div class="ai-out">' + md(text) + '</div>' }
  catch (e) { out.innerHTML = '<div class="ai-off">' + esc(e.message) + '</div>' }
  finally { btn.disabled = false }
};

/* ---------- الإقلاع ---------- */
async function init() {
  const ok = await ensureLib();
  if (!ok) { screen('setup'); $('#s-setup').querySelector('p') && ($('#s-setup').querySelector('p').textContent = 'تعذر تحميل مكتبة الاتصال. تأكد من الإنترنت ثم أعد فتح التطبيق.'); return }
  connect();
  if (!sb) { screen('setup'); return }
  // أظهر شاشة الدخول فوراً حتى لا تبقى الصفحة فارغة، ثم تحقق من الجلسة
  screen('auth');
  if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('./sw.js').catch(() => { }) } catch (e) { } }
  sb.auth.onAuthStateChange((event, session) => {
    if (session && !S.session) { S.session = session; S.booted = true; afterLogin().catch(e => showFatal('afterLogin: ' + (e.message || e))) }
    else if (!session && event === 'SIGNED_OUT') { S.session = null; screen('auth') }
  });
  try {
    const { data: { session } } = await withTimeout(sb.auth.getSession(), 10000);
    if (session && !S.booted) { S.session = session; S.booted = true; await afterLogin() }
  } catch (e) { toast('تعذر التحقق من الجلسة، سجّل دخولك من جديد') }
}
init().catch(e => showFatal('init: ' + (e.message || e)));
})();
