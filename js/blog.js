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
      posts = data || window.ClassS.getDefaultPosts();
    } else { throw new Error('no FB'); }
  } catch {
    posts = window.ClassS.getDefaultPosts();
  }
  grid.innerHTML = posts.length
    ? posts.map(p => window.ClassS.renderBlogCard(p)).join('')
    : '<p style="color:#888;grid-column:1/-1;text-align:center;padding:60px 0;">Aucun article disponible.</p>';
  requestAnimationFrame(() => {
    grid.querySelectorAll('.blog-card').forEach((c,i) => {
      c.style.opacity='0';c.style.transform='translateY(18px)';
      c.style.transition='opacity .5s ease,transform .5s ease';
      setTimeout(()=>{c.style.opacity='1';c.style.transform='translateY(0)'},i*90);
    });
  });
})();
