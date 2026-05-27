/* ============ FICHIER : js/blog.js — Class S v2 ============ */
'use strict';
(async function() {
  const grid = document.getElementById('blog-page-grid');
  if (!grid) return;
  let posts;
  try {
    const FB = await (window._fbReady || Promise.resolve(null));
    if (FB) {
      const data = await FB.load('posts');
      posts = data || [];
    } else { throw new Error('no FB'); }
  } catch {
    posts = [];
  }
  grid.innerHTML = posts.length
    ? posts.map(p => window.ClassS.renderBlogCard(p)).join('')
    : '<p style="color:#444;font-size:15px;text-align:center;padding:80px 0;grid-column:1/-1">Les articles arrivent bientôt.</p>';
  requestAnimationFrame(() => {
    grid.querySelectorAll('.blog-card').forEach((c,i) => {
      c.style.opacity='0';c.style.transform='translateY(18px)';
      c.style.transition='opacity .5s ease,transform .5s ease';
      setTimeout(()=>{c.style.opacity='1';c.style.transform='translateY(0)'},i*90);
    });
  });
})();
