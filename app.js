const USERS = {
  employee: { username: 'employee', password: '1234', name: 'پارسا احمدی', role: 'کارمند', department: 'واحد بازرگانی', avatar: 'پ' },
  manager: { username: 'manager', password: '1234', name: 'مریم رضایی', role: 'مدیر بازرگانی', department: 'مدیریت بازرگانی', avatar: 'م' },
  admin: { username: 'admin', password: '1234', name: 'مدیر سیستم', role: 'مدیر سامانه', department: 'فناوری اطلاعات', avatar: 'س' }
};

const requests = [
  {id:'REQ-1042', title:'درخواست مرخصی', person:'پارسا احمدی', unit:'بازرگانی', date:'1405/07/02', status:'در انتظار تأیید', tone:'yellow'},
  {id:'REQ-1039', title:'درخواست دورکاری', person:'سارا محمدی', unit:'منابع انسانی', date:'1405/07/01', status:'تأیید شده', tone:'green'},
  {id:'REQ-1035', title:'درخواست خرید تجهیزات', person:'علی کریمی', unit:'فناوری اطلاعات', date:'1405/06/31', status:'در حال بررسی', tone:'blue'},
  {id:'REQ-1028', title:'ماموریت اداری', person:'نگار حسینی', unit:'مالی', date:'1405/06/29', status:'رد شده', tone:'red'}
];

const notices = [
  ['📢','اطلاعیه بروزرسانی سامانه','امروز ساعت 10:30'],
  ['📅','تقویم تعطیلات نیمه دوم سال','دیروز'],
  ['🔔','یادآوری ثبت کارکرد ماهانه','2 روز پیش'],
  ['📄','نسخه جدید فرم درخواست خرید','3 روز پیش']
];

let state = { user: null, page: 'dashboard' };

function esc(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
function currentUser(){ return state.user; }
function icon(type){ const m={home:'⌂',inbox:'▣',requests:'◫',people:'♙',reports:'▤',settings:'⚙',leave:'◷',remote:'⌁',attendance:'◴'}; return m[type]||'•'; }

function loginView(){
  return `<div class="login-shell">
    <section class="login-art">
      <div class="login-art-inner">
        <div class="login-badge">● نسخه اول سامانه سازمانی</div>
        <h1>یک پنجره برای تمام امور شرکت</h1>
        <p>کارتابل، درخواست‌ها، تأییدها، اطلاعیه‌ها و فرآیندهای سازمانی را از یک داشبورد یکپارچه مدیریت کنید.</p>
        <div class="feature-grid">
          <div class="feature"><strong>کارتابل هوشمند</strong><span>دریافت و پیگیری کارهای ارجاع‌شده</span></div>
          <div class="feature"><strong>فرآیندهای سازمانی</strong><span>ثبت، بررسی و تأیید مرحله‌ای درخواست‌ها</span></div>
          <div class="feature"><strong>داشبورد مدیریتی</strong><span>نمایش سریع وضعیت و آمار عملکرد</span></div>
          <div class="feature"><strong>سطوح دسترسی</strong><span>نمایش امکانات متناسب با نقش کاربر</span></div>
        </div>
      </div>
    </section>
    <section class="login-panel">
      <div class="login-card">
        <div class="logo">ش</div>
        <h2>ورود به سامانه</h2>
        <div class="sub">سامانه جامع مدیریت فرآیندهای شرکت</div>
        <form id="loginForm">
          <div class="form-group"><label>نام کاربری</label><input id="username" autocomplete="username" placeholder="نام کاربری خود را وارد کنید" /></div>
          <div class="form-group"><label>رمز عبور</label><input id="password" type="password" autocomplete="current-password" placeholder="رمز عبور" /></div>
          <button class="btn btn-primary" type="submit">ورود به سامانه</button>
          <div id="loginError" class="login-error"></div>
        </form>
        <div class="demo-box"><b>حساب‌های آزمایشی</b><br>کارمند: <b>employee / 1234</b><br>مدیر: <b>manager / 1234</b><br>مدیر سیستم: <b>admin / 1234</b></div>
      </div>
    </section>
  </div>`;
}

function appView(){
  const u=currentUser();
  const manager = u.role.includes('مدیر');
  const pageTitles={dashboard:['داشبورد','نمای کلی وضعیت فعالیت‌های شما'],inbox:['کارتابل من','کارهای ارجاع‌شده و موارد نیازمند اقدام'],requests:['درخواست‌های من','ثبت و پیگیری درخواست‌های سازمانی'],approvals:['تأییدها','مدیریت درخواست‌های کارکنان'],people:['پرسنل','نمایش اطلاعات و وضعیت کارکنان'],reports:['گزارشات','گزارش‌های خلاصه از عملکرد سامانه']};
  const title=pageTitles[state.page]||pageTitles.dashboard;
  return `<div class="app-shell">
    ${sidebar(manager)}
    <main class="main">
      <div class="topbar">
        <div class="page-title"><h1>${title[0]}</h1><p>${title[1]}</p></div>
        <div class="topbar-actions"><div class="search"><span>⌕</span><input placeholder="جستجو در سامانه..." /></div><button class="icon-btn" onclick="toast('3 اعلان جدید دارید')">🔔<span class="dot"></span></button><div class="avatar">${esc(u.avatar)}</div></div>
      </div>
      <div class="content">${renderPage()}</div>
    </main>
    <div id="toast" class="toast"></div>
  </div>`;
}

function sidebar(manager){
  const items=[
    ['dashboard','home','داشبورد'],
    ['inbox','inbox','کارتابل من'],
    ['requests','requests','درخواست‌های من'],
    ...(manager?[['approvals','leave','تأییدها'],['people','people','پرسنل'],['reports','reports','گزارشات']]:[]),
    ['settings','settings','تنظیمات']
  ];
  return `<aside class="sidebar"><div class="brand"><div class="logo">ش</div><div class="brand-text"><strong>سامانه سازمانی</strong><span>نسخه اول</span></div></div><nav class="nav"><div class="nav-title">منوی اصلی</div>${items.map(i=>`<button class="nav-item ${state.page===i[0]?'active':''}" onclick="navigate('${i[0]}')"><span class="nav-icon">${icon(i[1])}</span><span class="label">${i[2]}</span></button>`).join('')}</nav><div class="sidebar-footer"><div class="user-mini"><div class="avatar">${esc(currentUser().avatar)}</div><div><strong>${esc(currentUser().name)}</strong><span>${esc(currentUser().role)}</span></div></div><button class="logout" onclick="logout()">خروج از حساب</button></div></aside>`;
}

function renderPage(){
  switch(state.page){
    case 'inbox': return inboxPage();
    case 'requests': return requestsPage();
    case 'approvals': return approvalsPage();
    case 'people': return peoplePage();
    case 'reports': return reportsPage();
    case 'settings': return settingsPage();
    default: return dashboardPage();
  }
}

function dashboardPage(){
  const u=currentUser();
  const manager=u.role.includes('مدیر');
  return `<div class="cards">
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">کارتابل باز</span><span class="stat-icon">▣</span></div><div class="stat-value">${manager?8:4}</div><div class="stat-help warn">نیازمند اقدام</div></div>
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">درخواست‌های من</span><span class="stat-icon">◫</span></div><div class="stat-value">7</div><div class="stat-help up">2 مورد جدید</div></div>
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">مرخصی باقی‌مانده</span><span class="stat-icon">◷</span></div><div class="stat-value">18</div><div class="stat-help">روز کاری</div></div>
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">اعلان‌های خوانده‌نشده</span><span class="stat-icon">🔔</span></div><div class="stat-value">3</div><div class="stat-help">از آخرین ورود</div></div>
  </div>
  <div class="grid-2">
    <section class="card panel"><div class="panel-head"><h3>آخرین درخواست‌ها</h3><a onclick="navigate('requests')">مشاهده همه</a></div><div class="table-wrap"><table><thead><tr><th>شناسه</th><th>عنوان</th><th>تاریخ</th><th>وضعیت</th></tr></thead><tbody>${requests.map(r=>`<tr><td>${r.id}</td><td>${r.title}</td><td>${r.date}</td><td><span class="badge badge-${r.tone}">${r.status}</span></td></tr>`).join('')}</tbody></table></div></section>
    <section class="card panel"><div class="panel-head"><h3>دسترسی سریع</h3></div><div class="quick-grid"><div class="quick" onclick="navigate('requests')"><div class="q-icon">＋</div><strong>ثبت درخواست</strong><span>مرخصی، ماموریت، دورکاری و...</span></div><div class="quick" onclick="navigate('inbox')"><div class="q-icon">▣</div><strong>کارتابل</strong><span>مشاهده کارهای در انتظار</span></div><div class="quick" onclick="toast('فرم حضور و غیاب در نسخه بعدی فعال می‌شود')"><div class="q-icon">◴</div><strong>تردد</strong><span>ثبت و مشاهده کارکرد</span></div><div class="quick" onclick="toast('ماژول اسناد در نسخه بعدی فعال می‌شود')"><div class="q-icon">▤</div><strong>اسناد</strong><span>دریافت فرم‌ها و فایل‌ها</span></div></div></section>
  </div>
  <section class="card panel"><div class="panel-head"><h3>اطلاعیه‌های شرکت</h3><a onclick="toast('همه اطلاعیه‌ها نمایش داده شد')">مشاهده همه</a></div><div class="notice-list">${notices.map(n=>`<div class="notice"><div class="n-icon">${n[0]}</div><div><strong>${n[1]}</strong><span>${n[2]}</span></div></div>`).join('')}</div></section>`;
}

function inboxPage(){
  const manager=currentUser().role.includes('مدیر');
  const rows=manager?requests:requests.filter(x=>x.person==='پارسا احمدی');
  return `<section class="card section-card"><div class="panel-head"><h3>کارتابل من</h3><span class="badge badge-yellow">${manager?8:4} مورد در انتظار اقدام</span></div><div class="filters"><select><option>همه وضعیت‌ها</option><option>در انتظار اقدام</option><option>انجام شده</option></select><select><option>همه انواع</option><option>درخواست</option><option>نامه</option><option>فرآیند</option></select><input placeholder="جستجوی عنوان یا شناسه..." /></div><div class="table-wrap"><table><thead><tr><th>شناسه</th><th>موضوع</th><th>ارجاع‌دهنده</th><th>تاریخ</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.id}</td><td>${r.title}</td><td>${r.person}</td><td>${r.date}</td><td><span class="badge badge-${r.tone}">${r.status}</span></td><td><div class="action-row"><button class="small-btn" onclick="toast('جزئیات ${r.id} باز شد')">مشاهده</button>${manager&&r.status==='در انتظار تأیید'?'<button class="small-btn approve" onclick="approveReq(\''+r.id+'\')">تأیید</button>':''}</div></td></tr>`).join('')}</tbody></table></div></section>`;
}

function requestsPage(){
 return `<section class="card section-card"><div class="panel-head"><h3>درخواست‌های من</h3><button class="btn" style="background:#2563eb;color:#fff" onclick="toast('فرم ثبت درخواست در این نسخه نمایشی آماده است')">＋ ثبت درخواست جدید</button></div><div class="filters"><select><option>همه</option><option>در انتظار تأیید</option><option>تأیید شده</option><option>رد شده</option></select><input placeholder="جستجو..." /></div><div class="table-wrap"><table><thead><tr><th>شناسه</th><th>نوع درخواست</th><th>تاریخ ثبت</th><th>آخرین مرحله</th><th>وضعیت</th></tr></thead><tbody>${requests.filter(r=>r.person===currentUser().name || currentUser().role.includes('مدیر')).map(r=>`<tr><td>${r.id}</td><td>${r.title}</td><td>${r.date}</td><td>بررسی واحد مربوطه</td><td><span class="badge badge-${r.tone}">${r.status}</span></td></tr>`).join('')}</tbody></table></div></section>`;
}

function approvalsPage(){
 if(!currentUser().role.includes('مدیر')) return `<section class="card section-card"><div class="empty">این بخش فقط برای مدیران قابل دسترسی است.</div></section>`;
 return `<section class="card section-card"><div class="panel-head"><h3>درخواست‌های نیازمند تأیید</h3><span class="badge badge-yellow">2 مورد جدید</span></div><div class="table-wrap"><table><thead><tr><th>شناسه</th><th>کارمند</th><th>موضوع</th><th>واحد</th><th>تاریخ</th><th>عملیات</th></tr></thead><tbody>${requests.filter(r=>r.status==='در انتظار تأیید').map(r=>`<tr id="row-${r.id}"><td>${r.id}</td><td>${r.person}</td><td>${r.title}</td><td>${r.unit}</td><td>${r.date}</td><td><div class="action-row"><button class="small-btn approve" onclick="approveReq('${r.id}')">تأیید</button><button class="small-btn reject" onclick="rejectReq('${r.id}')">رد</button></div></td></tr>`).join('')}</tbody></table></div></section>`;
}

function peoplePage(){
 const people=[['پارسا احمدی','بازرگانی','کارمند','فعال'],['سارا محمدی','منابع انسانی','کارشناس','فعال'],['علی کریمی','فناوری اطلاعات','کارشناس','فعال'],['نگار حسینی','مالی','کارشناس','مرخصی']];
 return `<section class="card section-card"><div class="panel-head"><h3>فهرست پرسنل</h3><input style="border:1px solid var(--border);border-radius:9px;padding:8px 10px" placeholder="جستجوی پرسنل..." /></div><div class="table-wrap"><table><thead><tr><th>نام</th><th>واحد</th><th>سمت</th><th>وضعیت</th></tr></thead><tbody>${people.map(p=>`<tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td><td><span class="badge ${p[3]==='فعال'?'badge-green':'badge-yellow'}">${p[3]}</span></td></tr>`).join('')}</tbody></table></div></section><section class="card section-card"><div class="panel-head"><h3>اطلاعات کاربر جاری</h3></div><div class="profile-grid"><div class="info-box"><div class="label">نام و نام خانوادگی</div><div class="value">${esc(currentUser().name)}</div></div><div class="info-box"><div class="label">سمت</div><div class="value">${esc(currentUser().role)}</div></div><div class="info-box"><div class="label">واحد</div><div class="value">${esc(currentUser().department)}</div></div><div class="info-box"><div class="label">وضعیت حساب</div><div class="value">فعال</div></div></div></section>`;
}

function reportsPage(){
 return `<div class="cards"><div class="card stat-card"><div class="stat-label">کل درخواست‌ها</div><div class="stat-value">128</div><div class="stat-help">این ماه</div></div><div class="card stat-card"><div class="stat-label">تکمیل شده</div><div class="stat-value">96</div><div class="stat-help up">75٪</div></div><div class="card stat-card"><div class="stat-label">در انتظار بررسی</div><div class="stat-value">21</div><div class="stat-help warn">نیازمند پیگیری</div></div><div class="card stat-card"><div class="stat-label">رد شده</div><div class="stat-value">11</div><div class="stat-help">این ماه</div></div></div><section class="card section-card"><div class="panel-head"><h3>گزارش وضعیت فرآیندها</h3></div><div class="empty">نمودارهای تحلیلی در مرحله بعدی به داشبورد متصل می‌شوند.</div></section>`;
}

function settingsPage(){
 return `<section class="card section-card"><div class="panel-head"><h3>تنظیمات حساب</h3></div><div class="profile-grid"><div class="info-box"><div class="label">نام کاربری</div><div class="value">${esc(currentUser().username)}</div></div><div class="info-box"><div class="label">نقش</div><div class="value">${esc(currentUser().role)}</div></div></div><button class="btn" style="margin-top:18px;background:#eef4ff;color:#1d4ed8" onclick="toast('تنظیمات در نسخه بعدی کامل می‌شود')">ذخیره تغییرات</button></section>`;
}

function navigate(page){ state.page=page; render(); }
function toast(msg){ const el=document.getElementById('toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.classList.remove('show'),2200); }
function approveReq(id){ const el=document.getElementById('row-'+id); if(el){el.remove(); toast(id+' تأیید شد');} }
function rejectReq(id){ const el=document.getElementById('row-'+id); if(el){el.remove(); toast(id+' رد شد');} }
function logout(){state.user=null;state.page='dashboard';render();}
function render(){ document.getElementById('app').innerHTML=state.user?appView():loginView(); }

function bind(){
 const form=document.getElementById('loginForm');
 if(form){
  form.addEventListener('submit',e=>{
   e.preventDefault();
   const u=document.getElementById('username').value.trim();
   const p=document.getElementById('password').value;
   const found=Object.values(USERS).find(x=>x.username===u && x.password===p);
   if(!found){document.getElementById('loginError').textContent='نام کاربری یا رمز عبور صحیح نیست.';return;}
   state.user={...found}; state.page='dashboard'; render();
  });
 }
}
const oldRender=render; render=()=>{oldRender();bind();};
render();
