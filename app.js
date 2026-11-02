// SB Centre public site — data comes from Supabase ONLY (no localStorage truth).
// If Supabase is not configured yet, the page shows an honest setup note.
// Public site only: there is NO link to the separate login page anywhere here.
const cfg = window.SB_CONFIG || {};
let sb = null, LANG = localStorage.getItem('sbvtc_lang') || 'bn';
let DATA = {settings:{},courses:[],students:[],certificates:[],notices:[],gallery:[],teachers:[],achievements:[],stories:[],slides:[]};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Fixed-UI translations only. Content typed in the login panel (notices, teacher,
// stories, gallery captions) stays exactly as typed — it is NOT auto-translated.
const T = {
 bn:{langLabel:'ভাষা',home:'হোম',courses:'কোর্সসমূহ',search:'শিক্ষার্থী খুঁজুন',verify:'সার্টিফিকেট যাচাই',gallery:'গ্যালারি',notice:'নোটিশ',teacher:'শিক্ষক',ach:'অর্জনসমূহ',story:'সাফল্যের গল্প',about:'আমাদের সম্পর্কে',contact:'যোগাযোগ',searchBtn:'খুঁজুন',verifyBtn:'যাচাই করুন',searchHint:'রোল নম্বর বা নাম লিখুন',verifyHint:'লাইসেন্স নম্বর লিখুন',valid:'বৈধ সার্টিফিকেট',invalid:'সার্টিফিকেট পাওয়া যায়নি',download:'PDF ডাউনলোড',months:'মাস',hours:'ঘণ্টা',address:'ঠিকানা',phone:'ফোন',email:'ইমেইল',soon:'শীঘ্রই এখানে যোগ করা হবে',noVideo:'ভিডিও না থাকলে ছবি স্লাইড আকারে দেখাবে',
  glimpse:'কেন্দ্রের ঝলক',statCourses:'কোর্স লেভেল (N5 · N4 · N3)',statStudents:'নিবন্ধিত শিক্ষার্থী',allCourses:'সব কোর্সের বিবরণ →',latestNotices:'সর্বশেষ নোটিশ',allNotices:'সব নোটিশ →',verifyHomeText:'সার্টিফিকেটের লাইসেন্স নম্বর দিয়ে যাচাই করুন সার্টিফিকেটটি আসল কিনা।',goVerify:'যাচাই করতে যান',coursesIntro:'প্রতিটি কোর্স JLPT / JFT পরীক্ষার সিলেবাস অনুযায়ী সাজানো। ভর্তি সংক্রান্ত তথ্যের জন্য অফিসে যোগাযোগ করুন বা আমাদের Facebook পেজে মেসেজ দিন।',searchHintText:'আপনার রোল নম্বর অথবা নাম (পুরো বা আংশিক) লিখে খুঁজুন বাটনে চাপ দিন।',searchLabel:'রোল নম্বর বা নাম',verifyHintText:'সার্টিফিকেটে লেখা লাইসেন্স নম্বরটি হুবহু লিখুন।',verifyLabel:'লাইসেন্স নম্বর',galleryHint:'ছবিতে ক্লিক করলে বড় করে দেখা যাবে।',noticeIntro:'ক্লাস, পরীক্ষা ও কেন্দ্র সংক্রান্ত গুরুত্বপূর্ণ ঘোষণা।',teacherIntro:'আমাদের শিক্ষক',teacherIntroText:'যাঁর তত্ত্বাবধানে আমাদের জাপানি ভাষা কোর্সগুলো পরিচালিত হয়।',achIntro:'কেন্দ্র ও আমাদের শিক্ষার্থীদের উল্লেখযোগ্য সাফল্য ও স্বীকৃতি।',storyIntro:'কে পরীক্ষায় উত্তীর্ণ হয়েছেন, কে জাপানে গেছেন — শিক্ষার্থীদের নিজের পথচলার গল্প।',aboutTitle:'SB Vocational Training Centre',aboutIntro:'কেন্দ্র পরিচিতি',whyTitle:'কেন আমাদের কাছে শিখবেন',rights:'সর্বস্বত্ব সংরক্ষিত।',
  why1t:'ধাপে ধাপে সিলেবাস',why1d:'হিরাগানা-কাতাকানা থেকে কাঞ্জি, ব্যাকরণ ও কথোপকথন — JLPT/JFT ধাঁচে।',why2t:'ছোট ব্যাচে যত্ন',why2d:'প্রতিটি শিক্ষার্থীর অগ্রগতি আলাদাভাবে খেয়াল রাখা হয়।',why3t:'নমনীয় ক্লাস সময়',why3d:'সরাসরি ক্লাসের পাশাপাশি অনলাইন ক্লাসের সুবিধা রয়েছে।',why4t:'সার্টিফিকেট ও যাচাই',why4d:'কোর্স শেষে সার্টিফিকেট দেওয়া হয়, যা এই ওয়েবসাইটেই যাচাই করা যায়।'},
 en:{langLabel:'Language',home:'Home',courses:'Courses',search:'Student Search',verify:'Certificate Verify',gallery:'Gallery',notice:'Notices',teacher:'Teacher',ach:'Achievements',story:'Success Stories',about:'About',contact:'Contact',searchBtn:'Search',verifyBtn:'Verify',searchHint:'Enter roll number or name',verifyHint:'Enter license number',valid:'Valid Certificate',invalid:'Certificate not found',download:'Download PDF',months:'months',hours:'hours',address:'Address',phone:'Phone',email:'Email',soon:'Will be added here soon',noVideo:'If no video is posted, pictures will slide instead',
  glimpse:'Centre at a Glance',statCourses:'Course levels (N5 · N4 · N3)',statStudents:'Registered students',allCourses:'See all course details →',latestNotices:'Latest Notices',allNotices:'All notices →',verifyHomeText:'Check whether a certificate is genuine using its license number.',goVerify:'Go to verify',coursesIntro:'Every course follows the JLPT / JFT syllabus. For admission information, contact the office or message our Facebook page.',searchHintText:'Enter your roll number or name (full or partial) and press Search.',searchLabel:'Roll number or name',verifyHintText:'Enter the license number exactly as written on the certificate.',verifyLabel:'License number',galleryHint:'Click a photo to view it larger.',noticeIntro:'Important announcements about classes, exams and the centre.',teacherIntro:'Our Teacher',teacherIntroText:'Under whose supervision our Japanese language courses are run.',achIntro:'Notable achievements and recognition of the centre and our students.',storyIntro:'Who passed exams, who went to Japan — our students’ own journeys.',aboutTitle:'SB Vocational Training Centre',aboutIntro:'About the Centre',whyTitle:'Why learn with us',rights:'All rights reserved.',
  why1t:'Step-by-step syllabus',why1d:'From hiragana-katakana to kanji, grammar and conversation — JLPT/JFT style.',why2t:'Care in small batches',why2d:'Each student’s progress is followed individually.',why3t:'Flexible class times',why3d:'Online classes are available alongside in-person classes.',why4t:'Certificate & verification',why4d:'A certificate is given after the course, verifiable right on this website.'},
 ja:{langLabel:'言語',home:'ホーム',courses:'コース',search:'学生検索',verify:'修了証確認',gallery:'ギャラリー',notice:'お知らせ',teacher:'講師',ach:'実績',story:'成功物語',about:'当センターについて',contact:'連絡先',searchBtn:'検索',verifyBtn:'確認',searchHint:'学籍番号または名前を入力',verifyHint:'ライセンス番号を入力',valid:'有効な修了証',invalid:'修了証が見つかりません',download:'PDFをダウンロード',months:'か月',hours:'時間',address:'住所',phone:'電話',email:'メール',soon:'近日追加予定',noVideo:'動画がない場合、写真がスライド表示されます',
  glimpse:'センターの様子',statCourses:'コースレベル（N5・N4・N3）',statStudents:'登録学生数',allCourses:'すべてのコース詳細を見る →',latestNotices:'最新のお知らせ',allNotices:'すべてのお知らせ →',verifyHomeText:'ライセンス番号で修了証が本物かどうか確認できます。',goVerify:'確認へ進む',coursesIntro:'すべてのコースはJLPT・JFTのシラバスに沿っています。入学については事務所へお問い合わせいただくか、Facebookページへメッセージをお送りください。',searchHintText:'学籍番号または名前（全体または一部）を入力して検索を押してください。',searchLabel:'学籍番号または名前',verifyHintText:'修了証に記載されたライセンス番号をそのまま入力してください。',verifyLabel:'ライセンス番号',galleryHint:'写真をクリックすると大きく表示されます。',noticeIntro:'授業・試験・センターに関する重要なお知らせ。',teacherIntro:'私たちの講師',teacherIntroText:'日本語コースを指導してくださる講師です。',achIntro:'センターと学生の顕著な成果と表彰。',storyIntro:'試験に合格した人、日本へ行った人 — 学生たちの歩み。',aboutTitle:'SB Vocational Training Centre',aboutIntro:'センター紹介',whyTitle:'私たちで学ぶ理由',rights:'無断転載を禁じます。',
  why1t:'段階的なシラバス',why1d:'ひらがな・カタカナから漢字・文法・会話まで、JLPT・JFT形式で学べます。',why2t:'少人数での丁寧な指導',why2d:'学生一人ひとりの進み具合を個別に見守ります。',why3t:'柔軟な授業時間',why3d:'対面授業に加え、オンライン授業も利用できます。',why4t:'修了証と確認',why4d:'コース修了後に修了証が授与され、このサイトで確認できます。'}
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
  const nav=document.getElementById('mainnav'); if(nav) nav.classList.remove('open');
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
  // Realtime: any change in Supabase refreshes every visitor's view.
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
  return `<div class="card result-flex">${s.photo_url?`<img class="result-photo" src="${esc(s.photo_url)}" alt="">`:''}<div><h3>${esc(s.name)}</h3><p>Roll: ${esc(s.roll)}${s.course?` • ${esc(s.course)}`:''}${s.batch?` • ${esc(s.batch)}`:''}${s.session?` • ${esc(s.session)}`:''}</p>${s.status?`<p>${esc(s.status)}</p>`:''}</div></div>`;
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
function noticeCard(n){ return `<div class="card"><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>${n.notice_date?`<small>${esc(n.notice_date)}</small>`:''}</div>`; }
function openLightbox(url,cap){ const lb=$('#lightbox'); $('#lb-img').src=url; $('#lb-cap').textContent=cap||''; lb.classList.add('open'); }
function closeLightbox(){ const lb=$('#lightbox'); if(lb) lb.classList.remove('open'); }
function render(){
  const s = DATA.settings||{};
  $('#centre-name').textContent = s.centre_name || 'SB Vocational Training Centre';
  $('#brand-tag').textContent = LANG==='en'? (s.tagline_en||'Japanese Language Training Centre') : LANG==='ja'? (s.tagline_ja||'日本語教育センター') : (s.tagline_bn||'জাপানি ভাষা শিক্ষা কেন্দ্র');
  $('#hero-title').textContent = LANG==='en'? (s.hero_title_en||'') : LANG==='ja'? (s.hero_title_ja||'') : (s.hero_title_bn||'');
  $('#hero-sub').textContent = LANG==='en'? (s.hero_sub_en||'') : LANG==='ja'? (s.hero_sub_ja||'') : (s.hero_sub_bn||'');
  $('#fb-link').href = s.facebook_url || 'https://www.facebook.com/share/1DsnbitRCE/';
  const wa = (s.whatsapp_number||'').replace(/\D/g,'');
  const waEl = $('#wa-link'); waEl.style.display = wa ? 'inline-block' : 'none'; if(wa) waEl.href = 'https://wa.me/'+wa;
  $('#stat-courses').textContent = DATA.courses.length || 3;
  $('#stat-students').textContent = DATA.students.length || 0;
  $('#home-courses').innerHTML = DATA.courses.map(courseCard).join('') || '<p>'+tr('soon')+'</p>';
  $('#home-notices').innerHTML = DATA.notices.slice(0,3).map(noticeCard).join('') || '<p>'+tr('soon')+'</p>';
  $('#courses-grid').innerHTML = DATA.courses.map(courseCard).join('') || '<p>'+tr('soon')+'</p>';
  $('#notices-list').innerHTML = DATA.notices.map(noticeCard).join('') || '<p>'+tr('soon')+'</p>';
  $('#gallery-grid').innerHTML = DATA.gallery.map(g=>`<div class="card gal-card"><img src="${esc(g.image_url)}" alt="" onclick="openLightbox('${esc(g.image_url)}','${esc(g.caption)}')"><p>${esc(g.caption)}</p></div>`).join('') || '<p>'+tr('soon')+'</p>';
  const t = DATA.teachers[0];
  $('#teacher-box').innerHTML = t && t.name ? `<div class="teacher-card">${t.photo_url?`<img class="teacher-photo" src="${esc(t.photo_url)}" alt="">`:`<div class="teacher-photo teacher-photo-ph">${esc(t.name.charAt(0))}</div>`}<div><h3>${esc(t.name)}</h3><p>${esc(t.title)}</p><p>${esc(t.about)}</p></div></div>` : '<p>'+tr('soon')+'</p>';
  $('#ach-list').innerHTML = DATA.achievements.map(a=>`<div class="ach-card"><h3>${esc(a.title)}</h3><p>${esc(a.detail)}</p></div>`).join('') || '<p>'+tr('soon')+'</p>';
  $('#story-list').innerHTML = DATA.stories.map(a=>`<div class="card result-flex">${a.photo_url?`<img class="result-photo" src="${esc(a.photo_url)}" alt="">`:''}<div><h3>${esc(a.student_name)}</h3><p>${esc(a.story)}</p></div></div>`).join('') || '<p>'+tr('soon')+'</p>';
  const about = LANG==='en'? s.about_en : LANG==='ja'? s.about_ja : s.about_bn;
  $('#about-text').textContent = about || '';
  $('#why-grid').innerHTML = [1,2,3,4].map(i=>`<div class="card"><h3>${tr('why'+i+'t')}</h3><p>${tr('why'+i+'d')}</p></div>`).join('');
  const footTag = LANG==='en'? 'A trusted institution for Japanese language education — step-by-step preparation in N5, N4 and N3 courses.' : LANG==='ja'? '日本語教育の信頼できる機関 — N5・N4・N3コースで段階的に準備。' : 'জাপানি ভাষা শিক্ষার নির্ভরযোগ্য প্রতিষ্ঠান — N5, N4 ও N3 কোর্সে ধাপে ধাপে প্রস্তুতি।';
  $('#foot-tagline').textContent = footTag;
  $('#foot-contact').innerHTML = `${tr('address')}: ${esc(s.address||'—')}<br>WhatsApp: ${esc(wa||'—')}<br>${tr('phone')}: ${esc(s.phone||'—')}<br>${tr('email')}: ${esc(s.email||'—')}${s.hours?`<br>${esc(s.hours)}`:''}`;
  $('#foot-year').textContent = new Date().getFullYear();
  renderSlides();
}
let slideIdx = 0, slideTimer = null;
function goSlide(i){
  const box=$('#slideshow'); if(!box||!box._items) return;
  slideIdx=((i % box._items.length)+box._items.length)%box._items.length; renderSlides();
}
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
  const dots = items.map((_,i)=>`<button class="ss-dot${i===slideIdx?' on':''}" onclick="goSlide(${i})" aria-label="Slide ${i+1}">●</button>`).join('');
  box.innerHTML = `<div class="slide">${media}<div class="cap"><b>${esc(it.title||'')}</b></div></div>
    <div class="slide-nav"><button onclick="goSlide(slideIdx-1)">‹</button><span class="ss-dots">${dots}</span><button onclick="goSlide(slideIdx+1)">›</button></div>`;
  clearInterval(slideTimer);
  if(it.kind!=='video' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    slideTimer = setInterval(()=>goSlide(slideIdx+1), 4500);
  }
  box._items = items;
}
function nextSlide(){ goSlide(slideIdx+1); }
function prevSlide(){ goSlide(slideIdx-1); }
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
document.addEventListener('DOMContentLoaded',()=>{
  applyLang(); loadAll();
  const burger=document.getElementById('burger');
  if(burger) burger.onclick = ()=>{ document.getElementById('mainnav').classList.toggle('open'); };
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeLightbox(); });
});
