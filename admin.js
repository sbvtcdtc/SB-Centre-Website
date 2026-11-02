"use strict";
/* Admin — Supabase Auth only. No password is hardcoded anywhere in this file.
   Styled exactly like the template admin panel. Every list has a Delete button
   with a confirm step. This page is reachable only by direct link (admin.html);
   the public site contains no admin link. */
var cfg = window.SB_CONFIG || {};
var sb = null;
function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function toast(msg){ var el=$("#toast"); if(!el) return; el.textContent=msg; el.classList.add("show"); clearTimeout(el._h); el._h=setTimeout(function(){ el.classList.remove("show"); },3400); }
function fmtEn(iso){ if(!iso) return "—"; var d=new Date(iso+"T00:00:00"); if(isNaN(d)) return iso; return d.toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"}); }
async function requireAuth(){ var d = await sb.auth.getSession(); if(!d.data.session){ alert("Please log in first."); throw new Error("not logged in"); } }
async function init(){
  if(!cfg.SUPABASE_URL || String(cfg.SUPABASE_URL).indexOf("YOUR-PROJECT")>=0){ $("#login-err").textContent = "Supabase not configured yet. See README.md."; return; }
  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  sb.auth.getSession().then(function(r){ if(r.data.session) showAdmin(r.data.session.user.email); });
  sb.auth.onAuthStateChange(function(_e, session){ if(session) showAdmin(session.user.email); else { $("#admin-app").style.display="none"; $("#admin-login").style.display="block"; } });
}
async function adminLogin(){
  var r = await sb.auth.signInWithPassword({email: $("#login-email").value.trim(), password: $("#login-pass").value});
  $("#login-err").textContent = r.error ? ("Login failed: "+r.error.message) : "";
}
async function adminLogout(){ await sb.auth.signOut(); location.reload(); }
function goPanel(name){
  $$("#admin-side button").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-panel")===name); });
  $$(".admin-panel").forEach(function(p){ p.classList.toggle("on", p.id==="panel-"+name); });
}
async function showAdmin(email){
  $("#admin-login").style.display="none"; $("#admin-app").style.display="block";
  $("#who").textContent = "Logged in as "+email;
  await loadAll();
}
async function getAll(table){ var r = await sb.from(table).select("*").order("created_at",{ascending:false}); return r.data||[]; }
async function deleteRow(table, id){
  await requireAuth();
  if(!confirm("আপনি কি নিশ্চিত? মুছে ফেললে ফিরিয়ে আনা যাবে না।")) return;
  var r = await sb.from(table).delete().eq("id", id);
  if(r.error){ toast(r.error.message); return; }
  toast("Deleted."); await loadAll();
}
async function upload(file){
  if(!file) return "";
  var path = Date.now()+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  var r = await sb.storage.from("media").upload(path, file, {upsert:true});
  if(r.error) throw r.error;
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}
function delBtn(table, id){ return '<div class="rowbtns"><button type="button" class="mini-btn danger" data-del-table="'+table+'" data-del-id="'+id+'">মুছুন</button></div>'; }
function bindDeletes(scope){
  scope.querySelectorAll("[data-del-table]").forEach(function(b){
    b.addEventListener("click", function(){ deleteRow(b.getAttribute("data-del-table"), b.getAttribute("data-del-id")); });
  });
}
async function loadAll(){
  await requireAuth();
  var s = (await sb.from("site_settings").select("*").eq("id",1).single()).data || {};
  $("#f-name").value = s.centre_name||""; $("#f-tagline").value = s.tagline_bn||"";
  $("#f-headline").value = s.hero_title_bn||""; $("#f-lead").value = s.hero_sub_bn||"";
  $("#f-about").value = s.about_bn||""; $("#f-phone").value = s.phone||"";
  $("#f-email").value = s.email||""; $("#f-address").value = s.address||"";
  $("#f-hours").value = s.hours||""; $("#f-fb").value = s.facebook_url||"";
  $("#f-whatsapp").value = s.whatsapp_number||"";
  var courses = await getAll("courses");
  fillCourseForm(courses);
  var notices = await getAll("notices");
  $("#notice-tbody").innerHTML = notices.map(function(n){ return "<tr><td>"+esc(n.notice_date||"")+"</td><td>"+esc(n.title)+"</td><td>"+delBtn("notices", n.id)+"</td></tr>"; }).join("");
  var students = await getAll("students");
  $("#student-tbody").innerHTML = students.map(function(x){ return "<tr><td>"+esc(x.roll)+"</td><td>"+esc(x.name)+"</td><td>"+esc(x.course||"")+"</td><td>"+delBtn("students", x.id)+"</td></tr>"; }).join("");
  var teachers = await getAll("teachers");
  $("#teacher-tbody").innerHTML = teachers.map(function(x){ return "<tr><td>"+esc(x.name)+"</td><td>"+esc(x.title||"")+"</td><td>"+delBtn("teachers", x.id)+"</td></tr>"; }).join("");
  var ach = await getAll("achievements");
  $("#ach-tbody").innerHTML = ach.map(function(x){ return "<tr><td>"+esc(x.title)+"</td><td>"+esc(x.achieved_date||"")+"</td><td>"+delBtn("achievements", x.id)+"</td></tr>"; }).join("");
  var stories = await getAll("success_stories");
  $("#story-tbody").innerHTML = stories.map(function(x){ return "<tr><td>"+esc(x.student_name)+"</td><td>"+esc((x.story||"").slice(0,60))+"</td><td>"+delBtn("success_stories", x.id)+"</td></tr>"; }).join("");
  var slides = await getAll("slideshow_items");
  $("#slide-tbody").innerHTML = slides.map(function(x){ return "<tr><td>"+esc(x.kind)+"</td><td>"+esc(x.video_url||x.image_url||x.title||"")+"</td><td>"+delBtn("slideshow_items", x.id)+"</td></tr>"; }).join("");
  var gallery = await getAll("gallery_items");
  $("#gal-admin-grid").innerHTML = gallery.map(function(g){ return '<div class="gal-admin-item"><img src="'+esc(g.image_url)+'" alt="" /><div class="cap"><span>'+esc(g.caption||"")+'</span>'+delBtn("gallery_items", g.id)+'</div></div>'; }).join("");
  var certs = await getAll("certificates");
  $("#cert-tbody").innerHTML = certs.map(function(c){ return "<tr><td>"+esc(c.student_name)+"</td><td>"+esc(c.license_no)+"</td><td><div class=\"rowbtns\"><button type=\"button\" class=\"mini-btn\" data-dl-cert=\""+c.id+"\">ডাউনলোড</button>"+delBtn("certificates", c.id)+"</div></td></tr>"; }).join("");
  $("#cert-tbody").querySelectorAll("[data-dl-cert]").forEach(function(b){
    b.addEventListener("click", function(){ var c = certs.find(function(x){ return x.id===b.getAttribute("data-dl-cert"); }); if(c) downloadCertRecord(c); });
  });
  $("#d-students").textContent = students.length;
  $("#d-certs").textContent = certs.length;
  $("#d-notices").textContent = notices.length;
  $("#d-photos").textContent = gallery.length;
  bindDeletes(document);
  updateCertPreview();
}
function fillCourseForm(courses){
  var level = $("#ce-level").value || "N5";
  var c = (courses||[]).find(function(x){ return (x.id||"").toUpperCase()===level; });
  if(!c) return;
  $("#ce-title").value = c.title_bn||""; $("#ce-for").value = c.audience_bn||"";
  $("#ce-duration").value = c.duration_months||""; $("#ce-hours").value = c.hours||"";
  $("#ce-desc").value = c.description_bn||"";
}
async function saveInfo(){
  await requireAuth();
  var r = await sb.from("site_settings").update({centre_name:$("#f-name").value.trim(), tagline_bn:$("#f-tagline").value.trim(), hero_title_bn:$("#f-headline").value.trim(), hero_sub_bn:$("#f-lead").value.trim(), about_bn:$("#f-about").value.trim(), phone:$("#f-phone").value.trim(), email:$("#f-email").value.trim(), address:$("#f-address").value.trim(), hours:$("#f-hours").value.trim(), facebook_url:$("#f-fb").value.trim(), whatsapp_number:$("#f-whatsapp").value.replace(/\D/g,"")}).eq("id",1);
  $("#info-msg").textContent = r.error ? r.error.message : "Saved. Public site updates in realtime.";
}
async function saveCourse(){
  await requireAuth();
  var level = $("#ce-level").value;
  var row = {id:level, level:level, title_bn:$("#ce-title").value.trim(), audience_bn:$("#ce-for").value.trim(), duration_months:parseInt($("#ce-duration").value)||3, hours:parseInt($("#ce-hours").value)||180, description_bn:$("#ce-desc").value.trim()};
  var r = await sb.from("courses").upsert(row, {onConflict:"id"});
  $("#ce-msg").textContent = r.error ? r.error.message : "Course saved.";
}
async function addNotice(){
  await requireAuth();
  var r = await sb.from("notices").insert({title:$("#n-title").value.trim(), body:$("#n-body").value.trim(), notice_date:$("#n-date").value||null});
  $("#n-msg").textContent = r.error ? r.error.message : "Notice added.";
  if(!r.error){ $("#n-title").value=""; $("#n-body").value=""; await loadAll(); }
}
async function addStudent(){
  await requireAuth();
  var photo = await upload($("#s-photo").files[0]);
  var r = await sb.from("students").insert({roll:$("#s-roll").value.trim(), name:$("#s-name").value.trim(), course:$("#s-course").value, batch:$("#s-batch").value.trim(), session:$("#s-session").value.trim(), photo_url:photo});
  $("#s-msg").textContent = r.error ? r.error.message : "Student added.";
  if(!r.error) await loadAll();
}
async function saveTeacher(){
  await requireAuth();
  var photo = await upload($("#t-photo").files[0]);
  var row = {name:$("#t-name").value.trim(), title:$("#t-title").value.trim(), about:$("#t-about").value.trim()};
  if(photo) row.photo_url = photo;
  var existing = await getAll("teachers");
  var r = existing[0] ? await sb.from("teachers").update(row).eq("id", existing[0].id) : await sb.from("teachers").insert(row);
  $("#t-msg").textContent = r.error ? r.error.message : "Teacher saved.";
  if(!r.error) await loadAll();
}
async function addAch(){
  await requireAuth();
  var r = await sb.from("achievements").insert({title:$("#a-title").value.trim(), detail:$("#a-detail").value.trim(), achieved_date:$("#a-date").value||null});
  $("#a-msg").textContent = r.error ? r.error.message : "Achievement added.";
  if(!r.error) await loadAll();
}
async function addStory(){
  await requireAuth();
  var photo = await upload($("#st-photo").files[0]);
  var r = await sb.from("success_stories").insert({student_name:$("#st-name").value.trim(), story:$("#st-story").value.trim(), photo_url:photo});
  $("#st-msg").textContent = r.error ? r.error.message : "Success story added.";
  if(!r.error) await loadAll();
}
async function addSlide(){
  await requireAuth();
  var url = await upload($("#sl-file").files[0]);
  var video = $("#sl-video").value.trim();
  var r = await sb.from("slideshow_items").insert({kind: video ? "video" : "image", video_url: video, image_url: url, title: $("#sl-title").value.trim()});
  $("#sl-msg").textContent = r.error ? r.error.message : "Slide added.";
  if(!r.error) await loadAll();
}
async function addGallery(){
  await requireAuth();
  var url = await upload($("#g-file").files[0]);
  if(!url){ $("#g-msg").textContent = "Choose a photo first."; return; }
  var r = await sb.from("gallery_items").insert({caption:$("#g-cap").value.trim(), image_url:url});
  $("#g-msg").textContent = r.error ? r.error.message : "Photo added.";
  if(!r.error) await loadAll();
}
function certRecordFromForm(){
  var today = new Date().toISOString().slice(0,10);
  return {student_name:$("#c-name").value.trim(), license_no:$("#c-license").value.trim(), level:$("#c-level").value,
    course_name:$("#c-course").value.trim(), start_date:$("#c-start").value||null, end_date:$("#c-end").value||null,
    duration_months:parseInt($("#c-months").value)||3, hours:parseInt($("#c-hours").value)||180, issue_date:today};
}
function updateCertPreview(){
  var rec = certRecordFromForm();
  var period = (rec.start_date && rec.end_date) ? fmtEn(rec.start_date)+" – "+fmtEn(rec.end_date) : "";
  $("#pc-license").textContent = rec.license_no || "—";
  $("#pc-level").textContent = rec.level || "N5";
  $("#pc-name").textContent = rec.student_name || "STUDENT NAME";
  $("#pc-body").innerHTML = "has successfully completed the <b>"+esc(rec.course_name)+"</b> ("+esc(rec.hours)+" hours) at SB Vocational Training Centre"+(period?", during the period <b>"+esc(period)+"</b>":"")+", and is hereby awarded this certificate in recognition of successful completion of the course requirements.";
  $("#pc-date").textContent = fmtEn(rec.issue_date);
}
async function downloadNode(node, name){
  var canvas = await html2canvas(node, {scale:2, backgroundColor:"#fffdf6", useCORS:true});
  var jsPDF = window.jspdf.jsPDF;
  var pdf = new jsPDF({orientation:"landscape", unit:"mm", format:"a4"});
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 297, 210);
  pdf.save("Certificate-"+String(name||"Student").replace(/\s+/g,"_")+".pdf");
}
async function issueCert(){
  await requireAuth();
  var rec = certRecordFromForm();
  if(!rec.student_name || !rec.license_no){ $("#c-msg").textContent = "Name and license number are required."; return; }
  var r = await sb.from("certificates").upsert(rec, {onConflict:"license_no"});
  if(r.error){ $("#c-msg").textContent = r.error.message; return; }
  updateCertPreview();
  await downloadNode(document.getElementById("cert-preview"), rec.student_name);
  $("#c-msg").textContent = "Saved + downloaded. Issue date: "+rec.issue_date;
  await loadAll();
}
async function downloadCertRecord(c){
  // Fill the preview node with the existing record, then capture it (no new record).
  $("#c-name").value = c.student_name; $("#c-license").value = c.license_no; $("#c-level").value = c.level;
  $("#c-course").value = c.course_name; $("#c-start").value = c.start_date||""; $("#c-end").value = c.end_date||"";
  $("#c-months").value = c.duration_months; $("#c-hours").value = c.hours;
  var period = (c.start_date && c.end_date) ? fmtEn(c.start_date)+" – "+fmtEn(c.end_date) : "";
  $("#pc-license").textContent = c.license_no; $("#pc-level").textContent = c.level; $("#pc-name").textContent = c.student_name;
  $("#pc-body").innerHTML = "has successfully completed the <b>"+esc(c.course_name)+"</b> ("+esc(c.hours)+" hours) at SB Vocational Training Centre"+(period?", during the period <b>"+esc(period)+"</b>":"")+", and is hereby awarded this certificate in recognition of successful completion of the course requirements.";
  $("#pc-date").textContent = fmtEn(c.issue_date);
  await downloadNode(document.getElementById("cert-preview"), c.student_name);
  toast("Downloaded.");
}
async function backupExport(){
  await requireAuth();
  var out = {};
  var tables = ["site_settings","courses","students","certificates","notices","gallery_items","teachers","achievements","success_stories","slideshow_items"];
  for(var i=0;i<tables.length;i++){ out[tables[i]] = await getAll(tables[i]); }
  var blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
  var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sb-centre-backup.json"; a.click();
}
document.addEventListener("DOMContentLoaded", function(){
  init();
  $("#btn-login").addEventListener("click", adminLogin);
  $("#btn-logout").addEventListener("click", adminLogout);
  $$("#admin-side button").forEach(function(b){ b.addEventListener("click", function(){ goPanel(b.getAttribute("data-panel")); }); });
  $("#btn-save-info").addEventListener("click", saveInfo);
  $("#ce-level").addEventListener("change", function(){ loadAll(); });
  $("#btn-save-course").addEventListener("click", saveCourse);
  $("#btn-save-notice").addEventListener("click", addNotice);
  $("#btn-save-student").addEventListener("click", addStudent);
  $("#btn-save-teacher").addEventListener("click", saveTeacher);
  $("#btn-save-ach").addEventListener("click", addAch);
  $("#btn-save-story").addEventListener("click", addStory);
  $("#btn-save-slide").addEventListener("click", addSlide);
  $("#btn-save-gallery").addEventListener("click", addGallery);
  $("#btn-issue-cert").addEventListener("click", issueCert);
  $("#btn-backup").addEventListener("click", backupExport);
  ["c-name","c-license","c-level","c-course","c-start","c-end","c-months","c-hours"].forEach(function(id){
    var el = document.getElementById(id); if(el) el.addEventListener("input", updateCertPreview);
  });
});
