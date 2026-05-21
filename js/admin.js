/* ============ js/admin.js — Class S v3 ============ */
'use strict';

const HEADMASTER_HASH = '97c71b7f372d1c03bd0a375051a5306ee5a54cc773bb05af7aa0cb31d3f60492';
const ALL_PERMS = ['articles','projects','services','pages','clients','messages','media','footer','analytics','users','settings'];

let currentUser = null;
let quillArticle = null;
let editingArticleId = null;
let editingProjectId = null;
let editingUserId = null;

/* ── CROP STATE ── */
let cropCallback = null;
let cropImg = new Image();
let cropScale = 1, cropMinScale = 1;
let cropX = 0, cropY = 0;
let cropDragging = false, cropStartX, cropStartY, cropStartOX, cropStartOY;

/* ── SHA-256 ── */
async function sha256(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}

/* ── STORAGE ── */
/* ── Cache mémoire (peuplé depuis Firestore au démarrage) ── */
const DB = {};

/* ── Sauvegarde Firestore en arrière-plan ── */
async function fbSave(key, value) {
  try {
    const FB = await Promise.race([
      window._fbReady || Promise.resolve(null),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000))
    ]);
    if (FB) { await FB.save(key, value); return; }
  } catch(e) {
    console.error('[Firebase] save error', key, e);
    showFbError('Erreur de sauvegarde Firebase. Données conservées localement.');
  }
  // Fallback localStorage
  try { localStorage.setItem('cs_'+key, JSON.stringify(value)); } catch {}
}

function showFbError(msg) {
  const el = document.getElementById('fb-sync-error');
  if (!el) return;
  el.textContent = '⚠️ ' + (msg || 'Erreur Firebase.');
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 7000);
}

/* ── Chargement initial depuis Firestore (avec timeout 10s) ── */
async function loadFromFirestore() {
  const keys = ['posts','projects','services','clients','testimonials',
                'team','footer','pageContent','messages','admins'];
  try {
    const FB = await Promise.race([
      window._fbReady || Promise.resolve(null),
      new Promise((_, rej) => setTimeout(() => rej(new Error('firebase timeout')), 10000))
    ]);
    if (!FB) throw new Error('Firebase non disponible');
    const data = await Promise.race([
      FB.loadAll(keys),
      new Promise((_, rej) => setTimeout(() => rej(new Error('loadAll timeout')), 10000))
    ]);
    Object.assign(DB, data);
    console.log('[Firebase] Données chargées:', Object.keys(data));
  } catch(e) {
    console.warn('[Firebase] Chargement échoué, fallback localStorage:', e.message);
    keys.forEach(k => {
      try { const v = localStorage.getItem('cs_'+k); if (v !== null) DB[k] = JSON.parse(v); }
      catch {}
    });
  }
}

/* ── Objet S : lectures depuis cache, écritures Firestore async ── */
const S = {
  posts:        () => DB.posts        ?? window.ClassS?.getDefaultPosts()        ?? [],
  projects:     () => DB.projects     ?? window.ClassS?.getDefaultProjects()     ?? [],
  services:     () => DB.services     ?? window.ClassS?.getDefaultServices()     ?? [],
  clients:      () => DB.clients      ?? window.ClassS?.getDefaultClients()      ?? [],
  testimonials: () => DB.testimonials ?? window.ClassS?.getDefaultTestimonials() ?? [],
  team:         () => DB.team         ?? window.ClassS?.getDefaultTeam()         ?? [],
  footer:       () => DB.footer       ?? window.ClassS?.getDefaultFooter()       ?? {},
  pageContent:  () => DB.pageContent  ?? window.ClassS?.getDefaultPageContent()  ?? {},
  messages:     () => DB.messages     ?? [],
  admins:       () => DB.admins       ?? [],

  savePosts:        v => { DB.posts        = v; fbSave('posts', v); },
  saveProjects:     v => { DB.projects     = v; fbSave('projects', v); },
  saveServices:     v => { DB.services     = v; fbSave('services', v); },
  saveClients:      v => { DB.clients      = v; fbSave('clients', v); },
  saveTestimonials: v => { DB.testimonials = v; fbSave('testimonials', v); },
  saveTeam:         v => { DB.team         = v; fbSave('team', v); },
  saveFooter:       v => { DB.footer       = v; fbSave('footer', v); },
  savePageContent:  v => { DB.pageContent  = v; fbSave('pageContent', v); },
  saveMessages:     v => { DB.messages     = v; fbSave('messages', v); },
  saveAdmins:       v => { DB.admins       = v; fbSave('admins', v); },

  // Lecture/écriture localStorage générique (pour settings non-Firestore)
  get: (key, def = null) => {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; } catch { return def; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

/* ════════════════════════════════════════
   INIT — ONLY cs_auth_user grants access
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const sess = sessionStorage.getItem('cs_auth_user');
  if (sess) {
    try { currentUser = JSON.parse(sess); }
    catch { showLogin(); return; }
    // Afficher le dashboard immédiatement avec les données par défaut
    showDashboard();
    // Charger Firebase en arrière-plan et rafraîchir si nécessaire
    const bar = document.getElementById('fb-loading-bar');
    if (bar) bar.style.display = 'block';
    loadFromFirestore().then(() => {
      if (bar) bar.style.display = 'none';
      // Rafraîchir toutes les listes visibles avec les vraies données Firestore
      if (typeof renderArticlesList === 'function') renderArticlesList();
      if (typeof renderProjectsList === 'function') renderProjectsList();
      if (typeof renderClients === 'function') renderClients();
      if (typeof renderTestimonials === 'function') renderTestimonials();
      if (typeof renderServices === 'function') renderServices();
      if (typeof renderTeam === 'function') renderTeam();
    }).catch(() => { if (bar) bar.style.display = 'none'; });
  } else {
    showLogin();
  }
});

/* ── LOGIN ── */
function showLogin(){
  document.getElementById('admin-login').style.display='flex';
  document.getElementById('admin-dashboard').style.display='none';
}

function showDashboard(){
  document.getElementById('admin-login').style.display='none';
  document.getElementById('admin-dashboard').style.display='flex';
  initDashboard();
}

let loginAttempts=0;
window.handleLogin = async function(){
  const usrEl=document.getElementById('login-username');
  const pwEl=document.getElementById('login-password');
  const errEl=document.getElementById('login-error');
  const btn=document.getElementById('login-btn');
  if(btn.disabled)return;

  const username=(usrEl?.value||'').trim();
  const password=pwEl?.value||'';
  if(!password){if(errEl){errEl.textContent='Mot de passe requis.';errEl.style.display='block';}return;}

  const hash=await sha256(password);

  // Headmaster check (username optional)
  if(hash===HEADMASTER_HASH){
    currentUser={type:'headmaster',username:'Headmaster',perms:ALL_PERMS};
    sessionStorage.setItem('cs_auth_user',JSON.stringify(currentUser));
    showDashboard();return;
  }

  // Sub-admin check (username + password required)
  if(username){
    const admins=S.admins();
    const admin=admins.find(a=>a.username.toLowerCase()===username.toLowerCase());
    if(admin&&hash===admin.passwordHash){
      if(!admin.active){showLoginErr(errEl,pwEl,'Compte désactivé.');return;}
      if(admin.expiry&&new Date(admin.expiry)<new Date()){showLoginErr(errEl,pwEl,'Compte expiré.');return;}
      currentUser={type:'admin',username:admin.username,perms:admin.perms||[]};
      sessionStorage.setItem('cs_auth_user',JSON.stringify(currentUser));
      showDashboard();return;
    }
  }

  loginAttempts++;
  showLoginErr(errEl,pwEl,`Identifiants incorrects. ${5-loginAttempts} tentative(s) restante(s).`);
  if(loginAttempts>=5){
    btn.disabled=true;
    const lock=document.getElementById('login-lockout');
    if(lock)lock.style.display='block';
    let s=60;
    const t=setInterval(()=>{
      s--;
      if(lock)lock.textContent=`Verrouillé ${s}s.`;
      if(s<=0){clearInterval(t);btn.disabled=false;loginAttempts=0;if(lock)lock.style.display='none';if(errEl)errEl.style.display='none';}
    },1000);
  }
};

function showLoginErr(errEl,inp,msg){
  if(inp){inp.value='';inp.classList.add('error');inp.classList.add('shake');setTimeout(()=>inp.classList.remove('shake','error'),500);}
  if(errEl){errEl.textContent=msg;errEl.style.display='block';}
}

window.logout=function(){sessionStorage.removeItem('cs_auth_user');window.location.href='index.html';};

/* ════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════ */
function initDashboard(){
  // Apply logo
  const logo=localStorage.getItem('cs_logo');
  if(logo){
    const sImg=document.querySelector('.sidebar-logo-img');
    const sTxt=document.querySelector('.sidebar-logo-text');
    if(sImg){sImg.src=logo;sImg.classList.add('loaded');}
    if(sTxt)sTxt.style.display='none';
  }
  // Username
  const un=document.getElementById('sidebar-username');if(un)un.textContent=currentUser?.username||'Admin';
  const ut=document.getElementById('sidebar-usertype');if(ut)ut.textContent=currentUser?.type==='headmaster'?'Headmaster ✦':'Administrateur';

  // Hide panels without permission
  document.querySelectorAll('.sidebar-nav button').forEach(btn=>{
    if(!hasPerm(btn.dataset.panel))btn.parentElement.style.display='none';
  });

  initTabs();
  if(hasPerm('articles'))initArticlesPanel();
  if(hasPerm('projects'))initProjectsPanel();
  if(hasPerm('services'))initServicesPanel();
  if(hasPerm('pages'))initPagesPanel();
  if(hasPerm('clients'))initClientsPanel();
  if(hasPerm('messages'))initMessagesPanel();
  if(hasPerm('media'))initMediaPanel();
  if(hasPerm('footer'))initFooterPanel();
  if(hasPerm('analytics'))initAnalyticsPanel();
  if(hasPerm('settings'))initSettingsPanel();
  if(hasPerm('users'))initUsersPanel();
}

function hasPerm(p){if(!p)return true;if(!currentUser)return false;if(currentUser.type==='headmaster')return true;return currentUser.perms?.includes(p);}

function initTabs(){
  const btns=document.querySelectorAll('.sidebar-nav button');
  const panels=document.querySelectorAll('.admin-panel');
  btns.forEach(b=>b.addEventListener('click',()=>{
    btns.forEach(x=>x.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    b.classList.add('active');
    document.getElementById('panel-'+b.dataset.panel)?.classList.add('active');
  }));
  [...btns].find(b=>b.parentElement.style.display!=='none')?.click();
}

/* ════════════════════════════════════════
   IMAGE UPLOAD HELPER (FileReader → base64)
════════════════════════════════════════ */
/* ── Image compression — max 800px, JPEG 0.72 ── */
function compressImage(dataURL,maxPx=800,quality=0.72){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      let w=img.naturalWidth,h=img.naturalHeight;
      if(w<=maxPx&&h<=maxPx&&dataURL.length<600*1024){resolve(dataURL);return;}
      const scale=Math.min(maxPx/w,maxPx/h,1);
      w=Math.round(w*scale);h=Math.round(h*scale);
      const c=document.createElement('canvas');c.width=w;c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      resolve(c.toDataURL('image/jpeg',quality));
    };
    img.src=dataURL;
  });
}

/* ── Safe localStorage save with quota feedback ────────── */


function makeImgUpload(containerId, onLoaded, opts={}){
  const wrap=document.getElementById(containerId);
  if(!wrap)return;
  const allowCrop=opts.crop||false;

  const thumb=wrap.querySelector('.img-thumb-preview');
  const fileInp=wrap.querySelector('input[type=file]');
  const cropBtn=wrap.querySelector('.btn-crop');
  const removeBtn=wrap.querySelector('.btn-remove-img');

  let currentData='';

  function setImage(data){
    currentData=data;
    if(thumb){thumb.src=data;thumb.classList.add('loaded');}
    if(cropBtn)cropBtn.classList.add('visible');
    onLoaded(data);
  }

  fileInp?.addEventListener('change',()=>{
    const f=fileInp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=async e=>{
      const compressed=await compressImage(e.target.result);
      if(allowCrop){
        openCropModal(compressed,(croppedData)=>{setImage(croppedData);});
      } else {
        setImage(compressed);
      }
    };
    r.readAsDataURL(f);
  });

  cropBtn?.addEventListener('click',()=>{
    if(currentData)openCropModal(currentData,(croppedData)=>{setImage(croppedData);});
  });

  removeBtn?.addEventListener('click',()=>{
    currentData='';
    if(thumb){thumb.src='';thumb.classList.remove('loaded');}
    if(cropBtn)cropBtn.classList.remove('visible');
    if(fileInp)fileInp.value='';
    onLoaded('');
  });

  return {getData:()=>currentData, setData:(d)=>{if(d){setImage(d);}else{currentData='';if(thumb){thumb.src='';thumb.classList.remove('loaded');}}}};
}

/* ════════════════════════════════════════
   CROP MODAL
════════════════════════════════════════ */
function openCropModal(imgSrc, callback){
  const modal=document.getElementById('crop-modal');
  const viewport=document.getElementById('crop-viewport');
  const imgLayer=document.getElementById('crop-img-layer');
  const zoomInp=document.getElementById('crop-zoom-input');
  const zoomVal=document.getElementById('crop-zoom-val');
  const confirmBtn=document.getElementById('crop-confirm');
  const cancelBtn=document.getElementById('crop-cancel');
  if(!modal||!viewport||!imgLayer)return;

  cropCallback=callback;
  cropImg=new Image();
  cropImg.onload=()=>{
    const vpSize=viewport.offsetWidth||320;
    // Calculate min scale so image fills viewport
    cropMinScale=Math.max(vpSize/cropImg.naturalWidth,vpSize/cropImg.naturalHeight);
    cropScale=cropMinScale;
    // Center image
    cropX=(vpSize-cropImg.naturalWidth*cropScale)/2;
    cropY=(vpSize-cropImg.naturalHeight*cropScale)/2;
    updateCropTransform();
    if(zoomInp){zoomInp.min=cropMinScale;zoomInp.max=cropMinScale*4;zoomInp.step=cropMinScale*0.05;zoomInp.value=cropScale;}
    if(zoomVal)zoomVal.textContent=Math.round((cropScale/cropMinScale-1)*100)+'%';
  };
  cropImg.src=imgSrc;
  imgLayer.src=imgSrc;

  // Drag
  viewport.addEventListener('mousedown',startDrag);
  viewport.addEventListener('touchstart',startDragTouch,{passive:true});

  // Zoom
  zoomInp?.addEventListener('input',()=>{
    const vp=viewport.offsetWidth||320;
    const prevScale=cropScale;
    cropScale=parseFloat(zoomInp.value);
    // Keep image centered on zoom
    cropX+=(vp/2-cropX)*(1-cropScale/prevScale);
    cropY+=(vp/2-cropY)*(1-cropScale/prevScale);
    clampCrop();
    updateCropTransform();
    if(zoomVal)zoomVal.textContent=Math.round((cropScale/cropMinScale-1)*100)+'%';
  });

  confirmBtn?.addEventListener('click',doCrop);
  cancelBtn?.addEventListener('click',closeCropModal);
  modal.classList.add('open');
}

function startDrag(e){
  cropDragging=true;
  cropStartX=e.clientX;cropStartY=e.clientY;
  cropStartOX=cropX;cropStartOY=cropY;
  window.addEventListener('mousemove',onDrag);
  window.addEventListener('mouseup',stopDrag);
}
function startDragTouch(e){
  const t=e.touches[0];
  cropDragging=true;cropStartX=t.clientX;cropStartY=t.clientY;cropStartOX=cropX;cropStartOY=cropY;
  window.addEventListener('touchmove',onDragTouch,{passive:false});
  window.addEventListener('touchend',stopDrag);
}
function onDrag(e){if(!cropDragging)return;cropX=cropStartOX+(e.clientX-cropStartX);cropY=cropStartOY+(e.clientY-cropStartY);clampCrop();updateCropTransform();}
function onDragTouch(e){e.preventDefault();if(!cropDragging)return;const t=e.touches[0];cropX=cropStartOX+(t.clientX-cropStartX);cropY=cropStartOY+(t.clientY-cropStartY);clampCrop();updateCropTransform();}
function stopDrag(){cropDragging=false;window.removeEventListener('mousemove',onDrag);window.removeEventListener('mouseup',stopDrag);window.removeEventListener('touchmove',onDragTouch);window.removeEventListener('touchend',stopDrag);}

function clampCrop(){
  const vp=document.getElementById('crop-viewport')?.offsetWidth||320;
  const iw=cropImg.naturalWidth*cropScale;
  const ih=cropImg.naturalHeight*cropScale;
  cropX=Math.min(0,Math.max(vp-iw,cropX));
  cropY=Math.min(0,Math.max(vp-ih,cropY));
}

function updateCropTransform(){
  const l=document.getElementById('crop-img-layer');
  if(l)l.style.transform=`translate(${cropX}px,${cropY}px) scale(${cropScale})`;
  // Actually need to set via width/transform-origin
  if(l){l.style.transformOrigin='0 0';l.style.transform=`translate(${cropX}px,${cropY}px) scale(${cropScale})`;}
}

function doCrop(){
  const vp=document.getElementById('crop-viewport')?.offsetWidth||320;
  const canvas=document.createElement('canvas');
  canvas.width=vp;canvas.height=vp;
  const ctx=canvas.getContext('2d');
  // Draw image at current position/scale
  ctx.drawImage(cropImg,cropX,cropY,cropImg.naturalWidth*cropScale,cropImg.naturalHeight*cropScale);
  const data=canvas.toDataURL('image/jpeg',0.92);
  if(cropCallback)cropCallback(data);
  closeCropModal();
}

function closeCropModal(){
  const modal=document.getElementById('crop-modal');
  if(modal)modal.classList.remove('open');
  cropCallback=null;
}

/* ════════════════════════════════════════
   ARTICLES PANEL
════════════════════════════════════════ */
let articleCoverUpload=null;

function initArticlesPanel(){
  renderArticlesList();
  document.getElementById('btn-new-article')?.addEventListener('click',()=>{editingArticleId=null;openArticleForm(null);});
  document.getElementById('article-form')?.addEventListener('submit',e=>{e.preventDefault();saveArticle(false);});
  document.getElementById('btn-draft')?.addEventListener('click',()=>saveArticle(true));
  document.getElementById('btn-cancel-article')?.addEventListener('click',closeArticleForm);

  // Image upload
  articleCoverUpload=makeImgUpload('article-cover-upload',()=>{});

  if(typeof Quill!=='undefined'){
    quillArticle=new Quill('#article-quill',{
      theme:'snow',
      modules:{toolbar:{container:[['bold','italic','underline','strike'],[{header:[2,3,false]}],['link','blockquote','image'],[{list:'ordered'},{list:'bullet'}],['clean']],handlers:{image:articleImageHandler}}}
    });
    quillArticle.on('text-change',debounce(updateSEO,800));
  }
  ['seo-title-input','seo-meta-desc','seo-keyword'].forEach(id=>document.getElementById(id)?.addEventListener('input',debounce(updateSEO,600)));
}

function articleImageHandler(){
  const input=document.createElement('input');input.type='file';input.accept='image/*';input.click();
  input.onchange=()=>{
    const f=input.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=e=>{
      const range=quillArticle.getSelection(true);
      quillArticle.insertEmbed(range.index,'image',e.target.result);
      const caption=f.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
      quillArticle.insertText(range.index+1,'\n');
      quillArticle.insertText(range.index+2,caption+'\n',{italic:true,color:'#888888'});
      quillArticle.setSelection(range.index+3);
    };
    r.readAsDataURL(f);
  };
}

function renderArticlesList(){
  const posts=S.posts();const tbody=document.getElementById('articles-tbody');if(!tbody)return;
  if(!posts.length){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:#555;padding:40px">Aucun article. Créez votre premier article.</td></tr>';return;}
  tbody.innerHTML=posts.map(p=>`<tr><td class="col-title">${p.draft?'<span class="badge badge-warn">Brouillon</span> ':''}<span>${p.title}</span></td><td class="col-cat">${p.category}</td><td class="col-date">${p.date||''}</td><td class="col-date">${p.modifiedAt?fmtDateTime(p.modifiedAt):'—'}</td><td><div class="col-actions"><button class="admin-btn sm" onclick="editArticle('${p.id}')">Éditer</button><button class="admin-btn danger sm" onclick="deleteArticle('${p.id}')">Supprimer</button></div></td></tr>`).join('');
}

function openArticleForm(post){
  const wrap=document.getElementById('article-form-wrap');if(!wrap)return;
  wrap.style.display='block';
  document.getElementById('article-form-title').textContent=post?'Modifier l\'article':'Nouvel article';
  document.getElementById('a-title').value=post?.title||'';
  document.getElementById('a-category').value=post?.category||'Branding';
  document.getElementById('a-date').value=post?dateToInput(post.date):'';
  document.getElementById('a-time').value=post?.time||'';
  document.getElementById('a-hashtags').value=(post?.hashtags||[]).join(', ');
  document.getElementById('a-author').value=post?.authorId||'';
  document.getElementById('seo-title-input').value=post?.seoTitle||post?.title||'';
  document.getElementById('seo-meta-desc').value=post?.seoDesc||post?.excerpt||'';
  document.getElementById('seo-keyword').value=post?.seoKeyword||'';
  if(articleCoverUpload)articleCoverUpload.setData(post?.cover||'');
  if(quillArticle)quillArticle.root.innerHTML=post?.content||'';
  updateSEO();
  wrap.scrollIntoView({behavior:'smooth',block:'start'});
}

function closeArticleForm(){document.getElementById('article-form-wrap').style.display='none';editingArticleId=null;}
window.editArticle=id=>{editingArticleId=id;openArticleForm(S.posts().find(p=>p.id===id));};
window.deleteArticle=id=>{if(!confirm('Supprimer cet article ?'))return;S.savePosts(S.posts().filter(p=>p.id!==id));renderArticlesList();feedback('articles-feedback','Article supprimé.','success');};

function saveArticle(draft=false){
  const title=document.getElementById('a-title').value.trim();
  if(!title){alert('Le titre est requis.');return;}
  const posts=S.posts();const now=new Date().toISOString();
  const article={
    id:editingArticleId||Date.now().toString(),title,
    category:document.getElementById('a-category').value,
    date:fmtDateFr(document.getElementById('a-date').value)||fmtDateFr(now.split('T')[0]),
    time:document.getElementById('a-time').value||now.slice(11,16),
    modifiedAt:now,
    cover:articleCoverUpload?articleCoverUpload.getData():'',
    coverGradient:'linear-gradient(135deg,#6600CC 0%,#0A0A0A 100%)',
    hashtags:document.getElementById('a-hashtags').value.split(',').map(h=>h.trim()).filter(Boolean),
    authorId:document.getElementById('a-author').value,
    seoTitle:document.getElementById('seo-title-input').value.trim(),
    seoDesc:document.getElementById('seo-meta-desc').value.trim(),
    seoKeyword:document.getElementById('seo-keyword').value.trim(),
    content:quillArticle?quillArticle.root.innerHTML:'',draft
  };
  article.excerpt=stripHtml(article.content).slice(0,180)+'…';
  if(editingArticleId){const i=posts.findIndex(p=>p.id===editingArticleId);if(i>=0)posts[i]=article;else posts.unshift(article);}
  else posts.unshift(article);
  S.savePosts(posts);closeArticleForm();renderArticlesList();
  feedback('articles-feedback',draft?'Brouillon sauvegardé.':'Article publié.','success');
}

/* ── SEO TOOL ── */
function updateSEO(){
  const content=quillArticle?stripHtml(quillArticle.root.innerHTML):'';
  const title=document.getElementById('seo-title-input')?.value||'';
  const desc=document.getElementById('seo-meta-desc')?.value||'';
  const kw=(document.getElementById('seo-keyword')?.value||'').toLowerCase();
  const words=content.split(/\s+/).filter(Boolean);const wc=words.length;
  const items=[];let score=0;
  const tl=title.length;
  if(tl>=50&&tl<=60){score+=15;items.push({ok:true,msg:`Titre SEO : ${tl} car. ✓ (50-60 idéal)`});}
  else if(tl>=40&&tl<=70){score+=10;items.push({warn:true,msg:`Titre SEO : ${tl} car. (idéal 50-60)`});}
  else{items.push({bad:true,msg:`Titre SEO : ${tl||'absent'} car. (idéal 50-60)`});}
  const dl=desc.length;
  if(dl>=150&&dl<=160){score+=15;items.push({ok:true,msg:`Meta description : ${dl} car. ✓`});}
  else if(dl>=130&&dl<=170){score+=10;items.push({warn:true,msg:`Meta description : ${dl} car. (idéal 150-160)`});}
  else{items.push({bad:true,msg:`Meta description : ${dl||'absente'} car.`});}
  if(wc>=1000){score+=20;items.push({ok:true,msg:`${wc} mots ✓ (excellent)`});}
  else if(wc>=600){score+=15;items.push({ok:true,msg:`${wc} mots (bon, >1000 idéal)`});}
  else if(wc>=300){score+=8;items.push({warn:true,msg:`${wc} mots (min. 600 recommandé)`});}
  else{items.push({bad:true,msg:`${wc} mots — trop court (min. 300)`});}
  const html=quillArticle?quillArticle.root.innerHTML:'';
  const h2=(html.match(/<h2/g)||[]).length;
  if(h2>=2){score+=15;items.push({ok:true,msg:`${h2} sous-titres H2 ✓`});}
  else if(h2===1){score+=8;items.push({warn:true,msg:'1 sous-titre H2 (recommandé ≥2)'});}
  else{items.push({bad:true,msg:'Aucun sous-titre H2'});}
  if(kw){
    const cnt=words.filter(w=>w.toLowerCase().includes(kw)).length;
    const density=wc>0?((cnt/wc)*100).toFixed(1):0;
    if(density>=1&&density<=3){score+=10;items.push({ok:true,msg:`Densité "${kw}": ${density}% ✓`});}
    else if(density>0){score+=5;items.push({warn:true,msg:`Densité "${kw}": ${density}% (idéal 1-3%)`});}
    else{items.push({bad:true,msg:`Mot-clé "${kw}" absent`});}
    if(title.toLowerCase().includes(kw)){score+=5;items.push({ok:true,msg:'Mot-clé dans le titre ✓'});}
    else{items.push({warn:true,msg:'Mot-clé absent du titre'});}
  } else {items.push({warn:true,msg:'Mot-clé de focus non défini'});}
  const imgCount=(html.match(/<img/g)||[]).length;
  if(imgCount>=1){score+=10;items.push({ok:true,msg:`${imgCount} image(s) ✓`});}
  else{items.push({warn:true,msg:'Aucune image'});}
  const sents=content.split(/[.!?]+/).filter(s=>s.trim().length>10);
  const avgW=sents.length?Math.round(wc/sents.length):0;
  if(avgW<=20&&avgW>0){score+=10;items.push({ok:true,msg:`~${avgW} mots/phrase ✓`});}
  else if(avgW<=30){score+=6;items.push({warn:true,msg:`~${avgW} mots/phrase (raccourcir)`});}
  else{items.push({bad:true,msg:`~${avgW} mots/phrase (trop long)`});}
  score=Math.min(100,score);
  const fill=document.getElementById('seo-score-fill');const num=document.getElementById('seo-score-num');const lbl=document.getElementById('seo-score-label');const list=document.getElementById('seo-items');
  if(!fill)return;
  fill.style.width=score+'%';fill.className='seo-score-fill '+(score>=80?'great':score>=60?'good':score>=40?'avg':'poor');
  if(num)num.textContent=score;
  if(lbl)lbl.textContent=score>=80?'🏆 Excellent':score>=60?'✅ Bon':score>=40?'⚠️ À améliorer':'❌ Insuffisant';
  if(list)list.innerHTML=items.map(i=>`<div class="seo-item ${i.ok?'ok':i.warn?'warn':'bad'}"><span class="ico"></span><span>${i.msg}</span></div>`).join('');
}

/* ════════════════════════════════════════
   PROJECTS PANEL
════════════════════════════════════════ */
/* ── Multi-image manager for projects ── */
let projectImages=[];  // array of base64 strings

function renderProjectImagesGrid(){
  const grid=document.getElementById('project-images-grid');
  if(!grid)return;
  if(!projectImages.length){grid.innerHTML='<span style="color:#555;font-size:13px">Aucune image ajoutée.</span>';return;}
  grid.innerHTML=projectImages.map((src,idx)=>`
    <div style="position:relative;flex-shrink:0">
      <img src="${src}" style="width:130px;height:85px;object-fit:cover;border:1px solid #2a2a2a;border-radius:3px;display:block">
      ${idx===0?'<span style="position:absolute;top:4px;left:4px;background:#6600CC;color:#fff;font-size:10px;padding:2px 6px;border-radius:2px">Principale</span>':''}
      <button type="button" onclick="removeProjectImage(${idx})" style="position:absolute;top:4px;right:4px;background:#0a0a0a;border:1px solid #444;color:#ccc;width:20px;height:20px;border-radius:50%;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">✕</button>
      ${idx>0?`<button type="button" onclick="moveProjectImage(${idx},-1)" title="Déplacer à gauche" style="position:absolute;bottom:4px;left:4px;background:#0a0a0a;border:1px solid #444;color:#ccc;width:20px;height:20px;border-radius:50%;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">←</button>`:''}
      ${idx<projectImages.length-1?`<button type="button" onclick="moveProjectImage(${idx},1)" title="Déplacer à droite" style="position:absolute;bottom:4px;right:4px;background:#0a0a0a;border:1px solid #444;color:#ccc;width:20px;height:20px;border-radius:50%;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">→</button>`:''}
    </div>`).join('');
}
window.removeProjectImage=idx=>{projectImages.splice(idx,1);renderProjectImagesGrid();};
window.moveProjectImage=(idx,dir)=>{
  const to=idx+dir;if(to<0||to>=projectImages.length)return;
  [projectImages[idx],projectImages[to]]=[projectImages[to],projectImages[idx]];
  renderProjectImagesGrid();
};

function initProjectsPanel(){
  renderProjectsList();
  document.getElementById('btn-new-project')?.addEventListener('click',()=>{editingProjectId=null;openProjectForm(null);});
  document.getElementById('project-form')?.addEventListener('submit',e=>{e.preventDefault();saveProject();});
  document.getElementById('btn-cancel-project')?.addEventListener('click',closeProjectForm);

  const fileInput=document.getElementById('project-img-file-input');
  fileInput?.addEventListener('change',()=>{
    const files=Array.from(fileInput.files);
    if(!files.length)return;
    const grid=document.getElementById('project-images-grid');
    const addBtn=document.getElementById('project-img-file-input')?.closest('label');
    // Show loading state
    const loadingEl=document.createElement('span');
    loadingEl.id='proj-img-loading';
    loadingEl.style.cssText='color:#6600CC;font-size:13px;display:block;margin-top:8px';
    loadingEl.textContent=`⏳ Chargement de ${files.length} image${files.length>1?'s':''}…`;
    grid.parentNode.appendChild(loadingEl);
    if(addBtn)addBtn.style.opacity='0.4';
    let loaded=0;
    const total=files.length;
    files.forEach(f=>{
      const r=new FileReader();
      r.onload=async e=>{
        const compressed=await compressImage(e.target.result);
        projectImages.push(compressed);
        loaded++;
        loadingEl.textContent=`⏳ ${loaded}/${total} image${total>1?'s':''} traité${total>1?'es':'e'}…`;
        if(loaded===total){
          loadingEl.remove();
          if(addBtn)addBtn.style.opacity='';
          renderProjectImagesGrid();
        }
      };
      r.readAsDataURL(f);
    });
    fileInput.value='';
  });
}

function renderProjectsList(){
  const projects=S.projects();const tbody=document.getElementById('projects-tbody');if(!tbody)return;
  if(!projects.length){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:#555;padding:40px">Aucun projet.</td></tr>';return;}
  tbody.innerHTML=projects.map(p=>`<tr><td class="col-title">${p.title}</td><td class="col-cat">${p.category}</td><td class="col-date">${p.month?p.month+' ':''}${p.year}</td><td><div class="col-actions"><button class="admin-btn sm" onclick="editProject('${p.id}')">Éditer</button><button class="admin-btn danger sm" onclick="deleteProject('${p.id}')">Supprimer</button></div></td></tr>`).join('');
}

function openProjectForm(p){
  document.getElementById('project-form-wrap').style.display='block';
  document.getElementById('p-title').value=p?.title||'';
  document.getElementById('p-category').value=p?.category||'Identité Visuelle';
  document.getElementById('p-year').value=p?.year||new Date().getFullYear();
  document.getElementById('p-month').value=p?.month||'';
  document.getElementById('p-description').value=p?.description||'';
  document.getElementById('p-behance').value=p?.behanceUrl||'';
  // Load images
  projectImages=p?.images?.length?[...p.images]:(p?.image?[p.image]:[]);
  renderProjectImagesGrid();
  document.getElementById('project-form-wrap').scrollIntoView({behavior:'smooth',block:'start'});
}

function closeProjectForm(){document.getElementById('project-form-wrap').style.display='none';editingProjectId=null;projectImages=[];}
window.editProject=id=>{editingProjectId=id;openProjectForm(S.projects().find(p=>p.id===id));};
window.deleteProject=id=>{if(!confirm('Supprimer ce projet ?'))return;S.saveProjects(S.projects().filter(p=>p.id!==id));renderProjectsList();feedback('projects-feedback','Projet supprimé.','success');};

function saveProject(){
  const title=document.getElementById('p-title').value.trim();if(!title){alert('Titre requis.');return;}
  const projects=S.projects();
  const proj={
    id:editingProjectId||Date.now().toString(),
    title,
    category:document.getElementById('p-category').value,
    year:document.getElementById('p-year').value,
    month:document.getElementById('p-month').value,
    images:[...projectImages],          // new: full array
    image:projectImages[0]||'',         // legacy compat: first image as main
    description:document.getElementById('p-description').value.trim(),
    behanceUrl:document.getElementById('p-behance')?.value.trim()||'',
    gradient:'linear-gradient(135deg,#6600CC 0%,#0A0A0A 100%)'
  };
  if(editingProjectId){const i=projects.findIndex(p=>p.id===editingProjectId);if(i>=0)projects[i]=proj;else projects.unshift(proj);}
  else projects.unshift(proj);
  S.saveProjects(projects);
  closeProjectForm();renderProjectsList();
  feedback('projects-feedback',`Projet sauvegardé. (${proj.images.length} image${proj.images.length!==1?'s':''})`);
}

/* ════════════════════════════════════════
   SERVICES PANEL
════════════════════════════════════════ */
function initServicesPanel(){renderServicesEditor();}
function renderServicesEditor(){
  const wrap=document.getElementById('services-editor');if(!wrap)return;
  wrap.innerHTML=S.services().map((s,i)=>`<div class="service-edit-card" data-id="${s.id}"><span class="service-num">${i+1}</span><div><div class="admin-form-grid" style="margin-bottom:10px"><div class="admin-form-group"><label>Icône (emoji)</label><input type="text" class="svc-icon" value="${s.icon||'✦'}" style="width:80px"></div><div class="admin-form-group"><label>Titre</label><input type="text" class="svc-title" value="${s.title||''}"></div></div><div class="admin-form-group"><label>Description</label><textarea class="svc-text" rows="3">${s.text||''}</textarea></div></div><div style="display:flex;flex-direction:column;gap:6px"><button class="admin-btn ghost sm" onclick="saveService('${s.id}',this)">Sauvegarder</button><button class="admin-btn danger sm" onclick="deleteService('${s.id}')">Supprimer</button></div></div>`).join('');
}
window.saveService=(id,btn)=>{const c=btn.closest('[data-id]');const svcs=S.services();const s=svcs.find(x=>x.id===id);if(!s)return;s.icon=c.querySelector('.svc-icon').value.trim();s.title=c.querySelector('.svc-title').value.trim();s.text=c.querySelector('.svc-text').value.trim();S.saveServices(svcs);feedback('services-feedback','Service sauvegardé.','success');};
window.deleteService=id=>{if(!confirm('Supprimer ?'))return;S.saveServices(S.services().filter(s=>s.id!==id));renderServicesEditor();};
window.addService=()=>{S.saveServices([...S.services(),{id:Date.now().toString(),icon:'✦',title:'Nouveau service',text:'Description.'}]);renderServicesEditor();};

/* ════════════════════════════════════════
   PAGES PANEL
════════════════════════════════════════ */
function initPagesPanel(){
  const pc=S.pageContent();
  Object.keys(pc).forEach(k=>{const el=document.getElementById('page-'+k);if(el)el.value=pc[k];});
  document.getElementById('btn-save-pages')?.addEventListener('click',()=>{
    const pc=S.pageContent();
    document.querySelectorAll('.page-section-editor textarea').forEach(ta=>{pc[ta.id.replace('page-','')]=ta.value;});
    S.savePageContent(pc);feedback('pages-feedback','Contenus sauvegardés.','success');
  });
}

/* ════════════════════════════════════════
   CLIENTS & TESTIMONIALS PANEL
════════════════════════════════════════ */
function initClientsPanel(){
  renderClients();renderTestimonials();renderTeam();
  document.getElementById('btn-add-client')?.addEventListener('click',addClient);
  document.getElementById('btn-add-testimonial')?.addEventListener('click',addTestimonial);
  document.getElementById('btn-add-team')?.addEventListener('click',addTeamMember);
}

function renderClients(){
  const wrap=document.getElementById('clients-editor');if(!wrap)return;
  wrap.innerHTML=S.clients().map(c=>`<div class="testimonial-edit" data-id="${c.id}"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">${c.logo?`<img src="${c.logo}" style="height:36px;object-fit:contain;background:#0a0a0a;padding:4px;border:1px solid #2a2a2a">`:'<div style="width:40px;height:36px;background:#1a1a1a;border:1px solid #2a2a2a"></div>'}<span style="font-size:13px;color:#aaa">${c.name||'Sans nom'}</span></div><div class="admin-form-grid"><div class="admin-form-group"><label>Nom client</label><input type="text" class="cl-name" value="${c.name||''}"></div><div class="admin-form-group"><label>Logo (depuis l'appareil)</label><div class="img-upload-wrap" id="client-img-${c.id}"><img class="img-thumb-preview ${c.logo?'loaded':''}" src="${c.logo||''}" style="width:60px;height:40px;object-fit:contain"><div class="img-upload-actions"><label class="btn-upload-file">📁 Importer logo<input type="file" accept="image/*" style="display:none"></label>${c.logo?'<button class="btn-remove-img" onclick="removeClientLogo(\''+c.id+'\',this)">✕ Retirer</button>':''}</div></div></div></div><div style="display:flex;gap:8px;margin-top:8px"><button class="admin-btn ghost sm" onclick="saveClient('${c.id}',this)">Sauvegarder</button><button class="admin-btn danger sm" onclick="deleteClient('${c.id}')">Supprimer</button></div></div>`).join('');
  // File handlers for each client
  S.clients().forEach(c=>{
    const wrap2=document.getElementById('client-img-'+c.id);if(!wrap2)return;
    const fileInp=wrap2.querySelector('input[type=file]');
    const thumb=wrap2.querySelector('.img-thumb-preview');
    fileInp?.addEventListener('change',()=>{
      const f=fileInp.files[0];if(!f)return;
      const r=new FileReader();r.onload=async e=>{const c=await compressImage(e.target.result,800,0.85);if(thumb){thumb.src=c;thumb.classList.add('loaded');}};r.readAsDataURL(f);
    });
  });
}

window.saveClient=(id,btn)=>{
  const c=btn.closest('[data-id]');const clients=S.clients();const cl=clients.find(x=>x.id===id);if(!cl)return;
  cl.name=c.querySelector('.cl-name').value.trim();
  const thumb=c.querySelector('.img-thumb-preview');
  if(thumb?.src&&thumb.src!==location.href)cl.logo=thumb.src;
  S.saveClients(clients);feedback('clients-feedback','Client sauvegardé.','success');
};
window.removeClientLogo=(id,btn)=>{const c=btn.closest('[data-id]');const thumb=c.querySelector('.img-thumb-preview');if(thumb){thumb.src='';thumb.classList.remove('loaded');}};
window.deleteClient=id=>{S.saveClients(S.clients().filter(c=>c.id!==id));renderClients();};
window.addClient=()=>{S.saveClients([...S.clients(),{id:Date.now().toString(),name:'Nouveau client',logo:''}]);renderClients();};

function renderTestimonials(){
  const wrap=document.getElementById('testimonials-editor');if(!wrap)return;
  wrap.innerHTML=S.testimonials().map(t=>`<div class="testimonial-edit" data-id="${t.id}"><div class="admin-form-grid"><div class="admin-form-group"><label>Nom</label><input type="text" class="tm-name" value="${t.name||''}"></div><div class="admin-form-group"><label>Rôle</label><input type="text" class="tm-role" value="${t.role||''}"></div><div class="admin-form-group"><label>Entreprise</label><input type="text" class="tm-company" value="${t.company||''}"></div><div class="admin-form-group"><label>Étoiles (1-5)</label><input type="number" class="tm-stars" value="${t.stars||5}" min="1" max="5"></div><div class="admin-form-group"><label>Lien LinkedIn</label><input type="url" class="tm-linkedin" value="${t.linkedIn||''}"></div><div class="admin-form-group"><label>Photo (depuis appareil)</label><div class="img-upload-wrap"><img class="img-thumb-preview tm-photo-preview ${t.photo?'loaded':''}" src="${t.photo||''}"><div class="img-upload-actions"><label class="btn-upload-file">📁 Photo<input type="file" accept="image/*" style="display:none" class="tm-photo-file"></label></div></div></div></div><div class="admin-form-group"><label>Témoignage</label><textarea class="tm-text" rows="3">${t.text||''}</textarea></div><div style="display:flex;gap:8px;margin-top:10px"><button class="admin-btn ghost sm" onclick="saveTestimonial('${t.id}',this)">Sauvegarder</button><button class="admin-btn danger sm" onclick="deleteTestimonial('${t.id}')">Supprimer</button></div></div>`).join('');
  wrap.querySelectorAll('.tm-photo-file').forEach(inp=>{
    const thumb=inp.closest('.img-upload-wrap').querySelector('.tm-photo-preview');
    inp.addEventListener('change',()=>{const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{if(thumb){thumb.src=e.target.result;thumb.classList.add('loaded');}};r.readAsDataURL(f);});
  });
}
window.saveTestimonial=(id,btn)=>{const c=btn.closest('[data-id]');const tms=S.testimonials();const t=tms.find(x=>x.id===id);if(!t)return;t.name=c.querySelector('.tm-name').value.trim();t.role=c.querySelector('.tm-role').value.trim();t.company=c.querySelector('.tm-company').value.trim();t.stars=parseInt(c.querySelector('.tm-stars').value)||5;t.linkedIn=c.querySelector('.tm-linkedin').value.trim();t.text=c.querySelector('.tm-text').value.trim();const ph=c.querySelector('.tm-photo-preview');if(ph?.src&&ph.src!==location.href)t.photo=ph.src;S.saveTestimonials(tms);feedback('clients-feedback','Témoignage sauvegardé.','success');};
window.deleteTestimonial=id=>{S.saveTestimonials(S.testimonials().filter(t=>t.id!==id));renderTestimonials();};
window.addTestimonial=()=>{S.saveTestimonials([...S.testimonials(),{id:Date.now().toString(),name:'',role:'',company:'',stars:5,text:'',photo:'',linkedIn:''}]);renderTestimonials();};

function renderTeam(){
  const wrap=document.getElementById('team-editor');if(!wrap)return;
  wrap.innerHTML=S.team().map(m=>`<div class="testimonial-edit" data-id="${m.id}"><div class="admin-form-grid"><div class="admin-form-group"><label>Nom complet</label><input type="text" class="tm-name" value="${m.name||''}"></div><div class="admin-form-group"><label>Rôle / Poste</label><input type="text" class="tm-role" value="${m.role||''}"></div><div class="admin-form-group"><label>Photo (carrée — rognage auto)</label><div class="img-upload-wrap"><img class="img-thumb-preview tm-photo-preview ${m.photo?'loaded':''}" src="${m.photo||''}" style="width:80px;height:80px;object-fit:cover;border-radius:4px"><div class="img-upload-actions"><label class="btn-upload-file">📁 Importer & rogner<input type="file" accept="image/*" style="display:none" class="tm-photo-file"></label></div></div></div><div class="admin-form-group"><label>LinkedIn</label><input type="url" class="tm-linkedin" value="${m.social?.linkedin||''}"></div></div><div class="admin-form-group"><label>Biographie</label><textarea class="tm-bio" rows="4">${m.bio||''}</textarea></div><div class="admin-form-group"><label>Certifications (virgule)</label><input type="text" class="tm-certs" value="${(m.certs||[]).join(', ')}"></div><div style="display:flex;gap:8px;margin-top:10px"><button class="admin-btn ghost sm" onclick="saveTeamMember('${m.id}',this)">Sauvegarder</button><button class="admin-btn danger sm" onclick="deleteTeamMember('${m.id}')">Supprimer</button></div></div>`).join('');
  // File handlers with crop
  wrap.querySelectorAll('.tm-photo-file').forEach(inp => {
    const thumb = inp.closest('.img-upload-wrap').querySelector('.tm-photo-preview');
    inp.addEventListener('change', () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = e => openCropModal(e.target.result, async croppedData => {
        // Compresser avant stockage
        const compressed = await compressImage(croppedData, 800, 0.72);
        if (thumb) { thumb.src = compressed; thumb.classList.add('loaded'); }
      });
      r.readAsDataURL(f);
    });
  });
}
window.saveTeamMember = async (id, btn) => {
  const c = btn.closest('[data-id]');
  const team = S.team();
  const m = team.find(x => x.id === id);
  if (!m) return;
  m.name  = c.querySelector('.tm-name').value.trim();
  m.role  = c.querySelector('.tm-role').value.trim();
  m.bio   = c.querySelector('.tm-bio').value.trim();
  m.certs = c.querySelector('.tm-certs').value.split(',').map(x=>x.trim()).filter(Boolean);
  if (!m.social) m.social = {};
  m.social.linkedin = c.querySelector('.tm-linkedin').value.trim();

  const ph = c.querySelector('.tm-photo-preview');
  if (ph?.src && ph.src !== location.href && ph.src.startsWith('data:')) {
    // Tenter upload Firebase Storage — sinon garder base64
    try {
      const FB = await (window._fbReady || Promise.resolve(null));
      if (FB && FB.uploadImage) {
        btn.textContent = 'Upload…';
        btn.disabled = true;
        const url = await FB.uploadImage(`team/${id}_${Date.now()}.jpg`, ph.src);
        m.photo = url;
      } else {
        m.photo = ph.src; // fallback base64
      }
    } catch (e) {
      console.warn('Storage upload failed, using base64:', e);
      m.photo = ph.src;
    } finally {
      btn.textContent = 'Sauvegarder';
      btn.disabled = false;
    }
  } else if (ph?.src && ph.src !== location.href) {
    m.photo = ph.src; // déjà une URL Storage ou externe
  }

  S.saveTeam(team);
  feedback('clients-feedback', 'Membre sauvegardé.', 'success');
};
window.deleteTeamMember=id=>{if(!confirm('Supprimer ?'))return;S.saveTeam(S.team().filter(m=>m.id!==id));renderTeam();};
window.addTeamMember=()=>{S.saveTeam([...S.team(),{id:Date.now().toString(),name:'',role:'',bio:'',photo:'',certs:[],social:{}}]);renderTeam();};

/* ════════════════════════════════════════
   MESSAGES PANEL
════════════════════════════════════════ */
function initMessagesPanel(){renderMessages();}
function renderMessages(){
  const wrap=document.getElementById('messages-list');if(!wrap)return;
  const msgs=S.messages();
  const unread=msgs.filter(m=>!m.read).length;
  const badge=document.getElementById('messages-count');if(badge)badge.textContent=unread?`(${unread} non lu${unread>1?'s':''})`:' ';
  if(!msgs.length){wrap.innerHTML='<div class="empty-state"><span class="empty-icon">✉️</span>Aucun message reçu.</div>';return;}
  wrap.innerHTML=msgs.map(m=>`<div class="msg-row ${m.read?'':'unread'}" onclick="openMessage('${m.id}')"><div class="msg-dot ${m.read?'read':''}"></div><div class="msg-info"><div class="msg-from">${m.name} — ${m.email}</div><div class="msg-subject">${(m.message||'').slice(0,70)}…</div></div><div class="msg-time">${fmtDateTime(m.timestamp)}</div></div>`).join('');
}
window.openMessage=id=>{
  const msgs=S.messages();const m=msgs.find(x=>x.id===id);if(!m)return;
  m.read=true;S.saveMessages(msgs);renderMessages();
  const det=document.getElementById('message-detail');if(!det)return;
  det.innerHTML=`<div class="msg-detail open"><div class="msg-detail-name">${m.name}</div><div class="msg-detail-meta">📧 ${m.email}${m.phone?' · 📱 '+m.phone:''} · ${fmtDateTime(m.timestamp)}</div><div class="msg-detail-body">${m.message}</div><div class="msg-detail-actions"><a href="mailto:${m.email}?subject=Re: Class S" class="admin-btn auto" target="_blank">↩ Répondre</a>${m.phone?`<a href="https://wa.me/${m.phone.replace(/\D/g,'')}" class="admin-btn ghost" target="_blank">💬 WhatsApp</a>`:''}<button class="admin-btn danger sm" onclick="deleteMessage('${m.id}')">Supprimer</button></div></div>`;
};
window.deleteMessage=id=>{if(!confirm('Supprimer ?'))return;S.saveMessages(S.messages().filter(m=>m.id!==id));document.getElementById('message-detail').innerHTML='';renderMessages();};
window.exportMessages=period=>{
  let msgs=S.messages();const now=new Date();
  if(period==='week'){const w=new Date(now-7*864e5);msgs=msgs.filter(m=>new Date(m.timestamp)>=w);}
  else if(period==='month'){const mo=new Date(now-30*864e5);msgs=msgs.filter(m=>new Date(m.timestamp)>=mo);}
  const rows=[['Date','Nom','Email','Téléphone','Message'],...msgs.map(m=>[fmtDateTime(m.timestamp),m.name,m.email,m.phone||'',(m.message||'').replace(/,/g,' ')])];
  const csv=rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=`messages-${period||'all'}-${now.toISOString().split('T')[0]}.csv`;a.click();URL.revokeObjectURL(a.href);
};

/* ════════════════════════════════════════
   MEDIA PANEL
════════════════════════════════════════ */
function initMediaPanel(){
  // Favicon
  const favInp=document.getElementById('favicon-upload');
  const favPrev=document.getElementById('favicon-preview');
  const storedFav=localStorage.getItem('cs_favicon');
  if(storedFav&&favPrev){favPrev.src=storedFav;favPrev.classList.add('loaded');}
  favInp?.addEventListener('change',()=>{
    const f=favInp.files[0];if(!f)return;
    const r=new FileReader();r.onload=e=>{localStorage.setItem('cs_favicon',e.target.result);if(favPrev){favPrev.src=e.target.result;favPrev.classList.add('loaded');}feedback('media-feedback','Favicon mis à jour.','success');};r.readAsDataURL(f);
  });

  // Logo
  const logoInp=document.getElementById('logo-upload');
  const logoPrev=document.getElementById('logo-preview');
  const storedLogo=localStorage.getItem('cs_logo');
  if(storedLogo&&logoPrev){logoPrev.src=storedLogo;logoPrev.classList.add('loaded');}
  logoInp?.addEventListener('change',()=>{
    const f=logoInp.files[0];if(!f)return;
    const r=new FileReader();r.onload=e=>{localStorage.setItem('cs_logo',e.target.result);if(logoPrev){logoPrev.src=e.target.result;logoPrev.classList.add('loaded');}feedback('media-feedback','Logo mis à jour. Rechargez les pages du site pour voir le changement.','success');};r.readAsDataURL(f);
  });

  // Remove logo
  document.getElementById('btn-remove-logo')?.addEventListener('click',()=>{localStorage.removeItem('cs_logo');if(logoPrev){logoPrev.src='';logoPrev.classList.remove('loaded');}feedback('media-feedback','Logo supprimé. Le texte "Class S" sera affiché.','success');});

  // Brochure
  const brochInp=document.getElementById('brochure-upload');
  const brochName=document.getElementById('brochure-name');
  const storedBrochName=localStorage.getItem('cs_brochure_name');
  if(storedBrochName&&brochName){brochName.textContent=storedBrochName;brochName.classList.add('loaded');}
  brochInp?.addEventListener('change',()=>{
    const f=brochInp.files[0];if(!f)return;
    const r=new FileReader();r.onload=e=>{localStorage.setItem('cs_brochure',e.target.result);localStorage.setItem('cs_brochure_name',f.name);if(brochName){brochName.textContent=f.name;brochName.classList.add('loaded');}feedback('media-feedback','Dépliant mis à jour.','success');};r.readAsDataURL(f);
  });
}

/* ════════════════════════════════════════
   FOOTER PANEL
════════════════════════════════════════ */
function initFooterPanel(){
  const fd=S.footer();
  const bl=document.getElementById('footer-baseline-input');if(bl)bl.value=fd.baseline||'';
  const cp=document.getElementById('footer-copy-input');if(cp)cp.value=fd.copy||'';
  renderFooterLinks();
  document.getElementById('btn-save-footer')?.addEventListener('click',()=>{const fd=S.footer();fd.baseline=document.getElementById('footer-baseline-input').value;fd.copy=document.getElementById('footer-copy-input').value;S.saveFooter(fd);feedback('footer-feedback','Footer sauvegardé.','success');});
  document.getElementById('btn-add-footer-link')?.addEventListener('click',addFooterLink);
}
function renderFooterLinks(){
  const wrap=document.getElementById('footer-links-editor');if(!wrap)return;
  const links=S.footer().columns?.[0]?.links||[];
  wrap.innerHTML=links.map((l,i)=>`<div class="footer-link-row" data-idx="${i}"><span class="drag-handle">⠿</span><input type="text" placeholder="Icône" value="${l.icon||''}" style="width:50px" class="fl-icon"><input type="text" placeholder="Label" value="${l.label||''}" class="fl-label"><input type="text" placeholder="URL" value="${l.url||''}" class="fl-url"><button class="admin-btn danger sm" onclick="removeFooterLink(${i})">✕</button></div>`).join('');
}
window.addFooterLink=()=>{const fd=S.footer();if(!fd.columns)fd.columns=[{type:'links',links:[]}];if(!fd.columns[0])fd.columns[0]={type:'links',links:[]};fd.columns[0].links.push({icon:'',label:'Nouveau lien',url:'#'});S.saveFooter(fd);renderFooterLinks();};
window.removeFooterLink=idx=>{const fd=S.footer();fd.columns?.[0]?.links?.splice(idx,1);S.saveFooter(fd);renderFooterLinks();};
window.saveFooterLinks=()=>{const fd=S.footer();const rows=document.querySelectorAll('.footer-link-row');const links=[];rows.forEach(r=>{links.push({icon:r.querySelector('.fl-icon').value,label:r.querySelector('.fl-label').value,url:r.querySelector('.fl-url').value});});if(!fd.columns)fd.columns=[{type:'links',links:[]}];fd.columns[0]={type:'links',links};S.saveFooter(fd);feedback('footer-feedback','Liens sauvegardés.','success');};

/* ════════════════════════════════════════
   ANALYTICS PANEL — General + By Page + By Visitor
════════════════════════════════════════ */
function initAnalyticsPanel(){
  const d=window.CS_Analytics?.getData()||{};
  const clicks=window.CS_Analytics?.getClicks()||{};
  const daily=d.daily||{};

  // General stats
  setEl('stat-total-views',d.totalViews||0);
  setEl('stat-unique-sessions',d.uniqueSessions||0);
  const avgDur=d.avgDuration?.length?Math.round(d.avgDuration.reduce((a,b)=>a+b,0)/d.avgDuration.length):0;
  setEl('stat-avg-duration',avgDur>60?Math.floor(avgDur/60)+'m '+avgDur%60+'s':avgDur+'s');
  const allVisitors=new Set(Object.values(daily).flatMap(day=>day.visitors||[]));
  setEl('stat-unique-visitors',allVisitors.size);

  // Devices
  const dev=d.devices||{desktop:0,mobile:0,tablet:0};
  const devTotal=dev.desktop+dev.mobile+dev.tablet||1;
  setEl('stat-desktop-pct',Math.round(dev.desktop/devTotal*100)+'%');
  setEl('stat-mobile-pct',Math.round(dev.mobile/devTotal*100)+'%');
  setEl('stat-tablet-pct',Math.round(dev.tablet/devTotal*100)+'%');

  // Pages breakdown
  const pagesWrap=document.getElementById('analytics-pages');
  if(pagesWrap&&d.pages){
    const sorted=Object.entries(d.pages).sort(([,a],[,b])=>b-a);
    const max=sorted[0]?.[1]||1;
    pagesWrap.innerHTML=sorted.map(([name,count])=>`<div class="page-row"><span class="page-name">${name}</span><div class="page-bar-wrap"><div class="page-bar" style="width:${(count/max*100).toFixed(0)}%"></div></div><span class="page-count">${count}</span></div>`).join('');
  }

  // Clicks
  const clicksWrap=document.getElementById('analytics-clicks');
  if(clicksWrap){
    const sorted=Object.entries(clicks).sort(([,a],[,b])=>b-a).slice(0,12);
    clicksWrap.innerHTML=sorted.length?sorted.map(([name,count])=>`<div class="click-row"><span class="click-name" title="${name}">${name}</span><span class="click-count">${count}</span></div>`).join(''):'<p style="color:#555;font-size:13px">Aucun clic enregistré.</p>';
  }

  // Daily chart (last 14 days)
  const dailyWrap=document.getElementById('analytics-daily');
  if(dailyWrap){
    const dates=Object.keys(daily).sort().slice(-14);
    const maxViews=Math.max(...dates.map(d=>daily[d]?.views||0),1);
    dailyWrap.innerHTML=`<div style="display:flex;align-items:flex-end;gap:6px;height:80px">${dates.map(date=>{
      const views=daily[date]?.views||0;const h=Math.round((views/maxViews)*80);
      return`<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1"><div style="background:var(--ap);width:100%;height:${h}px;border-radius:2px 2px 0 0;min-height:2px" title="${date}: ${views} vue(s)"></div><span style="font-size:9px;color:#444;transform:rotate(-45deg);white-space:nowrap">${date.slice(5)}</span></div>`;
    }).join('')}</div>`;
  }

  // Visitors table (by visitor ID)
  const visitorsWrap=document.getElementById('analytics-visitors');
  if(visitorsWrap){
    // Build per-visitor data
    const visitorMap={};
    Object.entries(daily).forEach(([date,day])=>{
      (day.visitors||[]).forEach(vid=>{
        if(!visitorMap[vid])visitorMap[vid]={id:vid,days:[],views:0};
        visitorMap[vid].days.push(date);
      });
      // views per visitor not tracked individually — show sessions per visitor
    });
    // Total views per visitor not precisely tracked, show session count
    const visitorList=Object.values(visitorMap).sort((a,b)=>b.days.length-a.days.length).slice(0,20);
    if(visitorList.length){
      visitorsWrap.innerHTML=`<table class="visitor-table"><thead><tr><th>ID Visiteur</th><th>Sessions</th><th>Première visite</th><th>Dernière visite</th></tr></thead><tbody>${visitorList.map(v=>`<tr><td class="visitor-id-cell" title="${v.id}">${v.id.slice(0,12)}…</td><td style="color:var(--ap)">${v.days.length}</td><td style="color:#666">${v.days[0]||'—'}</td><td style="color:#666">${v.days[v.days.length-1]||'—'}</td></tr>`).join('')}</tbody></table>`;
    } else {
      visitorsWrap.innerHTML='<p style="color:#555;font-size:13px">Aucun visiteur enregistré.</p>';
    }
  }

  // Referrers
  const refWrap=document.getElementById('analytics-referrers');
  if(refWrap&&d.referrers){
    const sorted=Object.entries(d.referrers).sort(([,a],[,b])=>b-a).slice(0,8);
    refWrap.innerHTML=sorted.length?sorted.map(([ref,count])=>`<div class="click-row"><span class="click-name">${ref}</span><span class="click-count">${count}</span></div>`).join(''):'<p style="color:#555;font-size:13px">Aucune source externe.</p>';
  }

  document.getElementById('btn-export-analytics')?.addEventListener('click',()=>window.CS_Analytics?.exportCSV());
  document.getElementById('btn-reset-analytics')?.addEventListener('click',()=>{if(!confirm('Réinitialiser toutes les statistiques ?'))return;window.CS_Analytics?.reset();location.reload();});
}

function setEl(id,val){const e=document.getElementById(id);if(e)e.textContent=val;}

/* ════════════════════════════════════════
   SETTINGS PANEL
════════════════════════════════════════ */
function initSettingsPanel(){
  document.getElementById('btn-export')?.addEventListener('click',exportData);
  document.getElementById('import-file')?.addEventListener('change',e=>importData(e.target.files[0]));
  const cfg=S.get('cs_emailjs_config',null);
  if(cfg){const p=document.getElementById('ej-public-key');const s=document.getElementById('ej-service-id');const t=document.getElementById('ej-template-id');if(p)p.value=cfg.publicKey||'';if(s)s.value=cfg.serviceId||'';if(t)t.value=cfg.templateId||'';}
  document.getElementById('btn-save-emailjs')?.addEventListener('click',()=>{S.set('cs_emailjs_config',{publicKey:document.getElementById('ej-public-key')?.value,serviceId:document.getElementById('ej-service-id')?.value,templateId:document.getElementById('ej-template-id')?.value});feedback('settings-feedback','Configuration EmailJS sauvegardée.','success');});
}

function exportData(){
  const data={posts:S.posts(),projects:S.projects(),services:S.services(),clients:S.clients(),testimonials:S.testimonials(),team:S.team(),footer:S.footer(),pageContent:S.pageContent(),exportDate:new Date().toISOString()};
  const d=new Date();const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  a.download=`cs-backup-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
  a.click();URL.revokeObjectURL(a.href);feedback('settings-feedback','Export réussi.','success');
}

function importData(file){
  if(!file)return;
  const r=new FileReader();
  r.onload=e=>{try{const d=JSON.parse(e.target.result);if(!d.posts||!d.projects)throw new Error();if(!confirm(`Importer ${d.posts.length} articles et ${d.projects.length} projets ?`))return;if(d.posts)S.savePosts(d.posts);if(d.projects)S.saveProjects(d.projects);if(d.services)S.saveServices(d.services);if(d.clients)S.saveClients(d.clients);if(d.testimonials)S.saveTestimonials(d.testimonials);if(d.team)S.saveTeam(d.team);if(d.footer)S.saveFooter(d.footer);if(d.pageContent)S.savePageContent(d.pageContent);feedback('settings-feedback',`Import réussi. ${d.posts.length} articles, ${d.projects.length} projets.`,'success');}catch{feedback('settings-feedback','Fichier invalide ou corrompu.','error');}};
  r.readAsText(file);
}

/* ════════════════════════════════════════
   USERS PANEL
════════════════════════════════════════ */
function initUsersPanel(){
  if(currentUser?.type!=='headmaster')return;
  renderUsers();
  document.getElementById('btn-new-user')?.addEventListener('click',()=>openUserForm(null));
  document.getElementById('user-form')?.addEventListener('submit',e=>{e.preventDefault();saveUser();});
  document.getElementById('btn-cancel-user')?.addEventListener('click',closeUserForm);
}
function renderUsers(){
  const wrap=document.getElementById('users-list');if(!wrap)return;
  const admins=S.admins();
  if(!admins.length){wrap.innerHTML='<div class="empty-state"><span class="empty-icon">👤</span>Aucun sous-administrateur.</div>';return;}
  wrap.innerHTML=admins.map(a=>`<div class="user-card"><div class="user-avatar">${a.username.slice(0,1).toUpperCase()}</div><div class="user-info"><div class="user-name">${a.username}</div><div class="user-role">Accès : ${(a.perms||[]).join(', ')||'Aucun'}</div>${a.expiry?`<div class="user-expiry">Expire le ${fmtDate(a.expiry)}</div>`:''}<span class="badge ${a.active?'badge-ok':'badge-err'}">${a.active?'Actif':'Désactivé'}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="admin-btn ghost sm" onclick="editUser('${a.id}')">Modifier</button><button class="admin-btn ghost sm" onclick="toggleUser('${a.id}')">${a.active?'Désactiver':'Activer'}</button><button class="admin-btn danger sm" onclick="deleteUser('${a.id}')">Supprimer</button></div></div>`).join('');
}
function openUserForm(user){
  const wrap=document.getElementById('user-form-wrap');if(!wrap)return;
  wrap.style.display='block';
  document.getElementById('u-username').value=user?.username||'';
  document.getElementById('u-password').value='';
  document.getElementById('u-expiry').value=user?.expiry||'';
  document.getElementById('u-active').checked=user?.active!==false;
  ALL_PERMS.filter(p=>p!=='users').forEach(p=>{const cb=document.getElementById('perm-'+p);if(cb)cb.checked=(user?.perms||[]).includes(p);});
  editingUserId=user?.id||null;
  wrap.scrollIntoView({behavior:'smooth'});
}
function closeUserForm(){document.getElementById('user-form-wrap').style.display='none';editingUserId=null;}
async function saveUser(){
  const username=document.getElementById('u-username').value.trim();
  const password=document.getElementById('u-password').value;
  if(!username){alert('Identifiant requis.');return;}
  const admins=S.admins();
  const perms=ALL_PERMS.filter(p=>p!=='users'&&document.getElementById('perm-'+p)?.checked);
  const user={id:editingUserId||Date.now().toString(),username,passwordHash:password?await sha256(password):(admins.find(a=>a.id===editingUserId)?.passwordHash||''),perms,expiry:document.getElementById('u-expiry').value||null,active:document.getElementById('u-active').checked,createdAt:new Date().toISOString()};
  if(editingUserId){const i=admins.findIndex(a=>a.id===editingUserId);if(i>=0)admins[i]=user;else admins.push(user);}else admins.push(user);
  S.saveAdmins(admins);closeUserForm();renderUsers();feedback('users-feedback','Utilisateur sauvegardé.','success');
}
window.editUser=id=>{editingUserId=id;openUserForm(S.admins().find(a=>a.id===id));};
window.deleteUser=id=>{if(!confirm('Supprimer ?'))return;S.saveAdmins(S.admins().filter(a=>a.id!==id));renderUsers();};
window.toggleUser=id=>{const admins=S.admins();const a=admins.find(x=>x.id===id);if(a)a.active=!a.active;S.saveAdmins(admins);renderUsers();};

/* ════════════════════════════════════════
   UTILITIES
════════════════════════════════════════ */
function feedback(id,msg,type='success'){const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.className='feedback-msg '+type;el.style.display='block';setTimeout(()=>el.style.display='none',5000);}
function stripHtml(h){const d=document.createElement('div');d.innerHTML=h;return d.textContent||'';}
function fmtDate(iso){if(!iso)return'';return new Date(iso).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'});}
function fmtDateTime(iso){if(!iso)return'';const d=new Date(iso);return d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'})+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});}
function fmtDateFr(iso){if(!iso)return'';const m=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];const d=new Date(iso+'T12:00:00');return`${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;}
function dateToInput(str){const m={'janvier':'01','février':'02','mars':'03','avril':'04','mai':'05','juin':'06','juillet':'07','août':'08','septembre':'09','octobre':'10','novembre':'11','décembre':'12'};const p=str.split(' ');if(p.length===3)return`${p[2]}-${m[p[1]?.toLowerCase()]||'01'}-${p[0].padStart(2,'0')}`;return'';}
function debounce(fn,d){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),d);};}
function switchTab(gId,tId,btn){const g=document.getElementById(gId)?.parentElement||document;g.querySelectorAll('.inner-tab').forEach(t=>t.classList.remove('active'));g.querySelectorAll('.inner-tab-panel').forEach(p=>p.classList.remove('active'));btn.classList.add('active');document.getElementById(tId)?.classList.add('active');}
window.switchTab=switchTab;
