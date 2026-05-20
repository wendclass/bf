/* ============ FICHIER : js/works.js — Class S v2 ============ */
'use strict';

(function initWorks() {
  const grid = document.getElementById('works-page-grid');
  const pills = document.querySelectorAll('.filter-pill');
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('project-modal-close');
  if (!grid) return;

  let projects = [];
  let currentIndex = 0;
  let filtered = [];

  function load() {
    try { projects = JSON.parse(localStorage.getItem('cs_projects')) || window.ClassS.getDefaultProjects(); }
    catch { projects = window.ClassS.getDefaultProjects(); }
  }

  function renderCard(p, idx) {
    const bg = p.image
      ? `background-image:url('${p.image}');background-size:cover;background-position:center;`
      : `background:${p.gradient||'linear-gradient(135deg,#6600CC,#0A0A0A)'};`;
    return `
      <article class="work-page-card" data-category="${p.category}" data-idx="${idx}" role="button" tabindex="0" aria-label="Voir ${p.title}">
        <div class="work-page-card-bg" style="${bg}"></div>
        <div class="work-page-overlay">
          <div class="work-page-icon" aria-hidden="true">→</div>
        </div>
        <div class="work-page-info">
          <h3 class="work-page-title">${p.title}</h3>
          <p class="work-page-meta">${p.category} · ${p.month ? p.month + ' ' : ''}${p.year}</p>
        </div>
      </article>`;
  }

  function render(filterCat) {
    load();
    filtered = filterCat === 'Tout' ? [...projects] : projects.filter(p => p.category === filterCat);
    if (!filtered.length) {
      grid.innerHTML = '<p style="color:#888;grid-column:1/-1;text-align:center;padding:60px 0;">Aucun projet dans cette catégorie.</p>';
      return;
    }
    grid.innerHTML = filtered.map((p, i) => renderCard(p, i)).join('');

    // Animate cards
    requestAnimationFrame(() => {
      grid.querySelectorAll('.work-page-card').forEach((c, i) => {
        c.style.opacity = '0';
        c.style.transform = 'translateY(16px)';
        c.style.transition = 'opacity .4s ease, transform .4s ease';
        setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'translateY(0)'; }, i * 80);
      });
    });

    // Bind clicks
    grid.querySelectorAll('.work-page-card').forEach(card => {
      card.addEventListener('click', () => openModal(parseInt(card.dataset.idx)));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(parseInt(card.dataset.idx)); });
    });
  }

  /* ── Modal ── */
  function openModal(idx) {
    if (!modal) return;
    currentIndex = idx;
    const p = filtered[idx];
    if (!p) return;

    const cover = modal.querySelector('#modal-cover');
    if (cover) {
      if (p.image) {
        cover.style.backgroundImage = `url('${p.image}')`;
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
        cover.style.background = '';
      } else {
        cover.style.background = p.gradient || 'linear-gradient(135deg,#6600CC,#0A0A0A)';
        cover.style.backgroundImage = '';
      }
    }

    const setEl = (id, val) => { const el = modal.querySelector('#' + id); if (el) el.textContent = val || ''; };
    setEl('modal-meta', `${p.category} · ${p.month ? p.month + ' ' : ''}${p.year}`);
    setEl('modal-title', p.title);
    setEl('modal-desc', p.description || '');

    // Nav buttons
    const prevBtn = modal.querySelector('#modal-prev');
    const nextBtn = modal.querySelector('#modal-next');
    if (prevBtn) prevBtn.style.display = idx > 0 ? 'inline-flex' : 'none';
    if (nextBtn) nextBtn.style.display = idx < filtered.length - 1 ? 'inline-flex' : 'none';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Filters
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      render(pill.dataset.filter);
    });
  });

  // Modal controls
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal?.querySelector('#modal-prev')?.addEventListener('click', () => { if (currentIndex > 0) openModal(currentIndex - 1); });
  modal?.querySelector('#modal-next')?.addEventListener('click', () => { if (currentIndex < filtered.length - 1) openModal(currentIndex + 1); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  render('Tout');
})();
