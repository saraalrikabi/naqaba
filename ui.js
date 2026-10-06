/* واجهة التطبيق: التنسيق والعناصر (تُحقن قبل تشغيل app.js) */
(function(){
var css=`:root{
  --paper:#EEF2EC; --surface:#FFFFFF; --ink:#14231C; --muted:#5B6B62;
  --rule:#CAD6CC; --rule-soft:#E1E8E2; --lapis:#23439B; --lapis-soft:#E3E9F7;
  --gold:#94680F; --red:#A23B2A; --green:#2D6A3E; --shadow:0 1px 0 rgba(20,35,28,.06);
  --ui:"Readex Pro", Tahoma, "Segoe UI", system-ui, sans-serif;
  --naskh:"Noto Naskh Arabic", "Traditional Arabic", serif;
  box-sizing:border-box;
  padding-top:env(safe-area-inset-top,0px);
  padding-bottom:env(safe-area-inset-bottom,0px);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:#0F1713; --surface:#17221C; --ink:#E3ECE5; --muted:#93A69A;
    --rule:#2C3C33; --rule-soft:#223029; --lapis:#93ABEF; --lapis-soft:#1D2A45;
    --gold:#D6AC52; --red:#E2836F; --green:#7FC48F; --shadow:none;
  }
}
:root[data-theme="dark"]{
  --paper:#0F1713; --surface:#17221C; --ink:#E3ECE5; --muted:#93A69A;
  --rule:#2C3C33; --rule-soft:#223029; --lapis:#93ABEF; --lapis-soft:#1D2A45;
  --gold:#D6AC52; --red:#E2836F; --green:#7FC48F; --shadow:none;
}
html{scroll-padding-top:env(safe-area-inset-top,0px);height:100%}
*,*::before,*::after{box-sizing:inherit}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--ui);font-size:15px;line-height:1.6;min-height:100%;-webkit-font-smoothing:antialiased}
button,input,select,textarea{font:inherit;color:inherit}
img{max-width:100%}
.wrap{max-width:560px;margin:0 auto;padding:0 16px 110px}
.screen{max-width:420px;margin:0 auto;padding:40px 20px 60px}
.screen .seal{width:64px;height:64px;font-size:28px;margin:0 auto 16px}
.chip{display:inline-block;font-size:11.5px;padding:2px 9px;border-radius:99px;border:1px solid var(--rule);color:var(--muted);white-space:nowrap}
.chip.s-submitted{color:var(--muted)}.chip.s-awaiting_payment{color:var(--gold);border-color:var(--gold)}.chip.s-paid{color:var(--lapis);border-color:var(--lapis)}.chip.s-approved{color:var(--green);border-color:var(--green)}.chip.s-rejected{color:var(--red);border-color:var(--red)}
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}.stats div{background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:10px}.stats b{display:block;font-size:20px;font-variant-numeric:tabular-nums}.stats span{font-size:12px;color:var(--muted)}
.req{background:var(--surface);border:1px solid var(--rule);border-radius:12px;padding:12px 14px;margin-bottom:8px;font-size:13.5px}.req .h{display:flex;justify-content:space-between;gap:8px;align-items:center}.req .h b{font-weight:500}.req .m{color:var(--muted);font-size:12.5px;margin-top:4px}
.bank{background:var(--lapis-soft);border-radius:10px;padding:10px 12px;font-size:13.5px;margin:8px 0}
.err{color:var(--red);font-size:13px;margin-top:6px}
header.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--paper);border-bottom:1px solid var(--rule)}
header.top .in{max-width:560px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;gap:12px}
.seal{width:38px;height:38px;border-radius:50%;border:2px solid var(--lapis);display:grid;place-items:center;font-family:var(--naskh);font-weight:700;color:var(--lapis);font-size:17px;flex:none}
header.top h1{margin:0;font-size:16px;font-weight:600;line-height:1.3}
header.top small{display:block;color:var(--muted);font-size:12px;font-weight:400}
.iconbtn{margin-inline-start:auto;background:none;border:1px solid var(--rule);border-radius:10px;padding:6px 10px;cursor:pointer;font-size:13px}
h2{font-family:var(--naskh);font-weight:700;font-size:22px;margin:22px 0 6px}
h3{font-size:15px;font-weight:600;margin:18px 0 8px}
p.lead{color:var(--muted);margin:0 0 14px;font-size:14px}
.view{display:none}
.view.on{display:block}

/* bottom nav */
nav.tabs{position:fixed;bottom:0;left:0;right:0;z-index:30;background:var(--surface);border-top:1px solid var(--rule);padding-bottom:env(safe-area-inset-bottom,0px)}
nav.tabs .in{max-width:560px;margin:0 auto;display:grid;grid-template-columns:repeat(5,1fr)}
nav.tabs button{background:none;border:0;padding:9px 2px 8px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11.5px;color:var(--muted);cursor:pointer}
nav.tabs button svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.7}
nav.tabs button[aria-current="page"]{color:var(--lapis);font-weight:600}

/* member card */
.card{background:var(--surface);border:1px solid var(--rule);border-radius:14px;box-shadow:var(--shadow)}
.member{margin-top:16px;padding:18px;display:grid;grid-template-columns:1fr auto;gap:10px;position:relative;overflow:hidden;border-color:var(--lapis)}
.member::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 27px,var(--rule-soft) 27px 28px);opacity:.7;pointer-events:none}
.member > *{position:relative}
.member .name{font-family:var(--naskh);font-size:21px;font-weight:700;line-height:1.35}
.member .meta{font-size:13px;color:var(--muted)}
.member .num{font-variant-numeric:tabular-nums;direction:ltr;display:inline-block}
.status{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;padding:3px 10px;border-radius:99px;margin-top:8px;border:1px solid}
.status.ok{color:var(--green);border-color:var(--green)}
.status.due{color:var(--red);border-color:var(--red)}
.qr{width:84px;height:84px;background:var(--surface);border:1px solid var(--rule);border-radius:8px;padding:5px}
.qr svg{width:100%;height:100%}
.qrcap{font-size:10.5px;color:var(--muted);text-align:center;margin-top:3px}

.alert{margin-top:12px;padding:12px 14px;border-radius:12px;border:1px solid var(--red);color:var(--ink);background:var(--surface);font-size:14px;display:flex;gap:10px;align-items:flex-start}
.alert b{color:var(--red)}
.alert button{margin-inline-start:auto;flex:none}

.quick{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
.quick button{background:var(--surface);border:1px solid var(--rule);border-radius:12px;padding:14px 8px 12px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:13px;line-height:1.35;text-align:center}
.quick button svg{width:26px;height:26px;stroke:var(--lapis);fill:none;stroke-width:1.6}
.quick button:hover{border-color:var(--lapis)}
.fx{margin-top:14px;padding:14px;display:flex;justify-content:space-between;align-items:center;gap:10px}
.fx .v{font-variant-numeric:tabular-nums;font-weight:600;font-size:18px;color:var(--gold);direction:ltr}

/* services list */
.group{margin-top:8px}
.svc{width:100%;display:flex;align-items:center;gap:12px;padding:13px 14px;background:var(--surface);border:1px solid var(--rule);border-radius:12px;margin-bottom:8px;cursor:pointer;text-align:start}
.svc:hover{border-color:var(--lapis)}
.svc .t{flex:1}
.svc .t b{display:block;font-weight:500}
.svc .t span{font-size:12.5px;color:var(--muted)}
.svc .amt{font-variant-numeric:tabular-nums;font-weight:600;color:var(--gold);white-space:nowrap;direction:ltr}
.note{font-size:12.5px;color:var(--muted);border-inline-start:3px solid var(--gold);padding:4px 10px;margin:10px 0}

/* forms */
.field{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}
.field label{font-size:13px;color:var(--muted)}
.field input,.field select,.field textarea{background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:10px 12px;width:100%;min-width:0}
.field input[type=number]{direction:ltr;text-align:right;font-variant-numeric:tabular-nums}
.field input:focus,.field select:focus,.field textarea:focus{outline:2px solid var(--lapis);outline-offset:1px;border-color:var(--lapis)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}
fieldset{border:1px solid var(--rule);border-radius:12px;padding:6px 14px 6px;margin:0 0 14px;background:var(--surface)}
legend{padding:0 6px;font-weight:600;font-size:14px}
.check{display:flex;gap:8px;align-items:center;font-size:13.5px;margin:4px 0 10px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--lapis);color:#fff;border:0;border-radius:11px;padding:12px 18px;font-weight:600;cursor:pointer;font-size:15px}
:root[data-theme="dark"] .btn{color:#0F1713}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .btn{color:#0F1713}}
.btn.block{width:100%}
.btn.ghost{background:none;color:var(--lapis);border:1px solid var(--lapis)}
.btn.small{padding:7px 12px;font-size:13px;border-radius:9px}
.btn:disabled{opacity:.5;cursor:not-allowed}
.row{display:flex;gap:8px;flex-wrap:wrap}
:focus-visible{outline:2px solid var(--lapis);outline-offset:2px}

/* ledger — the memorable bit */
.ledger{background:var(--surface);border:1px solid var(--ink);border-radius:4px;margin:14px 0;overflow:hidden}
.ledger .lh{font-family:var(--naskh);font-weight:700;text-align:center;font-size:17px;padding:10px 8px 6px;border-bottom:2px double var(--ink)}
.ledger .lh small{display:block;font-family:var(--ui);font-weight:400;font-size:12px;color:var(--muted)}
.taccount{display:grid;grid-template-columns:1fr 1fr}
.taccount > div + div{border-inline-start:1.5px solid var(--ink)}
.side .sh{font-size:12.5px;text-align:center;padding:4px;border-bottom:1px solid var(--ink);color:var(--muted)}
.line{display:flex;justify-content:space-between;gap:6px;padding:5px 8px;font-size:13px;border-bottom:1px solid var(--rule-soft);min-height:30px;align-items:center}
.line .a{font-variant-numeric:tabular-nums;direction:ltr;white-space:nowrap}
.line.res{font-weight:600;color:var(--lapis)}
.line.loss{color:var(--red)}
.line.tot{border-top:1px solid var(--ink);border-bottom:3px double var(--ink);font-weight:700}
.scroll{overflow-x:auto}
.verdict{padding:10px 12px;font-size:13.5px;border-top:1px solid var(--rule)}
.verdict.ok{color:var(--green)}
.verdict.bad{color:var(--red)}
.ratios{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}
.ratios div{background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:10px}
.ratios b{display:block;font-size:17px;font-variant-numeric:tabular-nums;direction:ltr;text-align:right}
.ratios span{font-size:12px;color:var(--muted)}

/* ai */
.ai-out{background:var(--surface);border:1px solid var(--rule);border-radius:12px;padding:14px;margin-top:12px;font-size:14.5px;line-height:1.85;white-space:normal}
.ai-out h4{margin:12px 0 4px;font-size:15px}
.ai-out ul{margin:4px 0;padding-inline-start:20px}
.ai-out p{margin:6px 0}
.ai-off{font-size:13px;color:var(--muted);padding:10px 12px;border:1px dashed var(--rule);border-radius:10px;margin-top:10px}
.seg{display:flex;background:var(--surface);border:1px solid var(--rule);border-radius:11px;padding:3px;margin:14px 0}
.seg button{flex:1;border:0;background:none;padding:8px 4px;border-radius:8px;cursor:pointer;font-size:13.5px;color:var(--muted)}
.seg button[aria-selected="true"]{background:var(--lapis-soft);color:var(--lapis);font-weight:600}
.chat{display:flex;flex-direction:column;gap:10px;margin-top:6px}
.msg{padding:10px 13px;border-radius:13px;max-width:88%;font-size:14.5px;line-height:1.8}
.msg.u{align-self:flex-start;background:var(--lapis);color:#fff}
:root[data-theme="dark"] .msg.u{color:#0F1713}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .msg.u{color:#0F1713}}
.msg.b{align-self:flex-end;background:var(--surface);border:1px solid var(--rule)}
.composer{display:flex;gap:8px;margin-top:12px}
.composer textarea{flex:1;background:var(--surface);border:1px solid var(--rule);border-radius:11px;padding:10px;resize:none;min-height:46px}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.chips button{background:var(--surface);border:1px solid var(--rule);border-radius:99px;padding:5px 11px;font-size:12.5px;cursor:pointer}
.drop{border:1.5px dashed var(--lapis);border-radius:14px;padding:26px 14px;text-align:center;background:var(--surface);cursor:pointer}
.drop img{max-height:220px;border-radius:8px;margin-top:10px}
table.je{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
table.je th,table.je td{border:1px solid var(--rule);padding:6px 8px;text-align:start}
table.je td.n{font-variant-numeric:tabular-nums;direction:ltr;text-align:right}

/* sheet */
.scrim{position:fixed;inset:0;background:rgba(10,20,15,.45);z-index:40;display:none}
.scrim.on{display:block}
.sheet{position:fixed;left:0;right:0;bottom:0;z-index:50;background:var(--surface);border-radius:18px 18px 0 0;max-height:88%;overflow:auto;transform:translateY(105%);transition:transform .25s ease;padding:8px 18px calc(18px + env(safe-area-inset-bottom,0px))}
.sheet.on{transform:none}
.sheet .grab{width:42px;height:4px;border-radius:4px;background:var(--rule);margin:4px auto 10px}
.sheet .in{max-width:560px;margin:0 auto}
.pay{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 14px}
.pay label{border:1px solid var(--rule);border-radius:11px;padding:11px;display:flex;gap:8px;align-items:center;cursor:pointer;font-size:14px}
.pay input{accent-color:var(--lapis)}
.pay label:has(input:checked){border-color:var(--lapis);background:var(--lapis-soft)}
.total{display:flex;justify-content:space-between;font-weight:700;font-size:17px;padding:12px 0;border-top:1px solid var(--rule);margin-top:4px}
.total .a{color:var(--gold);direction:ltr;font-variant-numeric:tabular-nums}
.receipt{text-align:center;padding:10px 0}
.receipt .ok{width:56px;height:56px;border-radius:50%;border:2px solid var(--green);color:var(--green);display:grid;place-items:center;margin:6px auto 10px;font-size:26px}
.receipt dl{text-align:start;display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:14px;margin:14px 0}
.receipt dt{color:var(--muted)}
.receipt dd{margin:0;font-variant-numeric:tabular-nums}
ul.docs{margin:6px 0 12px;padding-inline-start:20px;font-size:13.5px;color:var(--muted)}
.hist{font-size:13.5px}
.hist div{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid var(--rule-soft)}
.hist .a{direction:ltr;font-variant-numeric:tabular-nums;color:var(--gold)}
.empty{color:var(--muted);font-size:13.5px;padding:10px 0}
.feeedit{display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--rule-soft);font-size:13.5px}
.feeedit input{background:var(--paper);border:1px solid var(--rule);border-radius:8px;padding:6px 8px;direction:ltr;text-align:right;width:100%}
.pending{color:var(--muted);font-weight:400;font-size:12px}
table.sched{width:100%;border-collapse:collapse;font-size:13px;background:var(--surface)}
table.sched th,table.sched td{border:1px solid var(--rule);padding:8px;text-align:start;vertical-align:top}
table.sched th{background:var(--lapis-soft);font-weight:600}
table.sched td.blank{min-width:110px}
table.sched td.g{background:var(--paper);font-weight:600}
.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:34px 0 10px;text-align:center;font-size:13px}
.sign div{border-top:1px solid var(--ink);padding-top:8px}
.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--paper);padding:9px 16px;border-radius:10px;font-size:13.5px;z-index:60;opacity:0;transition:opacity .2s;pointer-events:none}
.toast.on{opacity:1}
@media (prefers-reduced-motion: reduce){.sheet{transition:none}}
@media print{
  header.top,nav.tabs,.noprint,.toast{display:none!important}
  body{background:#fff;color:#000}
  .view{display:none!important}
  .view.on{display:block!important}
  #accForm{display:none}
  .wrap{padding-bottom:0;max-width:none}
  .sched th,.sched td{border-color:#000}
}
/* ===== الهوية البصرية ===== */
.seal{width:42px;height:42px;border:0;background:none;padding:0;border-radius:0;display:block;flex:none}
.seal svg{width:100%;height:100%;display:block}
.screen .seal{width:124px;height:124px;margin:0 auto 18px;filter:drop-shadow(0 8px 18px rgba(20,44,107,.28))}
.screen{padding-top:52px}
#s-auth h2{font-size:24px;line-height:1.5}
#s-auth .lead{font-size:14.5px}
.authcard{background:var(--surface);border:1px solid var(--rule);border-radius:18px;padding:18px 16px 12px;box-shadow:0 10px 30px rgba(20,35,28,.06)}
.brandline{height:4px;border-radius:4px;background:linear-gradient(90deg,var(--gold),var(--lapis));margin:0 auto 22px;width:72px}
header.top{border-bottom:0}
header.top::after{content:"";display:block;height:3px;background:linear-gradient(90deg,var(--gold) 0 40%,var(--lapis) 40% 100%)}
header.top h1{font-size:15.5px;letter-spacing:-.1px}
.quick button{box-shadow:var(--shadow)}
.quick button svg{width:28px;height:28px}
.member{border-width:1.5px}
:root[data-theme="dark"] .btn.ghost{color:var(--lapis)}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .btn.ghost{color:var(--lapis)}}
:root[data-theme="dark"] .screen .seal{filter:drop-shadow(0 8px 18px rgba(0,0,0,.5))}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .screen .seal{filter:drop-shadow(0 8px 18px rgba(0,0,0,.5))}}
`;
var html=`<!-- ===== شاشة الإعداد (تظهر فقط إذا config.js فارغ) ===== -->
<section class="screen" id="s-setup" hidden>
  <div class="seal" aria-hidden="true">__LOGO__</div>
  <h2 style="text-align:center">التطبيق غير مربوط بقاعدة البيانات بعد</h2>
  <p class="lead" style="text-align:center">افتح ملف <b>config.js</b> وضع رابط مشروع Supabase والمفتاح العام، ثم ارفع الملفات من جديد. الخطوات كاملة في دليل التشغيل.</p>
</section>

<!-- ===== تسجيل الدخول ===== -->
<section class="screen" id="s-auth" hidden>
  <div class="seal" aria-hidden="true">__LOGO__</div>
  <h2 style="text-align:center;margin-top:0">نقابة المحاسبين والمدققين العراقيين</h2>
  <div class="brandline" aria-hidden="true"></div>
  <p class="lead" style="text-align:center">سجّل دخولك ببريدك الإلكتروني. يصلك رمز من 6 أرقام بدون كلمة سر.</p>
  <div class="authcard">
  <div id="authStep1">
    <div class="field"><label for="aEmail">البريد الإلكتروني</label><input id="aEmail" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com" style="direction:ltr;text-align:left"></div>
    <button class="btn block" id="aSend">أرسل الرمز</button>
  </div>
  <div id="authStep2" hidden>
    <div class="field"><label for="aCode">الرمز المرسل إلى <span id="aEmailShow"></span></label><input id="aCode" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" style="direction:ltr;text-align:center;letter-spacing:6px;font-size:20px"></div>
    <button class="btn block" id="aVerify">دخول</button>
    <button class="btn block ghost" id="aBack" style="margin-top:8px">غيّر البريد</button>
    <p class="note">إذا وصلك رابط بدل الرمز، اضغط الرابط وراح يفتح التطبيق مسجّل الدخول.</p>
  </div>
  <div class="err" id="aErr"></div>
  </div>
</section>

<!-- ===== إكمال الملف الشخصي ===== -->
<section class="screen" id="s-onboard" hidden>
  <h2 style="margin-top:0">أكمل بياناتك</h2>
  <p class="lead">تظهر هذه البيانات على هويتك الرقمية وفي معاملاتك مع النقابة.</p>
  <div class="field"><label for="oName">الاسم الكامل (كما في سجل النقابة)</label><input id="oName" autocomplete="name"></div>
  <div class="grid2">
    <div class="field"><label for="oNum">رقم العضوية</label><input id="oNum" style="direction:ltr;text-align:right"></div>
    <div class="field"><label for="oCat">الصفة</label><select id="oCat"><option>عضو</option><option>ممارس</option><option>مشارك</option></select></div>
  </div>
  <div class="field"><label for="oBranch">الفرع / المحافظة</label><input id="oBranch" placeholder="مثال: فرع بغداد"></div>
  <div class="field"><label for="oPhone">رقم الهاتف</label><input id="oPhone" inputmode="tel" style="direction:ltr;text-align:right" placeholder="07xxxxxxxxx"></div>
  <button class="btn block" id="oSave">احفظ وادخل</button>
  <div class="err" id="oErr"></div>
</section>

<!-- ===== التطبيق ===== -->
<div id="app" hidden>
<header class="top">
  <div class="in">
    <div class="seal" aria-hidden="true">__LOGO__</div>
    <div>
      <h1>نقابة المحاسبين والمدققين العراقيين</h1>
      <small id="hdrsub">تطبيق الأعضاء</small>
    </div>
    <button class="iconbtn" id="themeBtn" aria-label="تبديل المظهر">المظهر</button>
  </div>
</header>

<main class="wrap">

<section class="view on" id="v-home" aria-label="الرئيسية">
  <div class="card member">
    <div>
      <div class="name" id="mName">—</div>
      <div class="meta"><span id="mCat">عضو</span> · رقم العضوية <span class="num" id="mNum">—</span></div>
      <div class="meta" id="mCity"></div>
      <div id="mStatus"></div>
    </div>
    <div>
      <div class="qr" id="qr"></div>
      <div class="qrcap">رمز التحقق</div>
    </div>
  </div>
  <div id="dueAlert"></div>

  <div class="quick">
    <button data-go="services" data-svc="renew"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>تجديد الاشتراك</button>
    <button data-go="services" data-svc="certify"><svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="5"/><path d="M9 14l-2 7 5-3 5 3-2-7"/></svg>تصديق الختامية</button>
    <button data-go="accounts"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>إعداد ختامية</button>
    <button data-go="ai" data-mode="scan"><svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 9h8M8 12h8M8 15h5"/></svg>صوّر الوصل</button>
    <button data-go="ai" data-mode="study"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>دراسة جدوى</button>
    <button data-go="ai" data-mode="chat"><svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg>المستشار القانوني</button>
  </div>

  <div class="card fx">
    <div>
      <div style="font-weight:500">سعر صرف الدولار المعتمد</div>
      <div style="font-size:12.5px;color:var(--muted)">يُحدَّث من إدارة النقابة</div>
    </div>
    <div class="v" id="fxVal">—</div>
  </div>

  <h3>التعاميم</h3>
  <div id="notices"></div>

  <h3>التحقق من محاسب</h3>
  <div class="composer" style="margin-top:4px">
    <input id="vNo" placeholder="رقم العضوية" style="flex:1;background:var(--surface);border:1px solid var(--rule);border-radius:11px;padding:10px 12px;direction:ltr;text-align:right">
    <button class="btn" id="vGo">تحقق</button>
  </div>
  <div id="vOut"></div>
</section>

<section class="view" id="v-services" aria-label="خدمات النقابة">
  <h2>خدمات النقابة</h2>
  <p class="lead">قدّم طلبك من هنا، وتابع حالته من "حسابي". الرسوم التي لم يقرّها المجلس بعد تظهر "بانتظار الإقرار".</p>
  <div id="svcList"><div class="empty">يحمّل الخدمات…</div></div>
</section>

<section class="view" id="v-accounts" aria-label="الحسابات الختامية">
  <h2>الحسابات الختامية</h2>
  <p class="lead">دخّل الأرقام الأساسية واضغط الزر. تطلع لك المتاجرة والأرباح والخسائر والميزانية جاهزة للمراجعة والطباعة.</p>
  <form id="accForm" class="noprint" autocomplete="off">
    <fieldset>
      <legend>بيانات المنشأة</legend>
      <div class="field"><label for="f_name">اسم المنشأة</label><input id="f_name" placeholder="مثال: شركة الرافدين للتجارة العامة"></div>
      <div class="grid2">
        <div class="field"><label for="f_type">الشكل القانوني</label>
          <select id="f_type"><option value="ltd">شركة محدودة</option><option value="sole">مشروع فردي</option><option value="partner">شركة تضامنية</option></select></div>
        <div class="field"><label for="f_act">النشاط</label>
          <select id="f_act"><option>تجاري</option><option>خدمي</option><option>صناعي</option><option>مقاولات</option></select></div>
      </div>
      <div class="field"><label for="f_year">السنة المالية المنتهية في</label><input id="f_year" value="31/12/2025"></div>
    </fieldset>
    <fieldset>
      <legend>المتاجرة</legend>
      <div class="grid2">
        <div class="field"><label for="sales">المبيعات</label><input type="number" id="sales" inputmode="decimal"></div>
        <div class="field"><label for="salesRet">مردودات المبيعات</label><input type="number" id="salesRet" inputmode="decimal"></div>
        <div class="field"><label for="invOpen">مخزون أول المدة</label><input type="number" id="invOpen" inputmode="decimal"></div>
        <div class="field"><label for="purch">المشتريات</label><input type="number" id="purch" inputmode="decimal"></div>
        <div class="field"><label for="purchRet">مردودات المشتريات</label><input type="number" id="purchRet" inputmode="decimal"></div>
        <div class="field"><label for="purchExp">مصاريف نقل وشراء</label><input type="number" id="purchExp" inputmode="decimal"></div>
        <div class="field"><label for="invClose">مخزون آخر المدة</label><input type="number" id="invClose" inputmode="decimal"></div>
      </div>
    </fieldset>
    <fieldset>
      <legend>المصاريف والإيرادات الأخرى</legend>
      <div class="grid2">
        <div class="field"><label for="wages">رواتب وأجور</label><input type="number" id="wages" inputmode="decimal"></div>
        <div class="field"><label for="rent">إيجارات</label><input type="number" id="rent" inputmode="decimal"></div>
        <div class="field"><label for="util">كهرباء ووقود ومولدة</label><input type="number" id="util" inputmode="decimal"></div>
        <div class="field"><label for="admin">مصاريف إدارية أخرى</label><input type="number" id="admin" inputmode="decimal"></div>
        <div class="field"><label for="ss">حصة الضمان الاجتماعي</label><input type="number" id="ss" inputmode="decimal"></div>
        <div class="field"><label for="otherInc">إيرادات أخرى</label><input type="number" id="otherInc" inputmode="decimal"></div>
      </div>
    </fieldset>
    <fieldset>
      <legend>الموجودات والمطلوبات</legend>
      <div class="grid2">
        <div class="field"><label for="fixed">الموجودات الثابتة بالكلفة</label><input type="number" id="fixed" inputmode="decimal"></div>
        <div class="field"><label for="accDep">مخصص الاندثار المتراكم السابق</label><input type="number" id="accDep" inputmode="decimal"></div>
        <div class="field"><label for="depRate">نسبة الاندثار السنوية %</label><input type="number" id="depRate" inputmode="decimal"></div>
        <div class="field"><label for="debtors">المدينون</label><input type="number" id="debtors" inputmode="decimal"></div>
        <div class="field"><label for="cash">النقد بالصندوق والمصرف</label><input type="number" id="cash" inputmode="decimal"></div>
        <div class="field"><label for="creditors">الدائنون</label><input type="number" id="creditors" inputmode="decimal"></div>
        <div class="field"><label for="loans">القروض</label><input type="number" id="loans" inputmode="decimal"></div>
        <div class="field"><label for="capital">رأس المال</label><input type="number" id="capital" inputmode="decimal"></div>
        <div class="field"><label for="draw">المسحوبات الشخصية</label><input type="number" id="draw" inputmode="decimal"></div>
      </div>
      <label class="check"><input type="checkbox" id="cashPlug" checked> احسب النقد تلقائياً كرقم موازن (إذا ما عندك رصيد النقد)</label>
    </fieldset>
    <div class="row">
      <button type="submit" class="btn" style="flex:1">أعدّ الحسابات الختامية</button>
      <button type="button" class="btn ghost" id="fillDemo">املأ بمثال</button>
    </div>
  </form>
  <div id="accOut"></div>
</section>

<section class="view" id="v-ai" aria-label="المساعد الذكي">
  <h2>المساعد الذكي</h2>
  <div class="seg" role="tablist">
    <button role="tab" data-mode="chat" aria-selected="true">المستشار</button>
    <button role="tab" data-mode="scan" aria-selected="false">صوّر الوصل</button>
    <button role="tab" data-mode="study" aria-selected="false">دراسة جدوى</button>
  </div>
  <div data-pane="chat">
    <p class="lead">اسأل عن الضريبة، قانون الشركات، النظام المحاسبي الموحد، الضمان الاجتماعي، أو أي إجراء. الجواب يذكر المادة القانونية حتى تتأكد منها.</p>
    <div class="chat" id="chat"></div>
    <div class="chips" id="chatChips">
      <button>شكد نسبة ضريبة الدخل على الشركات المحدودة؟</button>
      <button>شنو مرفقات تقديم الحسابات الختامية للهيئة العامة للضرائب؟</button>
      <button>شلون أحسب اشتراك الضمان الاجتماعي للعمال؟</button>
    </div>
    <div class="composer">
      <textarea id="chatIn" rows="1" placeholder="اكتب سؤالك…"></textarea>
      <button class="btn" id="chatSend">أرسل</button>
    </div>
  </div>
  <div data-pane="scan" hidden>
    <p class="lead">صوّر أي فاتورة أو وصل، حتى لو بخط اليد، ويطلع لك القيد المحاسبي جاهز حسب دليل النظام المحاسبي الموحد.</p>
    <label class="drop" id="drop">
      <input type="file" id="scanFile" accept="image/*" capture="environment" hidden>
      <div>اضغط هنا لتصوير الوصل أو اختياره من الصور</div>
      <div id="scanPrev"></div>
    </label>
    <button class="btn block" id="scanGo" style="margin-top:12px" disabled>حوّل الوصل لقيد</button>
    <div id="scanOut"></div>
  </div>
  <div data-pane="study" hidden>
    <p class="lead">اختار نوع المشروع وطبيعة المعطيات، ويطلع لك هيكل دراسة جدوى كامل بافتراضات واضحة تكدر تعدلها.</p>
    <div class="field"><label for="stType">نوع الدراسة</label>
      <select id="stType"><option>دراسة جدوى اقتصادية لمشروع جديد</option><option>دراسة تمويل لمصرف (قرض)</option><option>دراسة كلفة وتسعير لمناقصة حكومية</option><option>تقييم منشأة قائمة</option><option>دراسة توسعة مشروع قائم</option></select></div>
    <div class="field"><label for="stProj">المشروع</label><input id="stProj" placeholder="مثال: معمل بلوك، صيدلية، مطعم، مزرعة دواجن"></div>
    <div class="grid2">
      <div class="field"><label for="stCity">المحافظة</label>
        <select id="stCity"><option>بغداد</option><option>البصرة</option><option>نينوى</option><option>أربيل</option><option>النجف</option><option>كربلاء</option><option>بابل</option><option>ذي قار</option><option>الأنبار</option><option>ديالى</option><option>كركوك</option><option>صلاح الدين</option><option>واسط</option><option>ميسان</option><option>الديوانية</option><option>المثنى</option><option>السليمانية</option><option>دهوك</option></select></div>
      <div class="field"><label for="stCap">رأس المال المتاح (دينار)</label><input type="number" id="stCap" inputmode="decimal"></div>
    </div>
    <div class="field"><label for="stNotes">معلومات إضافية (اختياري)</label><textarea id="stNotes" rows="2" placeholder="مثال: الأرض ملك، عدد العمال 6"></textarea></div>
    <button class="btn block" id="stGo">أعدّ الدراسة</button>
    <div id="stOut"></div>
  </div>
</section>

<section class="view" id="v-me" aria-label="حسابي">
  <h2>حسابي</h2>
  <div id="adminEntry"></div>
  <h3>طلباتي ومعاملاتي</h3>
  <div id="myReqs"><div class="empty">يحمّل…</div></div>
  <fieldset style="margin-top:18px">
    <legend>بياناتي</legend>
    <div class="field"><label for="pName">الاسم الكامل</label><input id="pName"></div>
    <div class="grid2">
      <div class="field"><label for="pNum">رقم العضوية</label><input id="pNum" style="direction:ltr;text-align:right"></div>
      <div class="field"><label for="pCat">الصفة</label><select id="pCat"><option>عضو</option><option>ممارس</option><option>مشارك</option></select></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="pCity">الفرع</label><input id="pCity"></div>
      <div class="field"><label for="pPhone">الهاتف</label><input id="pPhone" style="direction:ltr;text-align:right"></div>
    </div>
    <div class="row"><button class="btn small" id="pSave">احفظ</button><button class="btn small ghost" id="logout">تسجيل الخروج</button></div>
  </fieldset>
  <p class="note" id="verLine"></p>
</section>

<section class="view" id="v-admin" aria-label="لوحة الإدارة">
  <div class="row noprint" style="margin-top:16px"><button class="btn small ghost" id="admBack">رجوع</button></div>
  <h2>لوحة إدارة النقابة</h2>
  <div class="stats" id="admStats"></div>
  <div class="seg" role="tablist" id="admSeg">
    <button role="tab" data-adm="reqs" aria-selected="true">الطلبات</button>
    <button role="tab" data-adm="fees" aria-selected="false">الرسوم</button>
    <button role="tab" data-adm="members" aria-selected="false">الأعضاء</button>
    <button role="tab" data-adm="notices" aria-selected="false">التعاميم</button>
  </div>
  <div data-adm-pane="reqs">
    <div class="chips" id="admFilter"><button data-st="open" aria-pressed="true">المفتوحة</button><button data-st="paid">بانتظار التأكيد</button><button data-st="approved">المنجزة</button><button data-st="all">الكل</button></div>
    <div id="admReqs" style="margin-top:10px"></div>
  </div>
  <div data-adm-pane="fees" hidden>
    <p class="note">أدخل المبالغ بعد مصادقة المجلس. اترك الخانة فارغة للخدمات التي لم تُقرّ بعد.</p>
    <div class="card" style="padding:6px 14px">
      <div class="feeedit"><span>سعر صرف الدولار (دينار)</span><input type="number" id="fxIn"></div>
      <div id="feeEdit"></div>
      <div style="padding:10px 0" class="row"><button class="btn small" id="feeSave">احفظ الرسوم</button><button class="btn small ghost" id="schedOpen">جدول الرسوم للطباعة</button></div>
    </div>
    <fieldset style="margin-top:14px"><legend>بيانات الدفع للأعضاء</legend>
      <div class="field"><label for="bankName">المصرف</label><input id="bankName"></div>
      <div class="field"><label for="bankIban">رقم الحساب / IBAN</label><input id="bankIban" style="direction:ltr;text-align:right"></div>
      <div class="field"><label for="bankHolder">اسم صاحب الحساب</label><input id="bankHolder"></div>
      <button class="btn small" id="bankSave">احفظ</button>
    </fieldset>
  </div>
  <div data-adm-pane="members" hidden>
    <div class="composer" style="margin-top:4px"><input id="memQ" placeholder="بحث بالاسم أو رقم العضوية" style="flex:1;background:var(--surface);border:1px solid var(--rule);border-radius:11px;padding:10px 12px"><button class="btn" id="memGo">ابحث</button></div>
    <div id="memList" style="margin-top:10px"></div>
  </div>
  <div data-adm-pane="notices" hidden>
    <div class="field"><label for="nTitle">عنوان التعميم</label><input id="nTitle"></div>
    <div class="field"><label for="nBody">النص</label><textarea id="nBody" rows="3"></textarea></div>
    <label class="check"><input type="checkbox" id="nPin"> تثبيت في الأعلى</label>
    <button class="btn small" id="nSend">انشر التعميم</button>
    <div id="admNotices" style="margin-top:12px"></div>
  </div>
</section>

<section class="view" id="v-fees" aria-label="جدول الرسوم للمصادقة">
  <div class="row noprint" style="margin-top:16px"><button class="btn small ghost" id="schedBack">رجوع</button><button class="btn small" id="schedPrint">اطبع الجدول</button></div>
  <h2>جدول رسوم الخدمات الإلكترونية</h2>
  <p class="lead">مقدَّم إلى مجلس إدارة نقابة المحاسبين والمدققين العراقيين لإقرار المبالغ، استناداً إلى المادة العاشرة من قانون النقابة رقم 185 لسنة 1969 المعدل.</p>
  <div class="scroll"><table class="sched" id="schedTable"></table></div>
  <div class="sign"><div>النقيب</div><div>أمين الصندوق</div><div>رئيس اللجنة المالية</div></div>
</section>
</main>

<nav class="tabs" aria-label="التنقل الرئيسي"><div class="in">
  <button data-tab="home" aria-current="page"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>الرئيسية</button>
  <button data-tab="services"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>الخدمات</button>
  <button data-tab="accounts"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M4 9h16"/></svg>الختامية</button>
  <button data-tab="ai"><svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>الذكي</button>
  <button data-tab="me"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>حسابي</button>
</div></nav>
</div>

<div class="scrim" id="scrim"></div>
<div class="sheet" id="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div class="in" id="sheetIn"></div></div>
<div class="toast" id="toast" role="status"></div>`;
var logo=`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="شعار نقابة المحاسبين والمدققين العراقيين">

<circle cx="50" cy="50" r="48" fill="url(#nqg)"/>
<circle cx="50" cy="50" r="43.5" fill="none" stroke="url(#nqgold)" stroke-width="2.6"/>
<g stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" fill="none">
<line x1="50" y1="30" x2="50" y2="69"/>
<line x1="24" y1="37" x2="76" y2="37"/>
<line x1="38" y1="71" x2="62" y2="71"/>
<line x1="24" y1="37" x2="15" y2="54"/><line x1="24" y1="37" x2="33" y2="54"/>
<line x1="76" y1="37" x2="67" y2="54"/><line x1="76" y1="37" x2="85" y2="54"/>
</g>
<path d="M13 54 h22 a11 7.5 0 0 1 -22 0 z" fill="url(#nqgold)"/>
<path d="M65 54 h22 a11 7.5 0 0 1 -22 0 z" fill="url(#nqgold)"/>
<circle cx="50" cy="29" r="5.6" fill="url(#nqgold)"/>
<circle cx="50" cy="29" r="2.2" fill="#142C6B"/>
</svg>`;
var logoDefs=`<svg width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true"><defs>
<linearGradient id="nqg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E5BD0"/><stop offset="1" stop-color="#142C6B"/></linearGradient>
<linearGradient id="nqgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D27A"/><stop offset="1" stop-color="#B8871A"/></linearGradient>
</defs></svg>`;
html=logoDefs+html.split('__LOGO__').join(logo);
var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
document.body.insertAdjacentHTML('beforeend',html);
})();
