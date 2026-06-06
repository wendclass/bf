/* ============================================================
   js/works.js — Class S
   Projets : miniature + description + lien Behance
   Lit depuis Firestore via window.FB (firebase-init.js)
============================================================ */
(async function initWorks() {
  var grid = document.getElementById('works-page-grid');
  if (!grid) return;

  var projects = [];
  try {
    if (window.FB) {
      var data = await window.FB.load('projects');
      projects = data || [];
    }
  } catch (e) {
    console.warn('[Works] Firestore indisponible:', e);
  }

  var categories = ['Tout'];
  projects.forEach(function (p) {
    if (p.category && categories.indexOf(p.category) === -1) categories.push(p.category);
  });

  var filtersEl = document.getElementById('works-page-filters');
  if (filtersEl && categories.length > 1) {
    filtersEl.innerHTML = categories.map(function (cat) {
      return '<button class="filter-pill' + (cat === 'Tout' ? ' active' : '') +
             '" data-filter="' + cat + '">' + cat + '</button>';
    }).join('');
    filtersEl.querySelectorAll('.filter-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        filtersEl.querySelectorAll('.filter-pill').forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        render(pill.dataset.filter);
      });
    });
  }

  function imgTag(thumb, title) {
    if (!thumb) {
      return '<div style="width:100%;height:220px;background:linear-gradient(135deg,#6600CC,#1a1a1a);border-radius:4px 4px 0 0;display:flex;align-items:center;justify-content:center"><span style="font-size:40px;opacity:.3">&#10022;</span></div>';
    }
    return '<img src="' + thumb + '" alt="' + title + '" loading="lazy" style="width:100%;height:220px;object-fit:cover;display:block;border-radius:4px 4px 0 0">';
  }

  function renderCard(p) {
    var thumb = p.thumbnail || (p.images && p.images[0]) || p.image || '';
    var behanceBtn = p.behance
      ? '<a href="' + p.behance + '" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;margin-top:14px;color:#6600CC;font-size:13px;text-decoration:none;border-bottom:1px solid rgba(102,0,204,.3);padding-bottom:2px">Voir sur Behance \u2192</a>'
      : '';
    return '<article style="background:#111;border:1px solid #1e1e1e;border-radius:4px;overflow:hidden;display:flex;flex-direction:column">' +
      imgTag(thumb, p.title) +
      '<div style="padding:16px 18px 20px;flex:1;display:flex;flex-direction:column">' +
        '<span style="font-size:11px;color:#6600CC;letter-spacing:.08em;text-transform:uppercase">' +
          (p.category || '') + (p.year ? ' \u00b7 ' + p.year : '') +
        '</span>' +
        '<h3 style="font-family:var(--font-display);font-size:18px;color:#fff;margin:6px 0 8px;font-weight:600">' + p.title + '</h3>' +
        '<p style="font-size:13px;color:#777;line-height:1.7;flex:1">' + (p.description || '') + '</p>' +
        behanceBtn +
      '</div></article>';
  }

  function render(filterCat) {
    var filtered = filterCat === 'Tout'
      ? projects
      : projects.filter(function (p) { return p.category === filterCat; });
    if (!filtered.length) {
      grid.innerHTML = '<p style="color:#444;font-size:15px;text-align:center;padding:80px 0;grid-column:1/-1">' +
        (filterCat === 'Tout' ? 'Les projets arrivent bient\u00f4t.' : 'Aucun projet dans cette cat\u00e9gorie.') +
        '</p>';
      return;
    }
    grid.innerHTML = filtered.map(renderCard).join('');
  }

  render('Tout');
})();
