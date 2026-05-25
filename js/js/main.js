/* ============ js/main.js — Class S v3 ============ */
'use strict';

/* ══ DEFAULT DATA (identical to v2) ══ */
function getDefaultPosts(){return[{id:'001',title:'Pourquoi votre logo ne suffit pas à faire une marque',category:'Branding',date:'12 janvier 2025',time:'09:00',excerpt:"Un logo, c'est une signature. Une marque, c'est une promesse tenue dans le temps.",cover:'',coverGradient:'linear-gradient(135deg,#6600CC 0%,#0A0A0A 100%)',hashtags:['branding','identité visuelle'],authorId:'scott',content:`<p>Quand un entrepreneur me dit <strong>« j'ai besoin d'un logo »</strong>, je l'entends souvent dire autre chose : j'ai besoin qu'on me prenne au sérieux.</p><p>Et c'est exactement là que commence la confusion — parce qu'un logo, aussi bien conçu soit-il, ne peut pas porter tout ça seul.</p><h2>Le logo : une signature, pas une promesse</h2><p>Votre logo est la partie visible de quelque chose de beaucoup plus grand. C'est la pointe de l'iceberg. En dessous se trouvent vos valeurs, votre ton de communication, vos couleurs et la façon dont vous répondez à un client.</p><p>Une marque, c'est ce que les gens <strong>ressentent</strong> quand ils pensent à vous. Pas ce qu'ils voient.</p><h2>Les marques qui durent ont une âme</h2><p>Regardez les marques que vous admirez. Ce n'est pas leur logo qui vous touche — c'est la cohérence de tout ce qu'elles font.</p><ul><li>Un logo sans charte graphique, c'est un nom sans visage</li><li>Une charte sans stratégie, c'est un visage sans personnalité</li><li>Une stratégie sans exécution, c'est une personnalité sans corps</li></ul><p>Chez Class S, quand nous travaillons sur une identité visuelle, nous ne dessinons pas un logo. Nous construisons un système.</p>`},{id:'002',title:'Le design premium est-il accessible aux PME africaines ?',category:'Stratégie',date:'28 janvier 2025',time:'10:30',excerpt:"La question revient souvent dans nos conversations. Et notre réponse est oui.",cover:'',coverGradient:'linear-gradient(135deg,#330066 0%,#1a0033 100%)',hashtags:['design','PME','Afrique'],authorId:'scott',content:`<p>La question revient souvent : <strong>« Le design de qualité, c'est réservé aux grandes entreprises, non ? »</strong></p><p>Non. Et cette idée reçue coûte cher aux PME africaines qui la croient.</p><h2>Le premium n'est pas un budget, c'est une intention</h2><p>Quand nous parlons de design premium, nous ne parlons pas de facturer dix fois plus. Nous parlons d'une approche : penser avant de dessiner. Comprendre avant de créer.</p><ul><li>Un mauvais design coûte plus cher sur la durée</li><li>Votre client ressent le design sans pouvoir l'expliquer</li></ul><p>Chez Class S, nous avons construit une offre pensée pour la réalité des entreprises burkinabè.</p>`},{id:'003',title:'3 erreurs de charte graphique que font les startups',category:'Design',date:'10 février 2025',time:'08:00',excerpt:"Nous les voyons partout. Trois erreurs qui trahissent une marque avant même qu'elle parle.",cover:'',coverGradient:'linear-gradient(135deg,#111111 0%,#2d0066 100%)',hashtags:['charte graphique','startup','erreurs'],authorId:'scott',content:`<p>Trois erreurs reviennent systématiquement dans les chartes graphiques des startups.</p><h2>Erreur 1 : Trop de couleurs</h2><p>Une charte solide repose sur <strong>2 à 3 couleurs maximum</strong>.</p><h2>Erreur 2 : Typographies sans cohérence</h2><p>La règle d'or : une police display et une police de corps. Maximum deux familles.</p><h2>Erreur 3 : Ignorer les déclinaisons</h2><p>Une charte qui ne fonctionne que sur fond blanc, ce n'est pas une charte.</p><ul><li>Tester la lisibilité sur mobile</li><li>Vérifier le rendu en noir et blanc</li><li>Penser favicon dès le début</li></ul>`}]}
function getDefaultProjects(){return[{id:'p001',title:'Koulba Coffee',category:'Identité Visuelle',year:'2024',month:'Mars',description:"Une torréfaction artisanale de Bobo-Dioulasso qui voulait exister sur les marchés premium. Nous avons créé une identité café-cuir-or.",image:'',gradient:'linear-gradient(135deg,#6600CC 0%,#0A0A0A 100%)'},{id:'p002',title:'Festival Sahel Sounds',category:'Direction Artistique',year:'2024',month:'Juillet',description:"Direction artistique complète du festival : affiche principale, déclinaisons digitales, scénographie visuelle.",image:'',gradient:'linear-gradient(135deg,#330066 0%,#1a0033 100%)'},{id:'p003',title:'Yiré Studio',category:'Branding',year:'2025',month:'Janvier',description:"Studio de couture contemporain ouagalais. Identité entre tradition africaine et minimalisme européen.",image:'',gradient:'linear-gradient(135deg,#111111 0%,#2d0066 100%)'},{id:'p004',title:'Wend-Yam ONG',category:'Design Éditorial',year:'2024',month:'Octobre',description:"Rapport annuel d'activités, charte de communication pour une ONG d'agriculture familiale.",image:'',gradient:'linear-gradient(135deg,#1a0033 0%,#0a0a0a 100%)'},{id:'p005',title:'Class S',category:'Identité Visuelle',year:'2024',month:'Août',description:"Notre propre identité. Violet Impérial, Cormorant Garamond. L'exercice le plus exigeant.",image:'',gradient:'linear-gradient(135deg,#6600CC 0%,#330066 100%)'},{id:'p006',title:'Saponé Roots',category:'Branding',year:'2025',month:'Février',description:"Valorisation d'un artisanat local. Tissu, terre, identité. Une marque qui porte une géographie.",image:'',gradient:'linear-gradient(135deg,#2d0066 0%,#0a0a0a 100%)'}]}
function getDefaultServices(){return[{id:'s1',icon:'✦',title:'Identité Visuelle',text:"Logo, charte graphique, typographie, couleurs. Tout ce qui fait qu'on vous reconnaît — même sans lire votre nom."},{id:'s2',icon:'◈',title:'Direction Artistique',text:"Nous pilotons l'esthétique globale de vos campagnes, shootings et contenus digitaux pour qu'ils forment un tout cohérent."},{id:'s3',icon:'◎',title:'Design Éditorial',text:"Affiches, brochures, rapports, supports print et digital. Des pièces qui ont du poids — dans les mains et dans les esprits."}]}
function getDefaultClients(){return[{id:'c1',name:'Koulba Coffee',logo:''},{id:'c2',name:'Sahel Sounds',logo:''},{id:'c3',name:'Yiré Studio',logo:''},{id:'c4',name:'Wend-Yam ONG',logo:''}]}
function getDefaultTestimonials(){return[{id:'t1',text:"Class S a transformé l'image de notre torréfaction. Nos clients nous reconnaissent maintenant au premier coup d'œil.",name:'Amadou Koulba',role:'CEO',company:'Koulba Coffee',stars:5,photo:'',linkedIn:''},{id:'t2',text:"Un travail d'une précision remarquable. Scott a su capturer l'essence de notre festival en quelques traits.",name:'Raïssa Sawadogo',role:'Directrice',company:'Sahel Sounds',stars:5,photo:'',linkedIn:''},{id:'t3',text:"Notre identité de marque a gagné en cohérence et en professionnalisme. Nos clients le remarquent.",name:'Issa Traoré',role:'Fondateur',company:'Yiré Studio',stars:5,photo:'',linkedIn:''}]}
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
    const FB = await (window._fbReady || Promise.resolve(null));
    if (FB) {
      const data = await FB.loadAll(['posts','services','clients','testimonials','footer','pageContent']);
      posts   = data.posts        || getDefaultPosts();
      svcs    = data.services     || getDefaultServices();
      clients = data.clients      || getDefaultClients();
      tms     = data.testimonials || getDefaultTestimonials();
      fd      = data.footer       || null;
      pc      = data.pageContent  || null;
    } else { throw new Error('no FB'); }
  } catch {
    posts   = getDefaultPosts();
    svcs    = getDefaultServices();
    clients = getDefaultClients();
    tms     = getDefaultTestimonials();
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
    // Appliquer le logo depuis Firestore si défini
    if (pc.logo) { localStorage.setItem('cs_logo', pc.logo); applyLogo(pc.logo); }
  }
})();

/* ══ FLOATING LABELS ══ */
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.form-group input,.form-group textarea').forEach(f=>{
    const check=()=>f.classList.toggle('filled',f.value.trim()!=='');
    f.addEventListener('input',check);f.addEventListener('blur',check);
  });
});
