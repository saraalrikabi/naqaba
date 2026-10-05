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
try { if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && window.supabase) sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY); } catch (e) { sb = null }
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
  if (!p) {
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
  S.f
