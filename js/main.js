/* ============ js/main.js — Class S v3 ============ */
'use strict';

/* ══ DEFAULT DATA (identical to v2) ══ */
function getDefaultPosts(){return[]}
function getDefaultProjects(){return[]}
function getDefaultServices(){return[{id:'s1',icon:'✦',title:'Identité Visuelle',text:"Logo, charte graphique, typographie, couleurs. Tout ce qui fait qu'on vous reconnaît — même sans lire votre nom."},{id:'s2',icon:'◈',title:'Direction Artistique',text:"Nous pilotons l'esthétique globale de vos campagnes, shootings et contenus digitaux pour qu'ils forment un tout cohérent."},{id:'s3',icon:'◎',title:'Design Éditorial',text:"Affiches, brochures, rapports, supports print et digital. Des pièces qui ont du poids — dans les mains et dans les esprits."}]}
function getDefaultClients(){return[]}
function getDefaultTestimonials(){return[]}
function getDefaultTeam(){return[{id:'scott',name:'Scott Nana',role:'CEO & Brand Designer',bio:"Fondateur de Class S, Scott est un passionné du design visuel et du branding. Convaincu que l'excellence visuelle est le premier levier de crédibilité d'une marque, il a créé Class S pour répondre à un manque criant qu'il observait chaque jour dans les rues de Ouagadougou.",photo:'',certs:['Brand Strategy','Graphic Design','Art Direction'],social:{linkedin:'',behance:'https://www.behance.net/wendclass'}}]}
function getDefaultFooter(){return{baseline:"L'identité visuelle qui s'impose.",columns:[{type:'links',links:[{icon:'',label:'Accueil',url:'index.html'},{icon:'',label:'Projets',url:'works.html'},{icon:'',label:'Services',url:'services.html'},{icon:'',label:'Blog',url:'blog.html'},{icon:'',label:'Contact',url:'contact.html'},{icon:'',label:'À propos',url:'about.html'}]}],copy:'© 2025 Class S — Ouagadougou, Burkina Faso'}}
function getDefaultPageContent(){return{hero_title:"L'identité visuelle\nqui vous impose.",hero_sub:"Nous construisons des marques que l'on reconnaît au premier regard.",manifeste_quote:'"Nous ne faisons pas du design.\nNous fabriquons de la présence."',manifeste_body:"Class S est née d'une conviction : en Afrique de l'Ouest, les marques qui durent sont celles qui ont une âme visuelle.",cta_title:"Votre prochaine identité visuelle commence ici.",cta_sub:"Pas de template. Pas de copier-coller. Juste du travail qui vous ressemble.",about_story:"",services_page_sub:"Nous intervenons à chaque étape de construction de votre identité — avec rigueur, audace et intention."}}

function renderBlogCard(post){
  const bg=post.cover?`<img class="blog-card-cover" src="${post.cover}" alt="${post.title}" loading="lazy" onerror="this.style.background='${post.coverGradient||'linear-gradient(135deg,#6600CC,#0A0A0A)'}';this.removeAttribute('src')">`:`<div class="blog-card-cover" style="background:${post.coverGradient||'linear-gradient(135deg,#6600CC,#0A0A0A)'}"></div>`;
  return`<article class="blog-card">${bg}<div class="blog-card-body"><span class="blog-card-category">${post.category}</span><h3 class="blog-card-title">${post.title}</h3><p class="blog-card-date">${post.date}${post.time?' · '+post.time:''}</p><p class="blog-card-excerpt">${post.excerpt}</p><a href="article.html?id=${post.id}" class="cta-arrow" data-track="Lire - ${post.title}">Lire l'article <span class="arrow">→</span></a></div></article>`;
}

window.ClassS={getDefaultPosts,getDefaultProjects,getDefaultServices,getDefaultClients,getDefaultTestimonials,getDefaultTeam,getDefaultFooter,getDefaultPageContent,renderBlogCard};

/* ══ FAVICON ══ */
(function(){const f=localStorage.getItem('cs_favicon');if(!f)return;let l=document.getElementById('favicon');if(!l){l=document.createElement('link');l.id='favicon';l.rel='icon';document.head.appendChild(l);}l.href=f;})();

/* ══ LOGO — applies to navbar + footer, hides text when image loaded ══ */
function applyLogo(overrideLogo){
  // Logo statique dans assets/img/logo.svg — pas de chargement dynamique nécessaire
  return;
  // Legacy code ci-dessous désactivé
  const logo=overrideLogo||localStorage.getItem('cs_logo')||null;
  document.querySelectorAll('.navbar-logo, .footer-logo').forEach(el=>{
    const img=el.querySelector('.logo-img');
    const txt=el.querySelector('.logo-text');
    if(logo&&img){img.src=logo;img.classList.add('loaded');if(txt)txt.style.display='none';}
    else if(img){img.classList.remove('loaded');if(txt)txt.style.display='';}
  });
  // Sidebar in admin
  const sImg=document.querySelector('.sidebar-logo-img');
  const sTxt=document.querySelector('.sidebar-logo-text');
  if(logo&&sImg){sImg.src=logo;sImg.classList.add('loaded');if(sTxt)sTxt.style.display='none';}
}
applyLogo();

/* ══ INTRO ANIMATION ══ */
(function(){
  const overlay=document.getElementById('intro-overlay');
  if(!overlay)return;
  if(sessionStorage.getItem('cs_intro_done')){overlay.style.display='none';return;}
  // Show logo image if available, else text
  const logo=localStorage.getItem('cs_logo')||null;
  const logoEl=overlay.querySelector('.intro-logo');
  if(logo&&logoEl){
    const imgEl=logoEl.querySelector('.intro-logo-img');
    const txtEl=logoEl.querySelector('.intro-logo-text');
    if(imgEl){imgEl.src=logo;imgEl.style.display='block';}
    if(txtEl)txtEl.style.display='none';
  }
  setTimeout(()=>{
    overlay.classList.add('done');
    sessionStorage.setItem('cs_intro_done','1');
    setTimeout(()=>overlay.style.display='none',700);
  },3200);
})();

/* ══ ADMIN ACCESS — 7 clicks on logo ══ */
(function(){
  let count=0,timer=null;
  const HASH='97c71b7f372d1c03bd0a375051a5306ee5a54cc773bb05af7aa0cb31d3f60492';
  const reset=()=>{count=0;if(timer)clearTimeout(timer);timer=null;};
  async function sha256(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}
  function showModal(){const m=document.getElementById('admin-modal');if(m){m.classList.add('open');setTimeout(()=>m.querySelector('input[type=password]')?.focus(),100);}}
  function hideModal(){const m=document.getElementById('admin-modal');if(m)m.classList.remove('open');const i=document.getElementById('admin-modal-input');if(i){i.value='';i.classList.remove('err');}const e=document.getElementById('admin-modal-err');if(e)e.style.display='none';}
  async function tryLogin(){
    const inp=document.getElementById('admin-modal-input');
    const err=document.getElementById('admin-modal-err');
    if(!inp)return;
    const hash=await sha256(inp.value);
    if(hash===HASH){
      sessionStorage.setItem('cs_auth_user',JSON.stringify({type:'headmaster',username:'Headmaster',perms:['articles','projects','services','pages','clients','messages','media','footer','analytics','users','settings']}));
      window.location.href='sx9kp-admin.html';
    } else {
      inp.value='';inp.classList.add('err');
      setTimeout(()=>inp.classList.remove('err'),500);
      if(err){err.textContent='Mot de passe incorrect.';err.style.display='block';}
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.navbar-logo,.footer-logo').forEach(el=>{
      el.addEventListener('click',e=>{
        e.preventDefault();count++;
        if(timer)clearTimeout(timer);
        timer=setTimeout(reset,2500);
        if(count>=7){reset();showModal();}
      });
    });
    document.getElementById('admin-modal-close')?.addEventListener('click',hideModal);
    document.getElementById('admin-modal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)hideModal();});
    document.getElementById('admin-modal-submit')?.addEventListener('click',tryLogin);
    document.getElementById('admin-modal-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')tryLogin();});
  });
})();

/* ══ CURSOR ══ */
(function(){
  if(!window.matchMedia('(pointer:fine)').matches)return;
  const cur=document.getElementById('cursor');if(!cur)return;
  let cx=-100,cy=-100,tx=-100,ty=-100;
  document.addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;});
  function lerp(a,b,f){return a+(b-a)*f;}
  function loop(){cx=lerp(cx,tx,.15);cy=lerp(cy,ty,.15);cur.style.left=cx+'px';cur.style.top=cy+'px';requestAnimationFrame(loop);}
  loop();
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('a,button,.work-card,.blog-card,.work-page-card,.filter-pill,.btn-download,.team-card,.cta-ghost,.cta-solid,.cta-solid-white').forEach(el=>{
      el.addEventListener('mouseenter',()=>cur.classList.add('hover'));
      el.addEventListener('mouseleave',()=>cur.classList.remove('hover'));
    });
  });
})();

/* ══ NAVBAR ══ */
(function(){
  const nav=document.querySelector('.navbar');if(!nav)return;
  const onScroll=()=>nav.classList.toggle('scrolled',scrollY>20);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  const path=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.navbar-links a').forEach(a=>{if((a.getAttribute('href')||'')===path)a.classList.add('active');});
  const ham=document.querySelector('.hamburger'),drawer=document.querySelector('.nav-drawer'),overlay=document.querySelector('.drawer-overlay'),close=document.querySelector('.drawer-close');
  const open=()=>{drawer?.classList.add('open');overlay?.classList.add('open');ham?.classList.add('open');document.body.style.overflow='hidden';};
  const shut=()=>{drawer?.classList.remove('open');overlay?.classList.remove('open');ham?.classList.remove('open');document.body.style.overflow='';};
  ham?.addEventListener('click',open);overlay?.addEventListener('click',shut);close?.addEventListener('click',shut);
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',shut));
})();

/* ══ SCROLL ANIMATIONS ══ */
(function(){
  const els=document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale');
  if(!els.length)return;
  const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -50px 0px'});
  els.forEach(el=>obs.observe(el));
})();

/* ══ HERO WORDS ══ */
document.querySelectorAll('.hero-title .word').forEach((w,i)=>{w.style.animationDelay=(.3+i*.08)+'s';});

/* ══ BACK TO TOP ══ */
(function(){
  const btn=document.getElementById('back-to-top');if(!btn)return;
  window.addEventListener('scroll',()=>btn.classList.toggle('visible',scrollY>400),{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();

/* ══ CONTENU DYNAMIQUE — chargé depuis Firestore ══
   Toutes les sections dépendantes des données sont rendues
   après le chargement Firestore (ou fallback défauts). */
(async function initDynamicContent() {
  /* 1. Charger les données */
  let posts, svcs, clients, tms, fd, pc;
  try {
    const FB = window.FB || null;
    if (FB) {
      const data = await FB.loadAll(['posts','services','clients','testimonials','footer','pageContent']);
      posts   = data.posts        || [];
      svcs    = data.services     || [];
      clients = data.clients      || [];
      tms     = data.testimonials || [];
      fd      = data.footer       || null;
      pc      = data.pageContent  || null;
    } else { throw new Error('no FB'); }
  } catch {
    posts   = [];
    svcs    = [];
    clients = [];
    tms     = [];
    fd = null; pc = null;
  }

  /* 2. Blog preview */
  const blogGrid = document.getElementById('blog-preview-grid');
  if (blogGrid) {
    blogGrid.innerHTML = posts.slice(0,3).map(renderBlogCard).join('');
    requestAnimationFrame(() => {
      blogGrid.querySelectorAll('.blog-card').forEach((card, i) => {
        card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity .5s ease,transform .5s ease';
        setTimeout(() => { card.style.opacity='1'; card.style.transform='translateY(0)'; }, i*100);
      });
    });
  }

  /* 3. Services */
  const svcGrid = document.getElementById('services-grid');
  if (svcGrid) {
    svcGrid.innerHTML = svcs.map((s,i) =>
      `<article class="service-card reveal" data-delay="${(i*.1+.1).toFixed(1)}"><span class="service-icon-wrap">${s.icon}</span><h3 class="service-title">${s.title}</h3><p class="service-text">${s.text}</p></article>`
    ).join('');
    document.querySelectorAll('.service-card').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, {threshold:.12, rootMargin:'0px 0px -50px 0px'});
      obs.observe(el);
    });
  }

  /* 4. Clients marquee */
  const track = document.getElementById('clients-track');
  if (track) {
    if (!clients.length) { track.closest('.clients-section')?.style.setProperty('display','none'); }
    else {
      const renderItem = c => `<div class="client-item">${c.logo ? `<img class="client-logo" src="${c.logo}" alt="${c.name}">` : '<span class="client-logo" style="font-family:var(--font-display);font-size:18px;font-weight:600;color:#444">'+c.name.slice(0,1)+'</span>'}<span class="client-name">${c.name}</span></div>`;
      const html = clients.map(renderItem).join('');
      track.innerHTML = html + html;
    }
  }

  /* 5. Témoignages */
  const tmsGrid = document.getElementById('testimonials-grid');
  if (tmsGrid) {
    if (!tms.length) { tmsGrid.closest('.testimonials')?.style.setProperty('display','none'); }
    else {
      tmsGrid.innerHTML = tms.map(t => {
        const stars = '★'.repeat(t.stars||5);
        const photo = t.photo ? `<img class="testimonial-photo" src="${t.photo}" alt="${t.name}">` : `<div class="testimonial-photo"></div>`;
        const verify = t.linkedIn ? `<a href="${t.linkedIn}" class="testimonial-verify" target="_blank" rel="noopener">✓ Vérifiable LinkedIn</a>` : '';
        return `<div class="testimonial-card reveal"><div class="testimonial-stars">${stars}</div><p class="testimonial-text">"${t.text}"</p><div class="testimonial-author">${photo}<div><div class="testimonial-name">${t.name}</div><div class="testimonial-role">${t.role}${t.company ? ', '+t.company : ''}</div>${verify}</div></div></div>`;
      }).join('');
    }
  }

  /* 6. Footer dynamique */
  if (fd) {
    const bl = document.getElementById('footer-baseline'); if (bl && fd.baseline) bl.textContent = fd.baseline;
    const cp = document.getElementById('footer-copy');     if (cp && fd.copy)     cp.textContent = fd.copy;
    const li = document.getElementById('footer-links-dynamic');
    if (li && fd.columns?.[0]?.links) {
      li.innerHTML = fd.columns[0].links.map(l => `<li><a href="${l.url}">${l.icon ? l.icon+' ' : ''}${l.label}</a></li>`).join('');
    }
  }

  /* 7. Contenu de page dynamique */
  if (pc) {
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.innerHTML = val.replace(/\n/g,'<br>'); };
    set('hero-title-dynamic', pc.hero_title); set('hero-sub-dynamic', pc.hero_sub);
    set('manifeste-quote-dynamic', pc.manifeste_quote); set('manifeste-body-dynamic', pc.manifeste_body);
    set('cta-title-dynamic', pc.cta_title); set('cta-sub-dynamic', pc.cta_sub);
  }
})();

/* ══ FLOATING LABELS ══ */
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.form-group input,.form-group textarea').forEach(f=>{
    const check=()=>f.classList.toggle('filled',f.value.trim()!=='');
    f.addEventListener('input',check);f.addEventListener('blur',check);
  });
});
