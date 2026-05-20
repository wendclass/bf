/* ============ FICHIER : js/analytics.js — Class S v2 ============ */
'use strict';

(function Analytics() {
  const KEY = 'cs_analytics';
  const CLICK_KEY = 'cs_clicks';
  const VISITOR_KEY = 'cs_visitor_id';

  /* ── Visitor UUID ── */
  function getVisitorId() {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  }

  /* ── Page name from path ── */
  function pageName() {
    const p = location.pathname.split('/').pop() || 'index.html';
    const map = {
      'index.html':'Accueil','':'Accueil','works.html':'Projets',
      'blog.html':'Blog','article.html':'Article','contact.html':'Contact',
      'about.html':'À propos','services.html':'Services','404.html':'404'
    };
    return map[p] || p;
  }

  /* ── Load / save data ── */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  /* ── Record page view ── */
  function recordView() {
    const d = load();
    const today = new Date().toISOString().split('T')[0];
    const page = pageName();
    const vid = getVisitorId();

    // Total views
    d.totalViews = (d.totalViews || 0) + 1;

    // Per-page views
    if (!d.pages) d.pages = {};
    d.pages[page] = (d.pages[page] || 0) + 1;

    // Daily data
    if (!d.daily) d.daily = {};
    if (!d.daily[today]) d.daily[today] = { views: 0, visitors: [] };
    d.daily[today].views++;
    if (!d.daily[today].visitors.includes(vid)) {
      d.daily[today].visitors.push(vid);
    }

    // Session tracking
    const sessionKey = 'cs_session_' + today;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      d.uniqueSessions = (d.uniqueSessions || 0) + 1;
    }

    // Referrer
    if (document.referrer && !document.referrer.includes(location.hostname)) {
      if (!d.referrers) d.referrers = {};
      try {
        const ref = new URL(document.referrer).hostname;
        d.referrers[ref] = (d.referrers[ref] || 0) + 1;
      } catch {}
    }

    // Device type
    if (!d.devices) d.devices = { desktop: 0, mobile: 0, tablet: 0 };
    const ua = navigator.userAgent;
    if (/tablet|ipad/i.test(ua)) d.devices.tablet++;
    else if (/mobile|android|iphone/i.test(ua)) d.devices.mobile++;
    else d.devices.desktop++;

    // Last seen
    d.lastSeen = new Date().toISOString();

    save(d);
  }

  /* ── Track time on page ── */
  const pageStart = Date.now();
  window.addEventListener('beforeunload', () => {
    const d = load();
    const secs = Math.round((Date.now() - pageStart) / 1000);
    if (!d.avgDuration) d.avgDuration = [];
    d.avgDuration.push(secs);
    if (d.avgDuration.length > 200) d.avgDuration = d.avgDuration.slice(-200);
    save(d);
  });

  /* ── Track CTA clicks ── */
  function loadClicks() {
    try { return JSON.parse(localStorage.getItem(CLICK_KEY)) || {}; }
    catch { return {}; }
  }
  function saveClicks(c) { localStorage.setItem(CLICK_KEY, JSON.stringify(c)); }

  function trackClicks() {
    const selectors = '[data-track], .cta-text, .cta-ghost, .cta-solid, .cta-solid-white, .cta-arrow, .cta-pulse, .btn-download';
    document.querySelectorAll(selectors).forEach(el => {
      el.addEventListener('click', () => {
        const label = el.dataset.track || el.textContent.trim().slice(0, 40) || 'CTA';
        const c = loadClicks();
        c[label] = (c[label] || 0) + 1;
        saveClicks(c);
      });
    });
  }

  /* ── Expose to global ── */
  window.CS_Analytics = {
    getData: load,
    getClicks: loadClicks,
    exportCSV() {
      const d = load();
      const rows = [['Date', 'Vues', 'Visiteurs uniques']];
      const daily = d.daily || {};
      Object.keys(daily).sort().forEach(date => {
        rows.push([date, daily[date].views, daily[date].visitors.length]);
      });
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cs-analytics-' + new Date().toISOString().split('T')[0] + '.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    },
    reset() { localStorage.removeItem(KEY); localStorage.removeItem(CLICK_KEY); }
  };

  /* ── Init ── */
  recordView();
  document.addEventListener('DOMContentLoaded', trackClicks);
})();
