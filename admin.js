// Admin — Supabase Auth only. No password is hardcoded anywhere in this file.
// If Supabase is not configured, login shows the setup note instead of working.
const cfg = window.SB_CONFIG || {};
let sb = null;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function init(){
  if(!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT')){
    $('#login-msg').innerHTML = '<span class="err">Supabase not configured yet. See README.md: set config.js, run schema.sql + seed.sql, create an admin user in Supabase Auth.</span>'; return;
  }
  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  sb.auth.getSession().then(({data}) => { if(data.session) showAdmin(data.session.user.email); });
  sb.auth.onAuthStateChange((_e, session) => { if(session) showAdmin(session.user.email); else { $('#admin-box').style.display='none'; $('#login-box').style.display='block'; } });
}
async function adminLogin(){
  const {error} = await sb.auth.signInWithPassword({email: $('#login-email').value.trim(), password: $('#login-pass').value});
  $('#login-msg').innerHTML = error ? '<span class="err">Login failed: '+esc(error.message)+'</span>' : '<span class="ok">Logged in.</span>';
}
async function adminLogout(){ await sb.auth.signOut(); location.reload(); }
async function showAdmin(email){
  $('#login-box').style.display='none'; $('#admin-box').style.display='block'; $('#who').textContent = 'Logged in as '+email;
  const s = (await sb.from('site_settings').select('*').eq('id',1).single()).data || {};
  $('#f-address').value=s.address||''; $('#f-phone').value=s.phone||''; $('#f-email').value=s.email||'';
  $('#f-wa').value=s.whatsapp_number||''; $('#f-fb').value=s.facebook_url||''; $('#f-hours').value=s.hours||'';
  loadCertList();
}
async function requireAuth(){ const {data} = await sb.auth.getSession(); if(!data.session){ alert('Please log in first.'); throw new Error('not logged in'); } }
async function upload(file){
  if(!file) return '';
  const path = Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const {error} = await sb.storage.from('media').upload(path, file, {upsert:true});
  if(error) throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}
async function saveSettings(){ await requireAuth();
  const {error} = await sb.from('site_settings').update({address:$('#f-address').value,phone:$('#f-phone').value,email:$('#f-email').value,whatsapp_number:$('#f-wa').value.replace(/\D/g,''),facebook_url:$('#f-fb').value,hours:$('#f-hours').value}).eq('id',1);
  $('#msg-settings').textContent = error ? error.message : 'Saved. Public site updates in realtime.'; }
async function addStudent(){ await requireAuth();
  const photo = await upload($('#s-photo').files[0]);
  const {error} = await sb.from('students').insert({roll:$('#s-roll').value.trim(),name:$('#s-name').value.trim(),course:$('#s-course').value.trim(),batch:$('#s-batch').value.trim(),photo_url:photo});
  $('#msg-student').textContent = error ? error.message : 'Student added.'; }
function certNode(c){
  const d = document.createElement('div');
  d.innerHTML = `<div class="cert"><div class="cert-in"><img src="assets/IMG-20261102-WA0023.jpg" style="width:70px;height:70px;object-fit:cover;border-radius:50%" alt="">
  <div class="c-centre">SB Vocational Training Centre</div><div class="c-license">LICENSE NO: <b>${esc(c.license_no)}</b></div>
  <div class="c-level">LEVEL-${esc(c.level)}</div><div class="c-jp">修了証明書</div><div class="c-en">Certificate of Completion</div>
  <div class="c-name">${esc(c.student_name)}</div>
  <p class="c-body">This is to certify that the above-named trainee has successfully completed the ${esc(c.course_name)} conducted by SB Vocational Training Centre, comprising a minimum of ${esc(c.hours)} hours over a period of ${esc(c.duration_months)} months.</p>
  <div class="c-issue">Date of Issue: ${new Date(c.issue_date).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}</div><div class="c-divider"></div>
  <div class="c-sigs"><div class="c-sig"><div class="c-line"></div><div>COORDINATOR</div><small>SB VOCATIONAL TRAINING CENTRE</small></div>
  <div class="c-sig"><div class="c-line"></div><div>DIRECTOR / AUTHORIZED SIGNATORY</div><small>SB VOCATIONAL TRAINING CENTRE</small></div></div></div></div>`;
  return d.firstChild;
}
async function downloadNode(node, name){
  const wrap = document.createElement('div'); wrap.style.position='fixed'; wrap.style.left='-9999px'; wrap.appendChild(node); document.body.appendChild(wrap);
  const canvas = await html2canvas(node,{scale:2}); const {jsPDF} = window.jspdf;
  const pdf = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  pdf.addImage(canvas.toDataURL('image/jpeg',0.95),'JPEG',0,0,297,210);
  pdf.save(`Certificate-${name.replace(/\s+/g,'_')}.pdf`); wrap.remove();
}
async function issueCert(){ await requireAuth();
  // Issue date = TODAY, the download date (date only, no time).
  const today = new Date().toISOString().slice(0,10);
  const rec = {student_name:$('#c-name').value.trim(), license_no:$('#c-license').value.trim(), level:$('#c-level').value,
    course_name:$('#c-course').value.trim(), start_date:$('#c-start').value||null, end_date:$('#c-end').value||null,
    duration_months:parseInt($('#c-months').value)||3, hours:parseInt($('#c-hours').value)||180, issue_date:today};
  const {error} = await sb.from('certificates').upsert(rec,{onConflict:'license_no'});
  if(error){ $('#msg-cert').textContent = error.message; return; }
  await downloadNode(certNode(rec), rec.student_name);
  $('#msg-cert').textContent = 'Saved + downloaded. Issue date: '+today; loadCertList();
}
async function loadCertList(){
  const {data} = await sb.from('certificates').select('*').order('created_at',{ascending:false});
  $('#cert-list').innerHTML = '<h3>Previously issued certificates — re-download (no duplicate record)</h3>' +
    (data||[]).map(c=>`<p>${esc(c.student_name)} • ${esc(c.license_no)} <button class="btn secondary" data-dl="${c.id}">Download PDF</button></p>`).join('');
  $('#cert-list').querySelectorAll('[data-dl]').forEach(b=>{ b.onclick = async ()=>{ const c=(data||[]).find(x=>x.id===b.dataset.dl); if(c) await downloadNode(certNode(c), c.student_name); }; });
}
async function addNotice(){ await requireAuth();
  const {error} = await sb.from('notices').insert({title:$('#n-title').value.trim(),body:$('#n-body').value.trim(),notice_date:$('#n-date').value||null});
  $('#msg-notice').textContent = error ? error.message : 'Notice added.'; }
async function addGallery(){ await requireAuth();
  const url = await upload($('#g-file').files[0]); if(!url){ $('#msg-gallery').textContent='Choose a photo first.'; return; }
  const {error} = await sb.from('gallery_items').insert({caption:$('#g-cap').value.trim(),image_url:url});
  $('#msg-gallery').textContent = error ? error.message : 'Photo added.'; }
async function saveTeacher(){ await requireAuth();
  const photo = await upload($('#t-photo').files[0]);
  const {data} = await sb.from('teachers').select('id').limit(1);
  const row = {name:$('#t-name').value.trim(),title:$('#t-title').value.trim(),about:$('#t-about').value.trim()};
  if(photo) row.photo_url = photo;
  const {error} = data && data[0] ? await sb.from('teachers').update(row).eq('id',data[0].id) : await sb.from('teachers').insert(row);
  $('#msg-teacher').textContent = error ? error.message : 'Teacher saved.'; }
async function addAch(){ await requireAuth();
  const {error} = await sb.from('achievements').insert({title:$('#a-title').value.trim(),detail:$('#a-detail').value.trim()});
  $('#msg-ach').textContent = error ? error.message : 'Achievement added.'; }
async function addStory(){ await requireAuth();
  const photo = await upload($('#st-photo').files[0]);
  const {error} = await sb.from('success_stories').insert({student_name:$('#st-name').value.trim(),story:$('#st-story').value.trim(),photo_url:photo});
  $('#msg-story').textContent = error ? error.message : 'Success story added.'; }
async function addSlide(){ await requireAuth();
  const url = await upload($('#sl-file').files[0]);
  const video = $('#sl-video').value.trim();
  const {error} = await sb.from('slideshow_items').insert({kind: video ? 'video':'image', video_url:video, image_url:url});
  $('#msg-slide').textContent = error ? error.message : 'Slide added. If no video slide exists, pictures slide automatically.'; }
document.addEventListener('DOMContentLoaded', init);
