// SB Centre public site — data comes from Supabase ONLY (no localStorage truth).
// If Supabase is not configured yet, the page shows an honest setup note.
const cfg = window.SB_CONFIG || {};
let sb = null, LANG = localStorage.getItem('sbvtc_lang') || 'bn';
let DATA = {settings:{},courses:[],students:[],certificates:[],notices:[],gallery:[],teachers:[],achievements:[],stories:[],slides:[]};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Fixed-UI translations only. Admin-typed content (notices, teacher, stories,
// gallery captions) stays exactly as typed — it is NOT auto-translated.
const T = {
 bn:{home:'হোম',courses:'কোর্সসমূহ',search:'শিক্ষার্থী খুঁজুন',verify:'সার্টিফিকেট যাচাই',gallery:'গ্যালারি',notice:'নোটিশ',teacher:'শিক্ষক',ach:'অর্জনসমূহ',story:'সাফল্যের গল্প',about:'আমাদের সম্পর্কে',admin:'অ্যাডমিন',contact:'যোগাযোগ',searchBtn:'খুঁজুন',verifyBtn:'যাচাই করুন',searchHint:'রোল নম্বর বা নাম লিখুন',verifyHint:'লাইসেন্স নম্বর লিখুন',valid:'বৈধ সার্টিফিকেট',invalid:'সার্টিফিকেট পাওয়া যায়নি',download:'PDF ডাউনলোড',months:'মাস',hours:'ঘণ্টা',address:'ঠিকানা',phone:'ফোন',email:'ইমেইল',soon:'শীঘ্রই এখানে যোগ করা হবে',noVideo:'ভিডিও না থাকলে ছবি স্লাইড আকারে দেখাবে'},
 en:{home:'Home',courses:'Courses',search:'Student Search',verify:'Certificate Verify',gallery:'Gallery',notice:'Notices',teacher:'Teacher',ach:'Achievements',story:'Success Stories',about:'About',admin:'Admin',contact:'Contact',searchBtn:'Search',verifyBtn:'Verify',searchHint:'Enter roll number or name',verifyHint:'Enter license number',valid:'Valid Certificate',invalid:'Certificate not found',download:'Download PDF',months:'months',hours:'hours',address:'Address',phone:'Phone',email:'Email',soon:'Will be added here soon',noVideo:'If no video is posted, pictures will slide instead'},
 ja:{home:'ホーム',courses:'コース',search:'学生検索',verify:'修了証確認',gallery:'ギャラリー',notice:'お知らせ',teacher:'講師',ach:'実績',story:'成功物語',about:'当センターについて',admin:'管理者',contact:'連絡先',searchBtn:'検索',verifyBtn:'確認',searchHint:'学籍番号または名前を入力',verifyHint:'ライセンス番号を入力',valid:'有効な修了証',invalid:'修了証が見つかりません',download:'PDFをダウンロード',months:'か月',hours:'時間',address:'住所',phone:'電話',email:'メール',soon:'近日追加予定',noVideo:'動画がない場合、写真がスライド表示されます'}
};
function tr(k){return (T[LANG] && T[LANG][k]) || T.bn[k] || k;}
function setLang(l){LANG=l;localStorage.setItem('sbvtc_lang',l);applyLang();render();}
function applyLang(){
  document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=tr(el.dataset.t);});
  document.querySelectorAll('[data-ph]').forEach(el=>{el.placeholder=tr(el.dataset.ph);});
  document.querySelectorAll('.lang button').forEach(b=>{b.style.fontWeight = b.dataset.lang===LANG ? '700':'400';});
}
function show(id){
  document.querySelectorAll('main section').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById('view-'+id); if(el) el.classList.add('active');
  document.querySelectorAll('nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
async function loadAll(){
  if(!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT')){
    $('#setup-note').innerHTML='<p class="err">Supabase এখনো সেট করা হয়নি। README.md দেখে config.js-এ URL ও anon key বসান, তারপর schema.sql ও seed.sql চালান। / Supabase is not configured yet. See README.md.</p>'; return;
  }
  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const q = async (t,order) => (await sb.from(t).select('*').order(order||'created_at',{ascending:true})).data || [];
  const s = (await sb.from('site_settings').select('*').eq('id',1).single()).data || {};
  DATA = {settings:s, courses:await q('courses','sort_order'), students:await q('students','roll'),
    certificates:await q('certificates','created_at'), notices:await q('notices','sort_order'),
    gallery:await q('gallery_items','sort_order'), teachers:await q('teachers','sort_order'),
    achievements:await q('achievements','sort_order'), stories:await q('success_stories','sort_order'),
    slides:await q('slideshow_items','sort_order')};
  // Realtime: any admin change in Supabase refreshes every visitor's view.
  sb.channel('sb-realtime').on('postgres_changes',{event:'*',schema:'public'},()=>loadAll().then(render)).subscribe();
  render();
}
function courseCard(c){
  const d = LANG==='en' ? c.description_en : LANG==='ja' ? c.description_ja : c.description_bn;
  const a = LANG==='en' ? c.audience_en : LANG==='ja' ? c.audience_ja : c.audience_bn;
  const t = LANG==='en' ? c.title_en : LANG==='ja' ? c.title_ja : c.title_bn;
  return `<div class="card"><h3>${esc(c.level)} — ${esc(t)}</h3><p>${esc(a)}</p><p>${esc(d)}</p><p><b>${c.duration_months} ${tr('months')} • ${c.hours}+ ${tr('hours')}</b></p></div>`;
}
function studentCard(s){
  return `<div class="card">${s.photo_url?`<img class="student-photo" src="${esc(s.photo_url)}" alt="">`:''}<h3>${esc(s.name)}</h3><p>Roll: ${esc(s.roll)}${s.course?` • ${esc(s.course)}`:''}${s.batch?` • ${esc(s.batch)}`:''}${s.session?` • ${esc(s.session)}`:''}</p>${s.status?`<p>${esc(s.status)}</p>`:''}</div>`;
}
function certHTML(c){
  const issue = c.issue_date || new Date().toISOString().slice(0,10);
  const fmt = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : '';
  return `<div class="cert"><div class="cert-in"><img src="assets/IMG-20261102-WA0023.jpg" style="width:70px;height:70px;object-fit:cover;border-radius:50%" alt="SB logo">
  <div class="c-centre">SB Vocational Training Centre</div>
  <div class="c-license">LICENSE NO: <b>${esc(c.license_no)}</b></div>
  <div class="c-level">LEVEL-${esc(c.level||'N5')}</div>
  <div class="c-jp">修了証明書</div><div class="c-en">Certificate of Completion</div>
  <div class="c-name">${esc(c.student_name)}</div>
  <p class="c-body">This is to certify that the above-named trainee has successfully completed the ${esc(c.course_name||'Basic Japanese Language Course')} conducted by SB Vocational Training Centre, comprising a minimum of ${esc(c.hours||180)} hours over a period of ${esc(c.duration_months||3)} months.</p>
  <div class="c-issue">Date of Issue: ${fmt(issue)}</div><div class="c-divider"></div>
  <div class="c-sigs"><div class="c-sig"><div class="c-line"></div><div>COORDINATOR</div><small>SB VOCATIONAL TRAINING CENTRE</small></div>
  <div class="c-sig"><div class="c-line"></div><div>DIRECTOR / AUTHORIZED SIGNATORY</div><small>SB VOCATIONAL TRAINING CENTRE</small></div></div>
  <div style="margin-top:16px;font-size:12px">SB VOCATIONAL TRAINING CENTRE | Japanese Language Training | LEVEL-${esc(c.level||'N5')}</div>
  </div></div>`;
}
async function downloadCert(c){
  // Re-download ONLY: this function never inserts a certificate record.
  const node = document.createElement('div'); node.innerHTML = certHTML(c);
  node.style.position='fixed'; node.style.left='-9999px'; document.body.appendChild(node);
  try{
    const canvas = await html2canvas(node.firstChild,{scale:2});
    const {jsPDF} = window.jspdf; const pdf = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    pdf.addImage(canvas.toDataURL('image/jpeg',0.95),'JPEG',0,0,297,210); pdf.save(`Certificate-${String(c.student_name||'').replace(/\s+/g,'_')}.pdf`);
  }catch(e){ alert('PDF library failed to load. Check your connection and try again.'); }
  node.remove();
}
function render(){
  const s = DATA.settings||{};
  $('#centre-name').textContent = s.centre_name || 'SB Vocational Training Centre';
  $('#hero-title').textContent = LANG==='en'? (s.hero_title_en||'') : LANG==='ja'? (s.hero_title_ja||'') : (s.hero_title_bn||'');
  $('#hero-sub').textContent = LANG==='en'? (s.hero_sub_en||'') : LANG==='ja'? (s.hero_sub_ja||'') : (s.hero_sub_bn||'');
  $('#fb-link').href = s.facebook_url || 'https://www.facebook.com/share/1DsnbitRCE/';
  const wa = (s.whatsapp_number||'').replace(/\D/g,'');
  $('#wa-link').style.display = wa ? 'inline-block' : 'none'; if(wa) $('#wa-link').href = 'https://wa.me/'+wa;
  $('#courses-grid').innerHTML = DATA.courses.map(courseCard).join('') || '<p>'+tr('soon')+'</p>';
  $('#notices-list').innerHTML = DATA.notices.map(n=>`<div class="card"><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>${n.notice_date?`<small>${esc(n.notice_date)}</small>`:''}</div>`).join('') || '<p>'+tr('soon')+'</p>';
  $('#gallery-grid').innerHTML = DATA.gallery.map(g=>`<div class="card"><img src="${esc(g.image_url)}" style="width:100%;border-radius:10px" alt=""><p>${esc(g.caption)}</p></div>`).join('') || '<p>'+tr('soon')+'</p>';
  const t = DATA.teachers[0];
  $('#teacher-box').innerHTML = t && t.name ? `<div class="card">${t.photo_url?`<img class="student-photo" src="${esc(t.photo_url)}" alt="">`:''}<h3>${esc(t.name)}</h3><p>${esc(t.title)}</p><p>${esc(t.about)}</p></div>` : '<p>'+tr('soon')+'</p>';
  $('#ach-list').innerHTML = DATA.achievements.map(a=>`<div class="card"><h3>${esc(a.title)}</h3><p>${esc(a.detail)}</p></div>`).join('') || '<p>'+tr('soon')+'</p>';
  $('#story-list').innerHTML = DATA.stories.map(a=>`<div class="card">${a.photo_url?`<img class="student-photo" src="${esc(a.photo_url)}" alt="">`:''}<h3>${esc(a.student_name)}</h3><p>${esc(a.story)}</p></div>`).join('') || '<p>'+tr('soon')+'</p>';
  const about = LANG==='en'? s.about_en : LANG==='ja'? s.about_ja : s.about_bn;
  $('#about-text').textContent = about || '';
  $('#foot-contact').innerHTML = `<b>${tr('contact')}</b><br>${tr('address')}: ${esc(s.address||'—')}<br>${tr('phone')}: ${esc(s.phone||'—')}<br>${tr('email')}: ${esc(s.email||'—')}${s.hours?`<br>${esc(s.hours)}`:''}`;
  renderSlides();
}
let slideIdx = 0, slideTimer = null;
function renderSlides(){
  const box = $('#slideshow'); if(!box) return;
  const video = DATA.slides.find(x=>x.kind==='video' && x.video_url);
  const pics = DATA.slides.filter(x=>x.kind==='image' && x.image_url);
  const items = video ? [{kind:'video',video_url:video.video_url,title:video.title}, ...pics.map(p=>({kind:'image',image_url:p.image_url,title:p.title}))]
                    : (pics.length ? pics : DATA.gallery.map(g=>({kind:'image',image_url:g.image_url,title:g.caption})));
  if(!items.length){ box.innerHTML = '<div class="card">'+tr('soon')+'</div>'; return; }
  slideIdx = slideIdx % items.length;
  const it = items[slideIdx];
  const media = it.kind==='video'
    ? (it.video_url.includes('youtube')||it.video_url.includes('youtu.be') ? `<iframe src="${esc(it.video_url)}" allowfullscreen></iframe>` : `<video src="${esc(it.video_url)}" controls autoplay muted loop></video>`)
    : `<img src="${esc(it.image_url)}" alt="">`;
  box.innerHTML = `<div class="slide">${media}<div class="cap"><b>${esc(it.title||'')}</b></div></div>
    <div class="slide-nav"><button onclick="prevSlide()">‹</button><button onclick="nextSlide()">›</button></div>`;
  clearInterval(slideTimer);
  if(it.kind!=='video' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    slideTimer = setInterval(()=>nextSlide(), 4500);
  }
  box._items = items;
}
function nextSlide(){ const box=$('#slideshow'); if(!box||!box._items) return; slideIdx=(slideIdx+1)%box._items.length; renderSlides(); }
function prevSlide(){ const box=$('#slideshow'); if(!box||!box._items) return; slideIdx=(slideIdx-1+box._items.length)%box._items.length; renderSlides(); }
function doSearch(){
  const q = ($('#search-input').value||'').trim().toLowerCase();
  const hits = DATA.students.filter(s => s.roll.toLowerCase()===q || s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q));
  $('#search-result').innerHTML = hits.length ? hits.map(studentCard).join('') : '<p class="err">'+tr('invalid')+'</p>';
}
function doVerify(){
  const q = ($('#verify-input').value||'').trim().toLowerCase();
  const c = DATA.certificates.find(x => (x.license_no||'').toLowerCase()===q);
  const box = $('#verify-result');
  if(!c){ box.innerHTML = '<p class="err">'+tr('invalid')+'</p>'; return; }
  box.innerHTML = `<div class="card"><p class="ok">${tr('valid')}</p><p>${esc(c.student_name)} • ${esc(c.license_no)} • LEVEL-${esc(c.level||'N5')}</p><button class="btn" data-dl="${esc(c.id)}">${tr('download')}</button></div>`;
  box.querySelector('[data-dl]').onclick = ()=>downloadCert(c);
}
document.addEventListener('DOMContentLoaded',()=>{ applyLang(); loadAll(); });
